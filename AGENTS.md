# AGENTS

## Repo shape (no root workspace)
- This repo has 3 independent Node projects: `backend`, `client-app`, `store-app`.
- Run `npm install` and all scripts inside each subfolder; there is no root `package.json` orchestrating tasks.

## Verified dev commands
- Backend (`backend`): `npm run dev` (ts-node-dev), `npm run build`, `npm start`.
- Client (`client-app`): `npm run dev`, `npm run build`, `npm run preview`.
- Store (`store-app`): `npm run dev`, `npm run build`, `npm run preview`.
- There are currently no repo lint/test scripts or CI workflows; use builds as the main verification step.

## Runtime wiring you must preserve
- Both frontends call relative `/api` endpoints via Axios (`client-app/src/api/client.ts`, `store-app/src/api/client.ts`).
- Vite dev servers proxy `/api` to backend `http://localhost:3000` (`client-app/vite.config.ts`, `store-app/vite.config.ts`).
- Default local ports are fixed in config: backend `3000`, client `5173`, store `5174`.

## Environment and secrets
- Required env files are per project: `backend/.env`, `client-app/.env`, `store-app/.env` (examples exist in each folder).
- Backend requires `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `PORT`.
- Frontends require `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Do not commit real secrets from `.env` files.

## API Endpoints (backend)
- `/api/auth` - register, login, /me
- `/api/stores` - CRUD for store owners
- `/api/packs` - pack management
- `/api/reservations` - consumer reservations
- `/api/favorites` - user favorites
- `/health` - health check

## Database Schema
Tables: `users`, `stores`, `packs`, `favorites`, `reservations`. All use UUID primary keys and snake_case columns (e.g., `created_at`, `pack_type`, `owner_id`).

## High-risk consistency gotchas
- Keep field naming aligned: backend returns `created_at` from DB, frontend types expect `created_at`. Avoid introducing `createdAt` in new endpoints.
- User role checks are in frontend route guards (`client-app/src/App.tsx`, `store-app/src/App.tsx`) and backend middleware. Verify both when changing auth.
- Backend middleware uses string roles ('consumer', 'store_admin'), not TypeScript enums. Use `requireRole(['store_admin'])` not `requireRole([UserRole.STORE_ADMIN])`.

## Reservation Status Flow
- `reserved` -> `in_process` -> `ready` -> `picked_up`
- `reserved` or `in_process` can be cancelled/rejected
- Database constraint must include all statuses: `('reserved', 'in_process', 'ready', 'picked_up', 'cancelled', 'expired')`
