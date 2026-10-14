# Igreja Geração Eleita — IGEAD-MT

Aplicativo da Igreja Geração Eleita (IGEAD-MT), em Cuiabá - MT. Reúne cultos ao vivo, Bíblia digital, agenda de eventos, departamentos, contribuições e painel administrativo em uma interface mobile-first.

🔗 **Versão publicada:** https://pablohenrique4311-hash.github.io/aplicativo-igreja/

## Funcionalidades

- **Início** — transmissão ao vivo (YouTube @IGEAD_MT), horários dos cultos, versículo em destaque e anotações de sermão.
- **Bíblia** — 66 livros, leitura por capítulo, notas, favoritos e histórico (textos obtidos de [bible.helloao.org](https://bible.helloao.org)).
- **Departamentos** — Homens, Mulheres, Jovens, Crianças e Mídia, cada um com integrantes, chat interno e escalas.
- **Agenda** — eventos da igreja com compartilhamento via WhatsApp.
- **Contribuir** — dízimos e ofertas por Pix, cartão ou boleto (simulados, sem integração de pagamento).
- **Perfil** — dados do usuário, foto, vínculos com departamentos, pedidos de oração e escolha do tema (Claro, Escuro, Oceano ou Púrpura).
- **Administração** — gestão de cargos, departamentos, identidade visual da igreja e log de auditoria.

### Perfis e permissões

Cada usuário tem um cargo institucional (Administrador Geral, Liderança Pastoral, Membro, Visitante) e vínculos independentes com cada departamento (função `MEMBRO` ou `LÍDER`, status `PENDENTE`, `ATIVO` ou `ENCERRADO`). Um líder administra somente o departamento em que possui liderança ativa, e o chat de um departamento é restrito aos seus integrantes. Dados do departamento infantil têm acesso restrito. As regras ficam em `src/services/permissionSecurityService.ts`.

## Tecnologias

React 19, TypeScript, Vite 8, Tailwind CSS 4, Motion, Lucide Icons e Express (API em `server.ts`).

## Como rodar

Requer Node.js 22.

```bash
npm ci
npm run dev
```

Acesse http://localhost:3000/aplicativo-igreja/. O comando `dev` sobe o servidor Express com o Vite integrado, servindo a interface e a API (`/api/*`) na mesma porta. Para usar outra porta, defina `PORT`.

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (Express + Vite) |
| `npm run build` | Gera a versão estática em `dist/` |
| `npm run preview` | Serve o conteúdo de `dist/` localmente |
| `npm run lint` | Verificação de tipos (`tsc --noEmit`) |

### Testes

Os testes são scripts executados com `tsx`:

```bash
npx tsx src/tests/permissions.test.ts   # regras de permissão + API
npx tsx test_permissions.ts             # serviço de permissões
npx tsx test_api.ts                     # rotas HTTP
npx tsx test_images_security.ts         # logo e foto de perfil
```

## Usuários de demonstração

Não há login: o perfil ativo é trocado pelo menu do topo. Os dados iniciais (em `src/data/initialData.ts`) incluem administrador, pastor, líderes de cada departamento, membro e visitante. O perfil padrão é **Carlos Rocha**, líder da Mídia e membro do Grupo de Homens.

## Dados e limitações

- O estado do app é salvo no `localStorage` do navegador, portanto cada dispositivo tem seus próprios dados e nada é compartilhado entre usuários.
- A API em `server.ts` guarda os dados em memória e os perde ao reiniciar. A identificação do usuário é feita pelo cabeçalho `x-user-id`, sem autenticação real.
- Na versão do GitHub Pages apenas a interface é publicada; as rotas `/api/*` não existem lá e o app funciona somente com os dados locais.

Por isso, o projeto deve ser tratado como protótipo até receber autenticação e banco de dados.

## Deploy

Cada push na branch `main` executa `.github/workflows/deploy.yml`, que compila o projeto e publica `dist/` no GitHub Pages. O caminho base `/aplicativo-igreja/` está definido em `vite.config.ts`.

Nas configurações do repositório, **Settings → Pages → Source** precisa estar em **GitHub Actions**.
