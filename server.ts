import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import {
  DepartmentId,
  DepartmentRole,
  MembershipStatus,
  UserRole,
  DepartmentMembership,
  DepartmentChatMessage,
  AuditLogEntry
} from './src/types';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENTS,
  INITIAL_DEPARTMENT_MEMBERSHIPS,
  INITIAL_DEPARTMENT_CHATS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CHURCH_SETTINGS
} from './src/data/initialData';
import {
  canManageDepartment,
  canAccessDepartmentInternalContent,
  canParticipateInChat,
  canAssignDepartmentLeader,
  canChangeInstitutionalRole,
  canAccessFinancialReports,
  canEndMembership,
  canManageChurchLogo,
  canUpdateUserAvatar,
  createAuditLog
} from './src/services/permissionSecurityService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory persistent database store initialized with initial data
let dbUsers = [...INITIAL_USERS];
let dbMemberships: DepartmentMembership[] = [...INITIAL_DEPARTMENT_MEMBERSHIPS];
let dbChats: Record<DepartmentId, DepartmentChatMessage[]> = { ...INITIAL_DEPARTMENT_CHATS };
let dbAuditLogs: AuditLogEntry[] = [...INITIAL_AUDIT_LOGS];
let dbChurchSettings = { ...INITIAL_CHURCH_SETTINGS };

export function getDb() {
  return {
    users: dbUsers,
    memberships: dbMemberships,
    chats: dbChats,
    auditLogs: dbAuditLogs,
    churchSettings: dbChurchSettings
  };
}

export function resetDb() {
  dbUsers = [...INITIAL_USERS];
  dbMemberships = [...INITIAL_DEPARTMENT_MEMBERSHIPS];
  dbChats = { ...INITIAL_DEPARTMENT_CHATS };
  dbAuditLogs = [...INITIAL_AUDIT_LOGS];
  dbChurchSettings = { ...INITIAL_CHURCH_SETTINGS };
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Middleware de Autenticação e Resolução de Identidade:
 * Obtém o usuário a partir do cabeçalho `x-user-id` (ou query `userId`)
 */
function authenticateUser(req: express.Request, res: express.Response, next: express.NextFunction) {
  const userId = (req.headers['x-user-id'] as string) || (req.query.userId as string) || 'user-leader-midia';
  const user = dbUsers.find((u) => u.id === userId);

  if (!user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Identidade de usuário não encontrada ou inválida.'
    });
  }

  (req as any).authenticatedUser = user;
  next();
}

// ============================================================================
// ROTAS DE API DE SEGURANÇA E GOVERNANÇA (BACKEND REAL)
// ============================================================================

// 1. Health check & current user info
app.get('/api/auth/me', authenticateUser, (req, res) => {
  const user = (req as any).authenticatedUser;
  const userMemberships = dbMemberships.filter(
    (m) => m.userId === user.id && m.status === 'ATIVO'
  );

  res.json({
    user,
    activeMemberships: userMemberships,
    canAccessAdmin: user.role === 'admin' || user.role === 'pastor' || userMemberships.some((m) => m.role === 'LÍDER')
  });
});

// 2. Lista Departamentos
app.get('/api/departments', (req, res) => {
  res.json({
    departments: INITIAL_DEPARTMENTS,
    total: INITIAL_DEPARTMENTS.length
  });
});

// 3. Integrantes de um departamento (Acesso restrito a integrantes com vínculo ativo ou Admin/Pastor)
app.get('/api/departments/:id/members', authenticateUser, (req, res) => {
  const deptId = req.params.id as DepartmentId;
  const user = (req as any).authenticatedUser;

  // Validação Real no Backend
  if (!canAccessDepartmentInternalContent(user, deptId, dbMemberships)) {
    const audit = createAuditLog(
      user,
      'SECURITY_VIOLATION_BLOCKED',
      `Tentativa de consultar integrantes internos do '${deptId}' via API sem vínculo ativo.`,
      'DENIED',
      deptId
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_DEPARTMENT_ACCESS',
      message: `Acesso negado: Você não possui vínculo ativo no departamento '${deptId}'.`
    });
  }

  const members = dbMemberships.filter(
    (m) => m.departmentId === deptId && m.status === 'ATIVO'
  );
  res.json({ departmentId: deptId, members });
});

