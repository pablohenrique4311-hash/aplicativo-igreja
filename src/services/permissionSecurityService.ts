/**
 * Serviço de Segurança, Perfis e Controle de Acesso Baseado em Vínculos (RBAC/ABAC)
 * IGREJA GERAÇÃO ELEITA — IGEAD-MT
 *
 * Diretrizes:
 * 1. Perfis Institucionais: ADMINISTRADOR GERAL, LÍDER PASTORAL, MEMBRO, VISITANTE.
 * 2. Departamentos Oficiais: Homens, Mulheres, Jovens, Crianças, Mídia.
 * 3. Vínculos Independentes: Cada departamento possui vínculo autônomo com status (PENDENTE, ATIVO, ENCERRADO)
 *    e função (MEMBRO ou LÍDER).
 * 4. Um usuário pode liderar um departamento e ser membro de outros simultaneamente.
 * 5. Líder departamental administra SOMENTE o departamento que lidera ativamente.
 * 6. Membros acessam dados internos e chat apenas onde possuem vínculo ATIVO.
 * 7. Encerrar vínculo revoga imediatamente acessos e chat, preservando conta e demais vínculos.
 * 8. Proteção reforçada a menores do Grupo de Crianças.
 * 9. Registro de auditoria rigoroso de todas as operações administrativas.
 */

import {
  User,
  DepartmentId,
  DepartmentMembership,
  AuditLogEntry,
  AuditActionType,
  ChildRecord
} from '../types';

/**
 * Verifica se o usuário tem permissão para administrar um departamento específico:
 * - Administrador Geral: Acesso global irrestrito
 * - Líder Pastoral: Acesso pastoral institucional
 * - Líder do Departamento: SOMENTE se possuir vínculo oficial ATIVO com role 'LÍDER' naquele departamento
 */
export function canManageDepartment(
  user: User,
  departmentId: DepartmentId,
  memberships: DepartmentMembership[]
): boolean {
  if (!user) return false;

  // Administrador Geral e Pastor possuem acesso global autorizado
  if (user.role === 'admin' || user.role === 'pastor') {
    return true;
  }

  // Verifica se o usuário é o Líder Oficial Ativo deste departamento específico
  const activeLeaderLink = memberships.find(
    (m) =>
      m.userId === user.id &&
      m.departmentId === departmentId &&
      m.status === 'ATIVO' &&
      m.role === 'LÍDER'
  );

  return Boolean(activeLeaderLink);
}

/**
 * Verifica se o usuário pode acessar conteúdos internos restritos do departamento
 * (listas de integrantes, escalas detalhadas, atas, avisos internos)
 */
export function canAccessDepartmentInternalContent(
  user: User,
  departmentId: DepartmentId,
  memberships: DepartmentMembership[]
): boolean {
  if (!user) return false;

  // Admin e Pastor têm acesso institucional
  if (user.role === 'admin' || user.role === 'pastor') {
    return true;
  }

  // Membro ou Líder com vínculo ATIVO no departamento
  const activeMembership = memberships.find(
    (m) =>
      m.userId === user.id &&
      m.departmentId === departmentId &&
      m.status === 'ATIVO'
  );

  return Boolean(activeMembership);
}

/**
 * Verifica se o usuário pode participar e enviar mensagens no chat do departamento:
 * Requer vínculo ATIVO no departamento (ou perfil Admin/Pastor)
 */
export function canParticipateInChat(
  user: User,
  departmentId: DepartmentId,
  memberships: DepartmentMembership[]
): boolean {
  return canAccessDepartmentInternalContent(user, departmentId, memberships);
}

/**
 * Verifica se o usuário pode designar ou alterar o líder oficial de um departamento.
 * Competência exclusiva do Administrador Geral e do Líder Pastoral.
 * Líderes departamentais NÃO PODEM designar outros líderes.
 */
export function canAssignDepartmentLeader(user: User): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'pastor';
}

/**
 * Verifica se o usuário pode alterar cargos institucionais (Admin, Pastor, Membro, Visitante).
 * Competência exclusiva do Administrador Geral.
 */
export function canChangeInstitutionalRole(user: User): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

/**
 * Verifica se o usuário pode gerenciar (enviar, substituir, remover) a logo oficial da igreja.
 * Restrito exclusivamente ao Administrador Geral.
 */
export function canManageChurchLogo(user: User): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

/**
 * Verifica se o usuário pode atualizar a foto de perfil.
 * Cada usuário pode alterar exclusivamente sua própria foto (ou Administrador Geral).
 */
export function canUpdateUserAvatar(actor: User, targetUserId: string): boolean {
  if (!actor || !targetUserId) return false;
  return actor.id === targetUserId || actor.role === 'admin';
}

/**
 * Validação de arquivos de imagem (PNG, JPG, WEBP e tamanho máximo)
 */
