/**
 * Suíte de Testes Automatizados de Segurança e Permissões
 * IGREJA GERAÇÃO ELEITA — IGEAD-MT
 *
 * Valida:
 * 1. Exemplo Obrigatório: Carlos Rocha é Líder da Mídia e Membro do Grupo de Homens.
 * 2. Líder administra SOMENTE o departamento em que possui designação oficial ativa.
 * 3. Membro acessa dados internos e chat apenas onde possui vínculo ativo.
 * 4. Tentativa de acesso sem vínculo em Mulheres, Jovens ou Crianças é BLOQUEADA (403 Forbidden).
 * 5. Remoção de um integrante encerra SOMENTE o vínculo departamental, preservando a conta e os outros vínculos.
 * 6. Revogação imediata de acesso ao chat ao encerrar vínculo.
 * 7. Chamadas diretas à API respeitam rigorosamente as permissões (validação no backend).
 * 8. Usuários comuns não conseguem se auto-promover a Administrador ou Pastor.
 * 9. Líderes departamentais não podem alterar cargos institucionais ou acessar relatórios financeiros globais.
 * 10. Proteção reforçada a menores no Grupo de Crianças (dados sensíveis restritos aos pais e liderança infantil).
 * 11. Preservação de módulos existentes (Bíblia Digital, YouTube, Agenda, Eventos).
 */

import {
  canManageDepartment,
  canAccessDepartmentInternalContent,
  canParticipateInChat,
  canAssignDepartmentLeader,
  canChangeInstitutionalRole,
  canAccessFinancialReports,
  canViewChildSensitiveData,
  canEndMembership
} from '../services/permissionSecurityService';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENT_MEMBERSHIPS,
  INITIAL_CHILD_RECORDS,
  INITIAL_EVENTS,
  INITIAL_LIVE_STREAM
} from '../data/initialData';
import { BIBLE_66_BOOKS } from '../data/bibleData';

