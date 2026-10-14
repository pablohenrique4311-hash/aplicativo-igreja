import http from 'http';
import app, { resetDb } from './server';

console.log('=== TESTES DE CHAMADAS DIRETAS À API (BACKEND HTTP) ===\n');

const server = http.createServer(app);

server.listen(0, async () => {
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 3000;
  const baseUrl = `http://127.0.0.1:${port}`;

  let passed = 0;
  let total = 0;

  function assert(cond: boolean, msg: string) {
    total++;
    if (cond) {
      passed++;
      console.log(`✅ [API PASS] ${msg}`);
    } else {
      console.error(`❌ [API FAIL] ${msg}`);
      process.exitCode = 1;
    }
  }

  try {
    resetDb();

    // 1. Carlos acessa membros da Mídia (Ele é líder ativo -> 200 OK)
    const resMidiaMembers = await fetch(`${baseUrl}/api/departments/midia/members`, {
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resMidiaMembers.status === 200, 'Carlos Rocha (Líder da Mídia) acessa integrantes da Mídia com status 200 OK');

    // 2. Carlos tenta acessar membros das Mulheres (Sem vínculo -> 403 Forbidden)
    const resWomenMembers = await fetch(`${baseUrl}/api/departments/mulheres/members`, {
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resWomenMembers.status === 403, 'Carlos Rocha é BLOQUEADO (403 Forbidden) ao tentar acessar integrantes de Mulheres');

    // 3. Carlos tenta adicionar integrante no Grupo de Homens (Ele é apenas membro dos Homens -> 403 Forbidden)
    const resAddHomens = await fetch(`${baseUrl}/api/departments/homens/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-leader-midia'
      },
      body: JSON.stringify({ targetUserId: 'user-member', role: 'MEMBRO' })
    });
    assert(resAddHomens.status === 403, 'Carlos Rocha é BLOQUEADO (403 Forbidden) ao tentar adicionar integrante no Grupo de Homens');

    // 4. Carlos adiciona integrante na Mídia (Ele é líder da Mídia -> 200 OK)
    const resAddMidia = await fetch(`${baseUrl}/api/departments/midia/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-leader-midia'
      },
      body: JSON.stringify({ targetUserId: 'user-member', role: 'MEMBRO' })
    });
    assert(resAddMidia.status === 200, 'Carlos Rocha ADICIONA integrante na Mídia com status 200 OK');

    // 5. Carlos tenta acessar relatório financeiro global (Líder departamental não pode -> 403 Forbidden)
    const resFinance = await fetch(`${baseUrl}/api/admin/financial-report`, {
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resFinance.status === 403, 'Carlos Rocha é BLOQUEADO (403 Forbidden) ao tentar acessar relatório financeiro global');

    // 6. Administrador Geral acessa relatório financeiro global (200 OK)
    const resAdminFinance = await fetch(`${baseUrl}/api/admin/financial-report`, {
      headers: { 'x-user-id': 'user-admin' }
    });
    assert(resAdminFinance.status === 200, 'Administrador Geral ACESSA relatório financeiro global com status 200 OK');

    // 7. Carlos tenta alterar cargo institucional de outro usuário (Elevação de privilégio -> 403 Forbidden)
    const resChangeRole = await fetch(`${baseUrl}/api/admin/change-role`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'user-leader-midia'
      },
      body: JSON.stringify({ targetUserId: 'user-visitor', newRole: 'admin' })
    });
    assert(resChangeRole.status === 403, 'Carlos Rocha é BLOQUEADO (403 Forbidden) ao tentar elevar cargo institucional');

    // 8. Chat da Mídia: Carlos lê (200 OK)
    const resChatRead = await fetch(`${baseUrl}/api/departments/midia/chat`, {
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resChatRead.status === 200, 'Carlos Rocha LÊ o chat da Mídia (200 OK)');

    // 9. Chat das Crianças: Carlos tenta ler sem vínculo (403 Forbidden)
    const resKidsChat = await fetch(`${baseUrl}/api/departments/criancas/chat`, {
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resKidsChat.status === 403, 'Carlos Rocha é BLOQUEADO (403 Forbidden) ao tentar ler chat de Crianças sem vínculo');

    // 10. Carlos encerra seu próprio vínculo com os Homens (200 OK)
    const resLeaveHomens = await fetch(`${baseUrl}/api/departments/homens/members/user-leader-midia`, {
      method: 'DELETE',
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resLeaveHomens.status === 200, 'Carlos encerra vínculo com Homens com status 200 OK (Conta preservada)');

    // 11. Após encerrar vínculo, Carlos tenta ler chat dos Homens (403 Forbidden imediato!)
    const resHomensChatAfter = await fetch(`${baseUrl}/api/departments/homens/chat`, {
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resHomensChatAfter.status === 403, 'Após encerramento de vínculo, acesso ao chat dos Homens é REVOGADO IMEDIATAMENTE (403 Forbidden)');

    // 12. Mas Carlos AINDA pode ler e enviar no chat da Mídia (Preservação de outros vínculos!)
    const resMidiaChatAfter = await fetch(`${baseUrl}/api/departments/midia/chat`, {
      headers: { 'x-user-id': 'user-leader-midia' }
    });
    assert(resMidiaChatAfter.status === 200, 'Liderança e chat da Mídia permanecem 100% ATIVOS (200 OK) após saída dos Homens');

    console.log(`\n======================================================`);
    console.log(`RESULTADO DA API: ${passed}/${total} PASSARAM COM SUCESSO!`);
    console.log(`======================================================`);
  } catch (err) {
    console.error('Erro nos testes de API:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