// 4. Adicionar integrante ao departamento (Somente líder ativo do departamento, Admin ou Pastor)
app.post('/api/departments/:id/members', authenticateUser, (req, res) => {
  const deptId = req.params.id as DepartmentId;
  const actor = (req as any).authenticatedUser;
  const { targetUserId, role = 'MEMBRO' } = req.body;

  // Validação de Liderança Departamental
  if (!canManageDepartment(actor, deptId, dbMemberships)) {
    const audit = createAuditLog(
      actor,
      'SECURITY_VIOLATION_BLOCKED',
      `Tentativa de adicionar integrante no '${deptId}' via API sem autorização de liderança.`,
      'DENIED',
      deptId,
      targetUserId
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_LEADERSHIP_REQUIRED',
      message: `Acesso negado: Somente o líder ativo do departamento '${deptId}' pode adicionar integrantes.`
    });
  }

  // Se estiver tentando designar líder, requer autorização pastoral ou admin geral
  if (role === 'LÍDER' && !canAssignDepartmentLeader(actor)) {
    const audit = createAuditLog(
      actor,
      'ROLE_ELEVATION_BLOCKED',
      `Tentativa não autorizada de designar líder para '${deptId}' via API.`,
      'DENIED',
      deptId,
      targetUserId
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_LEADER_ASSIGNMENT',
      message: 'Apenas a Administração Geral ou Pastoral podem designar líderes departamentais.'
    });
  }

  const targetUser = dbUsers.find((u) => u.id === targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' });
  }

  // Atualiza ou cria vínculo
  const existing = dbMemberships.find(
    (m) => m.userId === targetUserId && m.departmentId === deptId
  );

  if (existing) {
    existing.status = 'ATIVO';
    existing.role = role as DepartmentRole;
    existing.joinedAt = new Date().toLocaleDateString('pt-BR');
    existing.endedAt = undefined;
  } else {
    const newMembership: DepartmentMembership = {
      id: `mem-${targetUserId}-${deptId}-${Date.now()}`,
      userId: targetUserId,
      userName: targetUser.name,
      userEmail: targetUser.email,
      departmentId: deptId,
      departmentName: deptId,
      status: 'ATIVO',
      role: role as DepartmentRole,
      joinedAt: new Date().toLocaleDateString('pt-BR')
    };
    dbMemberships.unshift(newMembership);
  }

  const audit = createAuditLog(
    actor,
    role === 'LÍDER' ? 'LEADER_ASSIGNED' : 'MEMBERSHIP_APPROVED',
    `Vínculo ativado para ${targetUser.name} no departamento '${deptId}' como ${role}.`,
    'SUCCESS',
    deptId,
    targetUserId,
    targetUser.name
  );
  dbAuditLogs.unshift(audit);

  res.json({ success: true, message: 'Integrante adicionado com sucesso.' });
});

// 5. Encerrar vínculo de integrante (Remoção segura que preserva conta e demais vínculos)
app.delete('/api/departments/:id/members/:targetUserId', authenticateUser, (req, res) => {
  const deptId = req.params.id as DepartmentId;
  const targetUserId = req.params.targetUserId;
  const actor = (req as any).authenticatedUser;

  const targetMembership = dbMemberships.find(
    (m) => m.departmentId === deptId && m.userId === targetUserId && m.status === 'ATIVO'
  );

  if (!targetMembership) {
    return res.status(404).json({ error: 'MEMBERSHIP_NOT_FOUND', message: 'Vínculo ativo não encontrado.' });
  }

  if (!canEndMembership(actor, targetMembership, dbMemberships)) {
    const audit = createAuditLog(
      actor,
      'SECURITY_VIOLATION_BLOCKED',
      `Tentativa de encerrar vínculo de terceiros no departamento '${deptId}' sem autorização.`,
      'DENIED',
      deptId,
      targetUserId,
      targetMembership.userName
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_REMOVAL',
      message: 'Acesso negado: Você não possui autorização para remover integrantes deste departamento.'
    });
  }

  // Encerra SOMENTE o vínculo deste departamento! Preserva a conta e os outros vínculos!
  const endedDate = new Date().toLocaleDateString('pt-BR');
  targetMembership.status = 'ENCERRADO';
  targetMembership.endedAt = endedDate;

  const audit = createAuditLog(
    actor,
    'MEMBERSHIP_ENDED',
    `Vínculo de ${targetMembership.userName} com o departamento '${deptId}' foi ENCERRADO. Conta e demais vínculos preservados.`,
    'SUCCESS',
    deptId,
    targetUserId,
    targetMembership.userName
  );
  dbAuditLogs.unshift(audit);

  res.json({
    success: true,
    message: `Vínculo de ${targetMembership.userName} com '${deptId}' encerrado. Conta preservada.`
  });
});

