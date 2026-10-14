# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Church app for Igreja Geração Eleita (IGEAD-MT, Cuiabá). React 19 + Vite + Tailwind v4 frontend with an Express backend in `server.ts`. Originally scaffolded in Google AI Studio (see `metadata.json`, `.env.example`). The UI, comments, test output and domain terms are in Brazilian Portuguese — keep new user-facing text and domain identifiers in Portuguese (e.g. `LÍDER`, `ATIVO`, `ENCERRADO`).

## Commands

- `npm run dev` — runs `tsx server.ts`: Express on `PORT` (default 3000) with Vite mounted as middleware (no separate Vite dev server).
- `npm run build` — static frontend build into `dist/`.
- `npm run lint` — type check only (`tsc --noEmit`); there is no ESLint.
- Tests are plain `tsx` scripts with a hand-rolled `assert` (no test runner). Run one file at a time:
  - `npx tsx src/tests/permissions.test.ts` — main suite (permission rules + HTTP API)
  - `npx tsx test_permissions.ts` — permission service unit checks
  - `npx tsx test_api.ts` — HTTP API checks
  - `npx tsx test_images_security.ts` — church logo / avatar upload rules
  A failing assertion sets `process.exitCode = 1`.

## Architecture

**Two data layers that must stay consistent:**
- `src/data/initialData.ts` holds all seed data (users, departments, memberships, chats, events, settings). Both layers start from it.
- `server.ts` keeps an **in-memory** DB (`dbUsers`, `dbMemberships`, `dbChats`, `dbAuditLogs`, `dbChurchSettings`); nothing is persisted across restarts. `getDb()`/`resetDb()` are exported for tests, and `app` is the default export so tests start it via `http.createServer(app).listen(0)`. `start()` only runs when the file is executed directly.
- `src/context/ChurchContext.tsx` (`ChurchProvider` / `useChurch`) is the client-side state store for nearly everything, persisted to `localStorage` under `igead_*_v2` keys. Only a few features call the backend (`/api/church-settings`, `/api/church-logo`, `/api/users/:id/avatar`); most mutations happen purely client-side.

**Permissions** live in `src/services/permissionSecurityService.ts` (`canManageDepartment`, `canParticipateInChat`, `canChangeInstitutionalRole`, `canViewChildSensitiveData`, `validateImageFile`, `createAuditLog`, …) and are shared by the frontend and `server.ts`. Model: institutional role (`admin`, `pastor`, member, visitor) plus independent per-department memberships (`DepartmentMembership` with role `MEMBRO`/`LÍDER` and status `PENDENTE`/`ATIVO`/`ENCERRADO`). A leader manages only departments where they hold an active `LÍDER` membership; ending a membership affects only that department. Children's department data is restricted. Changes to these rules should go through this service and be covered in the test scripts. Sensitive actions append to the audit log.

**Auth is simulated:** `authenticateUser` in `server.ts` resolves the user from the `x-user-id` header or `?userId=` query, falling back to `user-leader-midia`. There is no real authentication.

**Navigation** has no router: `App.tsx` switches on `activeTab` (`AppTab` type in `ChurchContext.tsx`) to render the views in `src/components/<feature>/`. Shared types are in `src/types/index.ts`.

**Bible:** `src/services/bibleService.ts` fetches chapters from `bible.helloao.org`; `src/data/bibleData.ts` holds the 66-book canon metadata.

## Deployment

`.github/workflows/deploy.yml` builds on push to `main` and publishes `dist/` to GitHub Pages. `vite.config.ts` sets `base: '/aplicativo-igreja/'` for that. GitHub Pages serves only static files, so the Express `/api/*` routes are unavailable in production there and the app must work from `ChurchContext`/`localStorage` alone. The `@` import alias resolves to the repo root, not `src/`.
