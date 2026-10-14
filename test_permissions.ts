import {
  canManageDepartment,
  canAccessDepartmentInternalContent,
  canParticipateInChat,
  canAssignDepartmentLeader,
  canChangeInstitutionalRole,
  canAccessFinancialReports,
  canViewChildSensitiveData,
  canEndMembership
} from './src/services/permissionSecurityService';
import {
  INITIAL_USERS,
  INITIAL_DEPARTMENT_MEMBERSHIPS
} from './src/data/initialData';
import { DepartmentMembership, User } from './src/types';

console.log('=== INICIANDO TESTES DO SISTEMA DE PERMISSÕES — IGEAD-MT ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, description: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✅ [PASS] ${description}`);
  } else {
    console.error(`❌ [FAIL] ${description}`);
    process.exitCode = 1;
  }
}

// 1. Obter usuários do teste
const userAdmin = INITIAL_USERS.find(u => u.id === 'user-admin')!;
const userPastor = INITIAL_USERS.find(u => u.id === 'user-pastor')!;
const userCarlos = INITIAL_USERS.find(u => u.id === 'user-leader-midia')!; // Líder da Mídia & Membro dos Homens
const userLucas = INITIAL_USERS.find(u => u.id === 'user-member-1')!; // Membro comum dos Jovens
const userVisitor = INITIAL_USERS.find(u => u.id === 'user-visitor')!; // Visitante sem vínculos

const memberships: DepartmentMembership[] = JSON.parse(JSON.stringify(INITIAL_DEPARTMENT_MEMBERSHIPS));

console.log('--- TESTE 1: LIDERANÇA DEPARTAMENTAL INDEPENDENTE ---');
// Carlos é líder da Mídia: PODE administrar a Mídia
assert(
  canManageDepartment(userCarlos, 'midia', memberships) === true,
  'Carlos Rocha (Líder da Mídia) PODE administrar o departamento de Mídia'
);

// Carlos é apenas MEMBRO do Grupo de Homens: NÃO PODE administrar o Grupo de Homens
assert(
  canManageDepartment(userCarlos, 'homens', memberships) === false,
  'Carlos Rocha (Membro dos Homens) NÃO PODE administrar o departamento de Homens'
);

// Carlos NÃO TEM vínculo com Mulheres nem Crianças nem Jovens: NÃO PODE administrar nenhum deles
assert(
  canManageDepartment(userCarlos, 'mulheres', memberships) === false,
  'Carlos Rocha NÃO PODE administrar Mulheres'
);
assert(
  canManageDepartment(userCarlos, 'criancas', memberships) === false,
  'Carlos Rocha NÃO PODE administrar Crianças'
);

console.log('\n--- TESTE 2: ACESSO A CONTEÚDOS INTERNOS E CHAT ---');
// Carlos tem vínculo na Mídia e nos Homens
assert(
  canAccessDepartmentInternalContent(userCarlos, 'midia', memberships) === true,
  'Carlos tem acesso ao conteúdo interno da Mídia'
);
assert(
  canParticipateInChat(userCarlos, 'midia', memberships) === true,
  'Carlos pode participar do chat da Mídia'
);
assert(
  canAccessDepartmentInternalContent(userCarlos, 'homens', memberships) === true,
  'Carlos tem acesso ao conteúdo interno dos Homens'
);
assert(
  canParticipateInChat(userCarlos, 'homens', memberships) === true,
  'Carlos pode participar do chat dos Homens'
);

// Carlos NÃO PODE acessar conteúdo interno nem chat de Mulheres, Jovens ou Crianças
assert(
  canAccessDepartmentInternalContent(userCarlos, 'mulheres', memberships) === false,
  'Carlos NÃO PODE acessar conteúdo interno do Grupo de Mulheres (sem vínculo)'
);
assert(
  canParticipateInChat(userCarlos, 'mulheres', memberships) === false,
  'Carlos NÃO PODE acessar chat do Grupo de Mulheres (sem vínculo)'
);
assert(
  canAccessDepartmentInternalContent(userCarlos, 'criancas', memberships) === false,
  'Carlos NÃO PODE acessar conteúdo interno do Grupo de Crianças (sem vínculo)'
);

console.log('\n--- TESTE 3: ISOLAMENTO DE REMOÇÃO DE VÍNCULO (PRESERVAÇÃO DE CONTA E OUTROS VÍNCULOS) ---');
// Simula encerramento do vínculo de Carlos com o Grupo de Homens
const homensMembershipIndex = memberships.findIndex(m => m.userId === userCarlos.id && m.departmentId === 'homens');
assert(homensMembershipIndex !== -1, 'Vínculo prévio nos Homens encontrado');