// 6. Chat do departamento: Leitura (Restrito a vínculos ativos ou Admin/Pastor)
app.get('/api/departments/:id/chat', authenticateUser, (req, res) => {
  const deptId = req.params.id as DepartmentId;
  const user = (req as any).authenticatedUser;

  if (!canParticipateInChat(user, deptId, dbMemberships)) {
    const audit = createAuditLog(
      user,
      'SECURITY_VIOLATION_BLOCKED',
      `Tentativa de ler mensagens do chat do '${deptId}' sem vínculo ativo.`,
      'DENIED',
      deptId
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_CHAT_READ',
      message: `Acesso negado: Você não possui vínculo ativo para ler o chat do departamento '${deptId}'.`
    });
  }

  const messages = dbChats[deptId] || [];
  res.json({ departmentId: deptId, messages });
});

// 7. Chat do departamento: Envio (Restrito a vínculos ativos ou Admin/Pastor)
app.post('/api/departments/:id/chat', authenticateUser, (req, res) => {
  const deptId = req.params.id as DepartmentId;
  const user = (req as any).authenticatedUser;
  const { content } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'EMPTY_CONTENT', message: 'Conteúdo da mensagem não pode ser vazio.' });
  }

  if (!canParticipateInChat(user, deptId, dbMemberships)) {
    const audit = createAuditLog(
      user,
      'SECURITY_VIOLATION_BLOCKED',
      `Tentativa de enviar mensagem no chat do '${deptId}' sem vínculo ativo.`,
      'DENIED',
      deptId
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_CHAT_POST',
      message: `Acesso negado: Você não possui vínculo ativo para postar no chat do departamento '${deptId}'.`
    });
  }

  const membership = dbMemberships.find(
    (m) => m.userId === user.id && m.departmentId === deptId && m.status === 'ATIVO'
  );

  let roleBadge = 'Membro';
  if (user.role === 'admin') roleBadge = 'Administração Geral';
  else if (user.role === 'pastor') roleBadge = 'Líder Pastoral';
  else if (membership?.role === 'LÍDER') roleBadge = 'Líder do Grupo';

  const newMsg: DepartmentChatMessage = {
    id: `msg-${deptId}-${Date.now()}`,
    departmentId: deptId,
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    userRoleBadge: roleBadge,
    content: content.trim(),
    createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    isLeaderMessage: membership?.role === 'LÍDER' || user.role === 'admin' || user.role === 'pastor',
    isSupervised: deptId === 'criancas'
  };

  if (!dbChats[deptId]) dbChats[deptId] = [];
  dbChats[deptId].push(newMsg);

  res.json({ success: true, message: newMsg });
});

// 8. Elevação de Cargo Institucional (Restrito exclusivamente a Administrador Geral)
app.post('/api/admin/change-role', authenticateUser, (req, res) => {
  const actor = (req as any).authenticatedUser;
  const { targetUserId, newRole } = req.body;

  if (!canChangeInstitutionalRole(actor)) {
    const audit = createAuditLog(
      actor,
      'ROLE_ELEVATION_BLOCKED',
      `Tentativa de alterar cargo institucional do usuário '${targetUserId}' para '${newRole}' via API.`,
      'DENIED',
      undefined,
      targetUserId
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_ADMIN_ONLY',
      message: 'Acesso negado: Somente a Administração Geral pode alterar cargos institucionais.'
    });
  }

  const target = dbUsers.find((u) => u.id === targetUserId);
  if (!target) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' });
  }

  target.role = newRole as UserRole;
  const audit = createAuditLog(
    actor,
    'MEMBERSHIP_ROLE_CHANGED',
    `Cargo institucional de ${target.name} alterado para '${newRole}'.`,
    'SUCCESS',
    undefined,
    targetUserId,
    target.name
  );
  dbAuditLogs.unshift(audit);

  res.json({ success: true, user: target });
});

// 9. Relatório Financeiro Global (Restrito a Admin Geral e Pastor)
app.get('/api/admin/financial-report', authenticateUser, (req, res) => {
  const actor = (req as any).authenticatedUser;

  if (!canAccessFinancialReports(actor)) {
    const audit = createAuditLog(
      actor,
      'FINANCIAL_ACCESS_BLOCKED',
      'Tentativa não autorizada de consultar relatório financeiro global via API.',
      'DENIED'
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_FINANCIAL_ACCESS',
      message: 'Acesso negado: Relatórios financeiros globais são restritos à Administração Geral e Pastoral.'
    });
  }

  res.json({
    totalEntradas: 15000.0,
    status: 'CONFORME_AUDITADO',
    periodo: '2026'
  });
});

