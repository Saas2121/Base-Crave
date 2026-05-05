# AGENTS

## Repo shape (no root workspace)
- 3 independent Node projects: `backend`, `client-app`, `store-app`.
- Run `npm install` and all scripts inside each subfolder; no root `package.json`.
- All 3 servers must run simultaneously for the app to work.

## Verified dev commands
- Backend (`backend`): `npm run dev` (ts-node-dev), `npm run build` (`tsc`), `npm start`.
- Client (`client-app`): `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run preview`.
- Store (`store-app`): `npm run dev`, `npm run build` (`tsc -b && vite build`), `npm run preview`.
- Frontend build runs TypeScript check before Vite; type errors fail the build.
- No lint, test, or CI scripts exist; `npm run build` is the only verification step.

## Runtime wiring you must preserve
- Both frontends call relative `/api` endpoints via Axios (`client-app/src/api/client.ts`, `store-app/src/api/client.ts`).
- Vite dev servers proxy `/api` to backend `http://localhost:3000` (`client-app/vite.config.ts`, `store-app/vite.config.ts`).
- Fixed ports: backend `3000`, client `5173`, store `5174`.
- Auth tokens sent as `Authorization: Bearer <token>`.

## Environment and secrets
- Per-project env files: `backend/.env`, `client-app/.env`, `store-app/.env` (`.env.example` templates exist).
- Backend requires `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `PORT`.
- Frontends require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Do not commit real secrets.

## State management
- Both frontends use Zustand. Auth state lives in `src/store/authStore` and calls `/api/auth/me` on mount via `checkAuth()`.

## Shared frontend structure
- `client-app` and `store-app` share identical directory layout: `src/api/`, `src/store/`, `src/components/`, `src/pages/`, `src/types/`, `src/lib/`.

## API Endpoints (backend)
- `/api/auth` - register, login, /me
- `/api/stores` - CRUD for store owners
- `/api/packs` - pack management
- `/api/reservations` - consumer reservations
- `/api/favorites` - user favorites
- `/health` - health check

## Database Schema
Tables: `users`, `stores`, `packs`, `favorites`, `reservations`. All use UUID primary keys and snake_case columns. Prices are stored as integers (not decimals). Pack types: `'surprise'` | `'fixed'`. Pack status: `'active'` | `'sold_out'` | `'expired'`.

## Auth and role checks
- Backend middleware (`backend/src/middleware/auth.ts`): `requireRole()` takes `string[]` — use `'consumer'` or `'store_admin'`, not enums.
- Frontend route guards: `client-app/src/App.tsx` supports `requiredRole` prop; `store-app/src/App.tsx` does not (all authenticated users are store admins by convention).
- When changing auth, verify both backend middleware and frontend guards.

## Reservation Status Flow
- `reserved` -> `in_process` -> `ready` -> `picked_up`
- `reserved` or `in_process` can be cancelled/rejected
- DB constraint: `('reserved', 'in_process', 'ready', 'picked_up', 'cancelled', 'expired')`

## Database setup
- SQL schema lives in `README.md`, not in migration files. Run it in Supabase SQL Editor.
- If the reservations status constraint is outdated, see the ALTER TABLE command in README.md Troubleshooting section.