// Encerra vínculo
memberships[homensMembershipIndex].status = 'ENCERRADO';
memberships[homensMembershipIndex].endedAt = new Date().toLocaleDateString('pt-BR');

// Após encerramento: Carlos perde imediatamente acesso aos Homens
assert(
  canAccessDepartmentInternalContent(userCarlos, 'homens', memberships) === false,
  'Após encerramento, Carlos perdeu imediatamente acesso ao conteúdo interno dos Homens'
);
assert(
  canParticipateInChat(userCarlos, 'homens', memberships) === false,
  'Após encerramento, Carlos perdeu imediatamente acesso ao chat dos Homens'
);

// Mas Carlos PRESERVA integralmente sua conta e sua liderança ativa na Mídia!
assert(
  canManageDepartment(userCarlos, 'midia', memberships) === true,
  'A liderança e acesso à Mídia continuam 100% preservados'
);
assert(
  canParticipateInChat(userCarlos, 'midia', memberships) === true,
  'Chat da Mídia continua 100% acessível para Carlos'
);

console.log('\n--- TESTE 4: BLOQUEIO DE ELEVAÇÃO DE PRIVILÉGIOS E RELATÓRIOS GLOBAIS ---');
// Usuário comum ou líder departamental NÃO PODE alterar cargos institucionais
assert(
  canChangeInstitutionalRole(userCarlos) === false,
  'Líder departamental NÃO PODE alterar cargos institucionais'
);
assert(
  canChangeInstitutionalRole(userLucas) === false,
  'Membro comum NÃO PODE alterar cargos institucionais'
);
assert(
  canChangeInstitutionalRole(userAdmin) === true,
  'Administrador Geral PODE alterar cargos institucionais'
);

// Usuário comum ou líder departamental NÃO PODE designar líderes oficiais de departamentos
assert(
  canAssignDepartmentLeader(userCarlos) === false,
  'Líder departamental NÃO PODE designar outros líderes'
);
assert(
  canAssignDepartmentLeader(userLucas) === false,
  'Membro comum NÃO PODE designar outros líderes'
);
assert(
  canAssignDepartmentLeader(userAdmin) === true,
  'Administrador Geral PODE designar líderes'
);
assert(
  canAssignDepartmentLeader(userPastor) === true,
  'Líder Pastoral PODE designar líderes'
);

// Acesso a relatórios financeiros globais
assert(
  canAccessFinancialReports(userCarlos) === false,
  'Líder departamental NÃO PODE acessar relatórios financeiros globais'
);
assert(
  canAccessFinancialReports(userLucas) === false,
  'Membro comum NÃO PODE acessar relatórios financeiros globais'
);
assert(
  canAccessFinancialReports(userVisitor) === false,
  'Visitante NÃO PODE acessar relatórios financeiros globais'
);
assert(
  canAccessFinancialReports(userAdmin) === true,
  'Administrador Geral PODE acessar relatórios financeiros globais'
);
assert(
  canAccessFinancialReports(userPastor) === true,
  'Líder Pastoral PODE acessar relatórios financeiros globais'
);

console.log('\n--- TESTE 5: PROTEÇÃO DE DADOS DE MENORES (GRUPO DE CRIANÇAS) ---');
const testChild = {
  id: 'child-1',
  childName: 'Samuel Oliveira',
  birthDate: '15/03/2019',
  parentName: 'Marcos Oliveira',
  parentPhone: '(65) 99876-1122',
  parentAuthorized: true,
  securityPin: '4821',
  allergyOrNotes: 'Nenhuma alergia relatada',
  checkedIn: false
};

// Marcos é o pai de Samuel: pode acessar os dados do filho
assert(
  canViewChildSensitiveData({ ...userLucas, name: 'Marcos Oliveira' }, testChild, memberships) === true,
  'Pai responsável (Marcos Oliveira) PODE acessar os dados do filho'
);
// Carlos Rocha NÃO é o pai, não é líder de crianças, não é pastor: NÃO PODE acessar dados do menor
assert(
  canViewChildSensitiveData(userCarlos, testChild, memberships) === false,
  'Carlos Rocha (Líder da Mídia) NÃO PODE acessar dados sensíveis do menor Samuel'
);
// Admin e Pastor têm acesso tutelar pastoral
assert(
  canViewChildSensitiveData(userAdmin, testChild, memberships) === true,
  'Administrador Geral PODE acessar dados de menores com autorização pastoral'
);

console.log(`\n======================================================`);
console.log(`RESULTADO DOS TESTES: ${passedTests}/${totalTests} PASSARAM COM SUCESSO!`);
console.log(`======================================================`);