// 10. Trilha de Auditoria (Audit Logs)
app.get('/api/audit-logs', authenticateUser, (req, res) => {
  const actor = (req as any).authenticatedUser;

  // Membros comuns sem liderança não podem auditar logs gerais
  const isLeader = dbMemberships.some(
    (m) => m.userId === actor.id && m.status === 'ATIVO' && m.role === 'LÍDER'
  );

  if (actor.role !== 'admin' && actor.role !== 'pastor' && !isLeader) {
    return res.status(403).json({
      error: 'FORBIDDEN_AUDIT_ACCESS',
      message: 'Acesso negado: Auditoria reservada a líderes oficiais e administração geral.'
    });
  }

  // Líder vê logs do seu departamento; admin e pastor veem todos
  if (actor.role === 'admin' || actor.role === 'pastor') {
    return res.json({ logs: dbAuditLogs });
  }

  const myDeptIds = dbMemberships
    .filter((m) => m.userId === actor.id && m.status === 'ATIVO' && m.role === 'LÍDER')
    .map((m) => m.departmentId);

  const filtered = dbAuditLogs.filter(
    (l) => l.departmentId && myDeptIds.includes(l.departmentId)
  );
  res.json({ logs: filtered });
});

// 11. Configurações da Igreja (Leitura pública das configurações e logo)
app.get('/api/church-settings', (req, res) => {
  res.json({ settings: dbChurchSettings });
});

// 12. Gestão da Logo Oficial da Igreja (Restrito exclusivamente a Administrador Geral)
app.post('/api/church-logo', authenticateUser, (req, res) => {
  const actor = (req as any).authenticatedUser;

  if (!canManageChurchLogo(actor)) {
    const audit = createAuditLog(
      actor,
      'SECURITY_VIOLATION_BLOCKED',
      'Tentativa não autorizada de alterar ou substituir a logo oficial da Igreja via API.',
      'DENIED'
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_ADMIN_ONLY',
      message: 'Acesso negado: Somente o Administrador Geral pode alterar a logo oficial da igreja.'
    });
  }

  const { logoDataUrl } = req.body;
  if (!logoDataUrl || typeof logoDataUrl !== 'string' || !logoDataUrl.trim()) {
    return res.status(400).json({
      error: 'INVALID_LOGO_DATA',
      message: 'Os dados da imagem da logo são obrigatórios e devem estar em formato válido.'
    });
  }

  // Preserva a logo anterior para eventual restauração
  dbChurchSettings.previousLogoUrl = dbChurchSettings.logoUrl;
  dbChurchSettings.logoUrl = logoDataUrl.trim();

  const audit = createAuditLog(
    actor,
    'CHURCH_LOGO_UPDATED',
    'Logo oficial da Igreja foi atualizada com sucesso pelo Administrador Geral.',
    'SUCCESS'
  );
  dbAuditLogs.unshift(audit);

  res.json({
    success: true,
    message: 'Logo oficial da Igreja atualizada com sucesso.',
    logoUrl: dbChurchSettings.logoUrl,
    previousLogoUrl: dbChurchSettings.previousLogoUrl
  });
});

app.delete('/api/church-logo', authenticateUser, (req, res) => {
  const actor = (req as any).authenticatedUser;

  if (!canManageChurchLogo(actor)) {
    const audit = createAuditLog(
      actor,
      'SECURITY_VIOLATION_BLOCKED',
      'Tentativa não autorizada de remover ou restaurar a logo oficial da Igreja via API.',
      'DENIED'
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_ADMIN_ONLY',
      message: 'Acesso negado: Somente o Administrador Geral pode remover ou restaurar a logo oficial.'
    });
  }

  const restorePrevious = req.query.restorePrevious === 'true' || (req.body && req.body.restorePrevious === true);

  if (restorePrevious && dbChurchSettings.previousLogoUrl) {
    dbChurchSettings.logoUrl = dbChurchSettings.previousLogoUrl;
  } else {
    dbChurchSettings.previousLogoUrl = dbChurchSettings.logoUrl;
    dbChurchSettings.logoUrl = '/logo-igead.svg';
  }

  const audit = createAuditLog(
    actor,
    'CHURCH_LOGO_REMOVED',
    restorePrevious
      ? 'Logo anterior da Igreja foi restaurada com sucesso.'
      : 'Logo personalizada da Igreja foi removida. Emblema vetorial oficial restaurado.',
    'SUCCESS'
  );
  dbAuditLogs.unshift(audit);

  res.json({
    success: true,
    message: restorePrevious ? 'Logo anterior restaurada.' : 'Logo oficial padrão restaurada.',
    logoUrl: dbChurchSettings.logoUrl,
    previousLogoUrl: dbChurchSettings.previousLogoUrl
  });
});