export function validateImageFile(
  file: { type: string; size: number; name: string },
  maxSizeMb: number = 5
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Nenhum arquivo selecionado.' };
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedExtensions = ['png', 'jpg', 'jpeg', 'webp'];

  const isTypeValid = allowedTypes.includes(file.type.toLowerCase()) || allowedExtensions.includes(ext);

  if (!isTypeValid) {
    return {
      valid: false,
      error: 'Formato de arquivo inválido. Por favor, envie uma imagem nos formatos PNG, JPG ou WEBP.'
    };
  }

  const maxSizeBytes = maxSizeMb * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `O arquivo selecionado (${(file.size / (1024 * 1024)).toFixed(2)} MB) excede o limite máximo permitido de ${maxSizeMb} MB.`
    };
  }

  return { valid: true };
}

/**
 * Verifica se o usuário pode acessar relatórios financeiros globais (Dízimos e Ofertas).
 * Restrito ao Administrador Geral e Líder Pastoral.
 * Líderes de departamento e membros NÃO possuem acesso a dados financeiros globais.
 */
export function canAccessFinancialReports(user: User): boolean {
  if (!user) return false;
  return user.role === 'admin' || user.role === 'pastor';
}

/**
 * Proteção Reforçada a Menores (Grupo de Crianças):
 * Permite visualizar dados médicos, alergias e PIN de segurança da criança SOMENTE se:
 * - For Administrador Geral ou Pastor
 * - For o Líder Oficial Ativo do Grupo de Crianças
 * - For o próprio responsável legal cadastrado daquela criança específica
 */
export function canViewChildSensitiveData(
  user: User,
  child: ChildRecord,
  memberships: DepartmentMembership[]
): boolean {
  if (!user) return false;

  if (user.role === 'admin' || user.role === 'pastor') {
    return true;
  }

  // Líder ativo do Grupo de Crianças
  const isKidsLeader = memberships.some(
    (m) =>
      m.userId === user.id &&
      m.departmentId === 'criancas' &&
      m.status === 'ATIVO' &&
      m.role === 'LÍDER'
  );
  if (isKidsLeader) return true;

  // Responsável legal cadastrado (pelo telefone ou nome)
  const isParent =
    (child.parentPhone && user.phone && child.parentPhone.replace(/\D/g, '') === user.phone.replace(/\D/g, '')) ||
    (child.parentName && child.parentName.toLowerCase().trim() === user.name.toLowerCase().trim());

  return Boolean(isParent);
}

/**
 * Verifica se o usuário pode encerrar o vínculo de um integrante:
 * - Admin ou Pastor
 * - Líder ativo do departamento afetado
 * - O próprio usuário saindo do departamento
 */
export function canEndMembership(
  actor: User,
  targetMembership: DepartmentMembership,
  memberships: DepartmentMembership[]
): boolean {
  if (!actor || !targetMembership) return false;

  if (actor.role === 'admin' || actor.role === 'pastor') {
    return true;
  }

  // O próprio usuário encerrando seu próprio vínculo
  if (actor.id === targetMembership.userId) {
    return true;
  }

  // Líder ativo do departamento
  const isDeptLeader = memberships.some(
    (m) =>
      m.userId === actor.id &&
      m.departmentId === targetMembership.departmentId &&
      m.status === 'ATIVO' &&
      m.role === 'LÍDER'
  );

  return isDeptLeader;
}

/**
 * Helper para criar entrada no Log de Auditoria
 */
export function createAuditLog(
  actor: User,
  action: AuditActionType,
  details: string,
  status: 'SUCCESS' | 'DENIED' = 'SUCCESS',
  departmentId?: DepartmentId,
  targetId?: string,
  targetName?: string
): AuditLogEntry {
  return {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date().toLocaleString('pt-BR'),
    actorId: actor?.id || 'anonymous',
    actorName: actor?.name || 'Não identificado',
    actorRole: actor ? getDisplayRole(actor) : 'Desconhecido',
    action,
    departmentId,
    targetId,
    targetName,
    details,
    status
  };
}

/**
 * Retorna o título legível do perfil do usuário para exibição e auditoria
 */
export function getDisplayRole(user: User): string {
  switch (user.role) {
    case 'admin':
      return 'ADMINISTRADOR GERAL';
    case 'pastor':
      return 'LÍDER PASTORAL';
    case 'leader_ministry':
      return 'LÍDER DE DEPARTAMENTO';
    case 'leader_cell':
      return 'LÍDER DE GRUPO/CÉLULA';
    case 'volunteer':
      return 'VOLUNTÁRIO';
    case 'member':
      return 'MEMBRO';
    case 'visitor':
      return 'VISITANTE';
    default:
      return 'MEMBRO';
  }
}