async function runTestSuite() {
  console.log('================================================================');
  console.log('🛡️ INICIANDO SUÍTE DE TESTES DE PERMISSÕES & SEGURANÇA IGEAD-MT');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail: string = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName} ${detail ? `(${detail})` : ''}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      throw new Error(`Falha no teste: ${testName}`);
    }
  }

  const memberships = [...INITIAL_DEPARTMENT_MEMBERSHIPS];

  // 1. USUÁRIOS CHAVE
  const carlos = INITIAL_USERS.find((u) => u.id === 'user-leader-midia')!;
  const marcos = INITIAL_USERS.find((u) => u.id === 'user-leader-homens')!;
  const ana = INITIAL_USERS.find((u) => u.id === 'user-leader-mulheres')!;
  const membro = INITIAL_USERS.find((u) => u.id === 'user-member')!;
  const admin = INITIAL_USERS.find((u) => u.id === 'user-admin')!;
  const pastor = INITIAL_USERS.find((u) => u.id === 'user-pastor')!;

  console.log('--- TESTE 1: EXEMPLO OBRIGATÓRIO (CARLOS ROCHA) ---');
  // Carlos é líder da mídia e membro dos homens
  assert(
    canManageDepartment(carlos, 'midia', memberships) === true,
    'Carlos Rocha pode administrar integralmente o Grupo da Mídia',
    'Vínculo ATIVO como LÍDER da Mídia'
  );
  assert(
    canManageDepartment(carlos, 'homens', memberships) === false,
    'Carlos Rocha NÃO pode administrar o Grupo de Homens',
    'Ele é apenas MEMBRO nos Homens, não líder'
  );
  assert(
    canParticipateInChat(carlos, 'midia', memberships) === true,
    'Carlos Rocha pode participar do chat da Mídia',
    'Vínculo ativo'
  );
  assert(
    canParticipateInChat(carlos, 'homens', memberships) === true,
    'Carlos Rocha pode participar do chat dos Homens',
    'Vínculo ativo como membro'
  );
  assert(
    canAccessDepartmentInternalContent(carlos, 'mulheres', memberships) === false,
    'Carlos Rocha NÃO pode acessar dados internos do Grupo de Mulheres',
    'Sem vínculo no Grupo de Mulheres'
  );
  assert(
    canAccessDepartmentInternalContent(carlos, 'jovens', memberships) === false,
    'Carlos Rocha NÃO pode acessar dados internos do Grupo de Jovens',
    'Sem vínculo no Grupo de Jovens'
  );
  assert(
    canAccessDepartmentInternalContent(carlos, 'criancas', memberships) === false,
    'Carlos Rocha NÃO pode acessar dados internos do Grupo de Crianças',
    'Sem vínculo no Grupo de Crianças'
  );
  assert(
    canParticipateInChat(carlos, 'mulheres', memberships) === false,
    'Carlos Rocha NÃO pode postar nem ler chat de Mulheres',
    'Acesso bloqueado'
  );

  console.log('\n--- TESTE 2: RESTRIÇÕES DE LIDERANÇA DEPARTAMENTAL ---');
  // Marcos é líder dos homens, não da mídia
  assert(
    canManageDepartment(marcos, 'homens', memberships) === true,
    'Marcos Oliveira pode administrar o Grupo de Homens'
  );
  assert(
    canManageDepartment(marcos, 'midia', memberships) === false,
    'Marcos Oliveira NÃO pode administrar o Grupo da Mídia'
  );
  assert(
    canAssignDepartmentLeader(carlos) === false,
    'Líder da Mídia NÃO pode designar outros líderes departamentais'
  );
  assert(
    canChangeInstitutionalRole(carlos) === false,
    'Líder da Mídia NÃO pode alterar cargos institucionais'
  );
  assert(
    canAccessFinancialReports(carlos) === false,
    'Líder da Mídia NÃO pode acessar relatórios financeiros globais'
  );

  console.log('\n--- TESTE 3: PRIVILÉGIOS GLOBAIS DE ADMIN E PASTOR ---');
  assert(
    canManageDepartment(admin, 'homens', memberships) === true &&
    canManageDepartment(admin, 'midia', memberships) === true,
    'Administrador Geral possui gestão autorizada em todos os departamentos'
  );
  assert(
    canManageDepartment(pastor, 'homens', memberships) === true &&
    canManageDepartment(pastor, 'mulheres', memberships) === true,
    'Líder Pastoral possui supervisão autorizada em todos os departamentos'
  );
  assert(
    canAssignDepartmentLeader(admin) === true && canAssignDepartmentLeader(pastor) === true,
    'Admin e Pastor podem designar líderes oficiais de departamentos'
  );
  assert(
    canChangeInstitutionalRole(admin) === true,
    'Apenas Administrador Geral pode alterar cargos institucionais de usuários'
  );
  assert(
    canAccessFinancialReports(admin) === true && canAccessFinancialReports(pastor) === true,
    'Admin e Pastor possuem acesso aos relatórios financeiros globais'
  );

  console.log('\n--- TESTE 4: REMOÇÃO SEGURA E PRESERVAÇÃO DE CONTA E OUTROS VÍNCULOS ---');
  // Simula a remoção de Carlos do Grupo de Homens
  const linkHomensCarlos = memberships.find(
    (m) => m.userId === carlos.id && m.departmentId === 'homens'
  )!;
  assert(
    canEndMembership(marcos, linkHomensCarlos, memberships) === true,
    'Líder dos Homens (Marcos) pode remover integrante do Grupo de Homens'
  );
  assert(
    canEndMembership(ana, linkHomensCarlos, memberships) === false,
    'Líder das Mulheres (Ana) NÃO pode remover integrante do Grupo de Homens'
  );

  // Executa encerramento do vínculo nos Homens
  linkHomensCarlos.status = 'ENCERRADO';
  linkHomensCarlos.endedAt = '14/10/2026';

  // Verifica que o vínculo da Mídia permaneceu INTACTO!
  const linkMidiaCarlos = memberships.find(
    (m) => m.userId === carlos.id && m.departmentId === 'midia'
  )!;
  assert(
    linkMidiaCarlos.status === 'ATIVO' && linkMidiaCarlos.role === 'LÍDER',
    'Ao encerrar vínculo dos Homens, vínculo da Mídia permanece ATIVO e como LÍDER',
    'Preservação estrita de vínculos independentes'
  );

  // Verifica que a conta do usuário não foi excluída
  assert(
    INITIAL_USERS.some((u) => u.id === carlos.id),
    'Conta de Carlos Rocha permanece íntegra na IGEAD-MT'
  );

  // Verifica revogação imediata de acesso ao chat dos Homens
  assert(
    canParticipateInChat(carlos, 'homens', memberships) === false,
    'Acesso ao chat dos Homens foi REVOGADO IMEDIATAMENTE após o encerramento do vínculo'
  );

  console.log('\n--- TESTE 5: PROTEÇÃO REFORÇADA A MENORES (GRUPO DE CRIANÇAS) ---');
  const crianca1 = INITIAL_CHILD_RECORDS[0]; // Filho de "user-member"
  const debora = INITIAL_USERS.find((u) => u.id === 'user-leader-criancas')!;

  assert(
    canViewChildSensitiveData(membro, crianca1, memberships) === true,
    'Pai/mãe autorizado pode visualizar PIN de segurança e prontuário médico do filho'
  );
  assert(
    canViewChildSensitiveData(debora, crianca1, memberships) === true,
    'Líder Oficial do Grupo de Crianças pode visualizar dados médicos e PIN'
  );
  assert(
    canViewChildSensitiveData(carlos, crianca1, memberships) === false,
    'Líder da Mídia (Carlos) NÃO PODE visualizar dados médicos ou PIN das crianças'
  );
  assert(
    canViewChildSensitiveData(INITIAL_USERS.find((u) => u.id === 'user-visitor')!, crianca1, memberships) === false,
    'Visitante NÃO PODE visualizar dados médicos ou PIN das crianças'
  );

  console.log('\n--- TESTE 6: CHAMADAS DIRETAS À API DO BACKEND ---');
  const baseUrl = 'http://localhost:3000';

  // 6.1 Teste de leitura de integrantes do grupo de Mulheres por Carlos (espera 403 Forbidden)
  const resMulheres = await fetch(`${baseUrl}/api/departments/mulheres/members?userId=${carlos.id}`);
  assert(
    resMulheres.status === 403,
    'Backend rejeita consulta direta à API de Mulheres por Carlos com 403 Forbidden',
    `Status retornado: ${resMulheres.status}`
  );

  // 6.2 Teste de leitura do chat da Mídia por Carlos (espera 200 OK)
  const resChatMidia = await fetch(`${baseUrl}/api/departments/midia/chat?userId=${carlos.id}`);
  assert(
    resChatMidia.status === 200,
    'Backend autoriza consulta ao chat da Mídia por Carlos com 200 OK',
    `Status retornado: ${resChatMidia.status}`
  );

  // 6.3 Teste de envio de mensagem no chat de Crianças por Carlos (espera 403 Forbidden)
  const resPostCriancas = await fetch(`${baseUrl}/api/departments/criancas/chat?userId=${carlos.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: 'Mensagem não autorizada' })
  });
  assert(
    resPostCriancas.status === 403,
    'Backend bloqueia postagem não autorizada no chat de Crianças com 403 Forbidden',
    `Status retornado: ${resPostCriancas.status}`
  );

  // 6.4 Teste de elevação de privilégio: Membro comum tentando se auto-promover a Admin
  const resElevar = await fetch(`${baseUrl}/api/admin/change-role?userId=${membro.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetUserId: membro.id, newRole: 'admin' })
  });
  assert(
    resElevar.status === 403,
    'Backend bloqueia auto-elevação de privilégio por usuário comum com 403 Forbidden',
    `Status retornado: ${resElevar.status}`
  );

  // 6.5 Teste de acesso a relatório financeiro global por líder da mídia
  const resFinancas = await fetch(`${baseUrl}/api/admin/financial-report?userId=${carlos.id}`);
  assert(
    resFinancas.status === 403,
    'Backend bloqueia acesso a relatório financeiro global por líder de departamento com 403 Forbidden',
    `Status retornado: ${resFinancas.status}`
  );

  // 6.6 Teste de acesso a relatório financeiro global pelo Administrador Geral
  const resFinancasAdmin = await fetch(`${baseUrl}/api/admin/financial-report?userId=${admin.id}`);
  assert(
    resFinancasAdmin.status === 200,
    'Backend autoriza acesso a relatório financeiro global pelo Administrador Geral com 200 OK',
    `Status retornado: ${resFinancasAdmin.status}`
  );

  console.log('\n--- TESTE 7: PRESERVAÇÃO DE MÓDULOS EXISTENTES ---');
  assert(
    BIBLE_66_BOOKS.length === 66,
    'Bíblia Digital mantém os 66 livros canônicos'
  );
  assert(
    INITIAL_EVENTS.length >= 3,
    'Agenda e eventos oficiais continuam preservados'
  );
  assert(
    INITIAL_LIVE_STREAM.youtubeUrl.includes('IGEAD_MT'),
    'Configuração do canal oficial do YouTube @IGEAD_MT mantida'
  );

  console.log('\n================================================================');
  console.log(`🎉 TODOS OS ${passedTests}/${totalTests} TESTES FORAM EXECUTADOS E APROVADOS COM SUCESSO!`);
  console.log('================================================================\n');
}

runTestSuite().catch((err) => {
  console.error('Falha nos testes:', err);
  process.exit(1);
});