// 13. Gestão da Foto de Perfil do Usuário (Cada usuário pode modificar exclusivamente sua própria foto)
app.post('/api/users/:userId/avatar', authenticateUser, (req, res) => {
  const actor = (req as any).authenticatedUser;
  const targetUserId = req.params.userId;

  if (!canUpdateUserAvatar(actor, targetUserId)) {
    const audit = createAuditLog(
      actor,
      'SECURITY_VIOLATION_BLOCKED',
      `Tentativa não autorizada de alterar a foto de perfil do usuário '${targetUserId}' via API.`,
      'DENIED',
      undefined,
      targetUserId
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_AVATAR_UPDATE',
      message: 'Acesso negado: Cada usuário pode modificar exclusivamente sua própria foto de perfil.'
    });
  }

  const { avatarDataUrl } = req.body;
  if (!avatarDataUrl || typeof avatarDataUrl !== 'string' || !avatarDataUrl.trim()) {
    return res.status(400).json({
      error: 'INVALID_AVATAR_DATA',
      message: 'Os dados da foto de perfil são obrigatórios.'
    });
  }

  const targetUser = dbUsers.find((u) => u.id === targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' });
  }

  targetUser.avatar = avatarDataUrl.trim();

  // Atualiza foto nas associações departamentais
  dbMemberships.forEach((m) => {
    if (m.userId === targetUserId) {
      m.userAvatar = targetUser.avatar;
    }
  });

  const audit = createAuditLog(
    actor,
    'USER_AVATAR_UPDATED',
    `Foto de perfil de ${targetUser.name} foi atualizada com sucesso.`,
    'SUCCESS',
    undefined,
    targetUserId,
    targetUser.name
  );
  dbAuditLogs.unshift(audit);

  res.json({
    success: true,
    message: 'Foto de perfil atualizada com sucesso.',
    user: targetUser
  });
});

app.delete('/api/users/:userId/avatar', authenticateUser, (req, res) => {
  const actor = (req as any).authenticatedUser;
  const targetUserId = req.params.userId;

  if (!canUpdateUserAvatar(actor, targetUserId)) {
    const audit = createAuditLog(
      actor,
      'SECURITY_VIOLATION_BLOCKED',
      `Tentativa não autorizada de remover a foto de perfil do usuário '${targetUserId}' via API.`,
      'DENIED',
      undefined,
      targetUserId
    );
    dbAuditLogs.unshift(audit);

    return res.status(403).json({
      error: 'FORBIDDEN_AVATAR_UPDATE',
      message: 'Acesso negado: Cada usuário pode modificar exclusivamente sua própria foto de perfil.'
    });
  }

  const targetUser = dbUsers.find((u) => u.id === targetUserId);
  if (!targetUser) {
    return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'Usuário não encontrado.' });
  }

  targetUser.avatar = '';

  dbMemberships.forEach((m) => {
    if (m.userId === targetUserId) {
      m.userAvatar = '';
    }
  });

  const audit = createAuditLog(
    actor,
    'USER_AVATAR_REMOVED',
    `Foto de perfil de ${targetUser.name} foi removida. Avatar padrão ativado.`,
    'SUCCESS',
    undefined,
    targetUserId,
    targetUser.name
  );
  dbAuditLogs.unshift(audit);

  res.json({
    success: true,
    message: 'Foto de perfil removida. Avatar padrão ativado.',
    user: targetUser
  });
});

// ============================================================================
// VITE INTEGRATION OU SERVIÇO DE ARQUIVOS ESTÁTICOS
// ============================================================================
async function start() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.join(__dirname, 'dist'))) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Modo desenvolvimento com Vite
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[IGEAD-MT] Servidor seguro rodando em http://0.0.0.0:${PORT}`);
  });
}

// Se executado diretamente pelo terminal / tsx
if (process.argv[1] && process.argv[1].endsWith('server.ts')) {
  start();
}

export default app;
