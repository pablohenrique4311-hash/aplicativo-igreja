import http from 'http';
import app, { resetDb, getDb } from './server';
import { validateImageFile, canManageChurchLogo, canUpdateUserAvatar } from './src/services/permissionSecurityService';

console.log('=== TESTES DE SEGURANÇA E PERSISTÊNCIA: LOGO & FOTO DE PERFIL ===\n');

let totalTests = 0;
let passedTests = 0;

function assert(cond: boolean, desc: string) {
  totalTests++;
  if (cond) {
    passedTests++;
    console.log(`✅ [PASS] ${desc}`);
  } else {
    console.error(`❌ [FAIL] ${desc}`);
    process.exitCode = 1;
  }
}

// 1. Testes de Validação de Arquivo (PNG, JPG, WEBP e Tamanho)
console.log('--- 1. VALIDAÇÃO DE ARQUIVOS DE IMAGEM ---');
assert(
  validateImageFile({ name: 'logo-oficial.png', type: 'image/png', size: 1024 * 500 }).valid === true,
  'Arquivo PNG de 500 KB é aceito'
);
assert(
  validateImageFile({ name: 'foto-pastor.jpg', type: 'image/jpeg', size: 1024 * 1024 * 2 }).valid === true,
  'Arquivo JPG de 2 MB é aceito'
);
assert(
  validateImageFile({ name: 'identidade.webp', type: 'image/webp', size: 1024 * 800 }).valid === true,
  'Arquivo WEBP de 800 KB é aceito'
);
assert(
  validateImageFile({ name: 'documento.pdf', type: 'application/pdf', size: 1024 * 100 }).valid === false,
  'Arquivo PDF é rejeitado'
);
assert(
  validateImageFile({ name: 'executavel.exe', type: 'application/octet-stream', size: 1024 }).valid === false,
  'Arquivo executável é rejeitado'
);
assert(
  validateImageFile({ name: 'foto-gigante.png', type: 'image/png', size: 1024 * 1024 * 8 }).valid === false,
  'Arquivo maior que 5 MB (8 MB) é rejeitado'
);

// 2. Testes de Permissões RBAC (Regras de Negócio)
console.log('\n--- 2. PERMISSÕES DE GESTÃO DA LOGO & FOTO DE PERFIL ---');
const userAdmin = { id: 'user-admin', name: 'Admin', role: 'admin' as const, email: '', phone: '', membershipId: '', membershipDate: '', avatar: '' };
const userCarlos = { id: 'user-leader-midia', name: 'Carlos Rocha', role: 'member' as const, email: '', phone: '', membershipId: '', membershipDate: '', avatar: '' };
const userLucas = { id: 'user-member', name: 'Lucas Membro', role: 'member' as const, email: '', phone: '', membershipId: '', membershipDate: '', avatar: '' };

assert(canManageChurchLogo(userAdmin) === true, 'Administrador Geral PODE gerenciar a logo oficial da igreja');
assert(canManageChurchLogo(userCarlos) === false, 'Líder departamental NÃO PODE gerenciar a logo oficial da igreja');
assert(canManageChurchLogo(userLucas) === false, 'Membro comum NÃO PODE gerenciar a logo oficial da igreja');

assert(canUpdateUserAvatar(userCarlos, 'user-leader-midia') === true, 'Carlos PODE alterar sua própria foto de perfil');
assert(canUpdateUserAvatar(userCarlos, 'user-member') === false, 'Carlos NÃO PODE alterar a foto de perfil de outro membro (Lucas)');
assert(canUpdateUserAvatar(userAdmin, 'user-member') === true, 'Administrador Geral PODE atualizar foto de membros se necessário');

// 3. Testes HTTP das Rotas de API
console.log('\n--- 3. TESTES DE SEGURANÇA E PERSISTÊNCIA VIA API (BACKEND HTTP) ---');

const server = http.createServer(app);

server.listen(0, async () => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3000;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    resetDb();

    // A. TESTE DE LOGO DA IGREJA
    // Carlos tenta alterar a logo da igreja -> Bloqueado com 403 Forbidden
    const resForbiddenLogo = await fetch(`${baseUrl}/api/church-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-leader-midia'
      },
      body: JSON.stringify({ logoDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' })
    });
    assert(resForbiddenLogo.status === 403, 'Usuário não-admin é BLOQUEADO (403 Forbidden) ao tentar alterar logo da igreja');

    // Admin altera a logo da igreja com sucesso (200 OK)
    const testLogoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    const resAdminLogo = await fetch(`${baseUrl}/api/church-logo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-admin'
      },
      body: JSON.stringify({ logoDataUrl: testLogoUrl })
    });
    assert(resAdminLogo.status === 200, 'Administrador Geral ALTERA a logo da igreja com sucesso (200 OK)');

    // Verifica persistência no backend da logo
    const resSettings = await fetch(`${baseUrl}/api/church-settings`);
    const settingsData = await resSettings.json();
    assert(settingsData.settings.logoUrl === testLogoUrl, 'Nova logo da igreja foi persistida no servidor');

    // Admin restaura a logo padrão (200 OK)
    const resRestoreLogo = await fetch(`${baseUrl}/api/church-logo`, {
      method: 'DELETE',
      headers: { 'x-user-id': 'user-admin' }
    });
    assert(resRestoreLogo.status === 200, 'Administrador Geral RESTAURA logo oficial padrão com sucesso (200 OK)');
    const resSettingsRestored = await fetch(`${baseUrl}/api/church-settings`);
    const settingsRestoredData = await resSettingsRestored.json();
    assert(settingsRestoredData.settings.logoUrl === '/logo-igead.svg', 'Logo padrão oficial (/logo-igead.svg) restaurada com sucesso');

    // B. TESTE DE FOTO DE PERFIL
    const testAvatarUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbhyQAAAABJRU5ErkJggg==';

    // Carlos atualiza sua própria foto -> 200 OK
    const resCarlosAvatar = await fetch(`${baseUrl}/api/users/user-leader-midia/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-leader-midia'
      },
      body: JSON.stringify({ avatarDataUrl: testAvatarUrl })
    });
    assert(resCarlosAvatar.status === 200, 'Usuário ATUALIZA sua própria foto de perfil com sucesso (200 OK)');

    // Carlos tenta alterar foto de outro usuário (Lucas) -> 403 Forbidden
    const resCarlosTampering = await fetch(`${baseUrl}/api/users/user-member/avatar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-leader-midia'
      },
      body: JSON.stringify({ avatarDataUrl: testAvatarUrl })
    });
    assert(resCarlosTampering.status === 403, 'Tentativa de alterar foto de outro usuário é BLOQUEADA (403 Forbidden)');

    // Carlos remove sua própria foto de perfil -> 200 OK (Avatar padrão)
    const resDeleteAvatar = await fetch(`${baseUrl}/api/users/user-leader-midia/avatar`, {
      method: 'DELETE',
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resDeleteAvatar.status === 200, 'Usuário REMOVE sua foto de perfil com sucesso (200 OK)');

    const dbState = getDb();
    const updatedCarlos = dbState.users.find(u => u.id === 'user-leader-midia');
    assert(updatedCarlos?.avatar === '', 'Foto do usuário foi limpa no servidor (ativa avatar padrão)');

    console.log(`\n======================================================`);
    console.log(`RESULTADO DOS TESTES DE IMAGENS: ${passedTests}/${totalTests} PASSARAM COM SUCESSO!`);
    console.log(`======================================================`);
  } catch (err) {
    console.error('Erro na execução dos testes:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
