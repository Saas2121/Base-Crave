# AGENTS

## Repo Structure
- 3 independent Node projects: `backend`, `client-app`, `store-app`. No root `package.json`.
- All 3 servers must run simultaneously for full functionality.
- Frontends share identical directory layout: `src/{api,store,components,pages,types,lib}/`.

## Dev Commands
Run all commands inside the relevant subfolder:
- **Backend**: `npm run dev` (ts-node-dev), `npm run build` (tsc), `npm start`
- **Client**: `npm run dev` (port 5173), `npm run build` (tsc + vite, type errors fail build), `npm run preview`
- **Store**: `npm run dev` (port 5174), `npm run build` (tsc + vite, type errors fail build), `npm run preview`
- No lint/test/CI scripts; `npm run build` is the only verification step.

## Runtime Wiring
- Frontends call `/api` via Axios; Vite proxies `/api` to backend `http://localhost:3000`.
- Fixed ports: backend `3000`, client `5173`, store `5174`.
- Auth tokens: `Authorization: Bearer <token>`.

## Environment
- Per-project `.env` files (`.env.example` templates exist):
  - Backend: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `PORT`
  - Frontends: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Architecture Notes
- **State management**: Both frontends use Zustand. Auth store (`src/store/authStore`) calls `/api/auth/me` on mount via `checkAuth()`.
- **Auth roles**: Backend `requireRole()` takes `string[]` — use `'consumer'`/`'store_admin'`, not enums. Client `App.tsx` supports `requiredRole` prop; store `App.tsx` assumes all authenticated users are store admins.
- **API endpoints**: `/api/auth`, `/api/stores`, `/api/packs`, `/api/reservations`, `/api/favorites`, `/health`.

## Database
- Schema (SQL) in `README.md`, no migration files. Run in Supabase SQL Editor.
- Tables: `users`, `stores`, `packs`, `favorites`, `reservations` (UUID PKs, snake_case columns).
- Prices stored as integers (not decimals). Pack types: `'surprise'` | `'fixed'`; status: `'active'` | `'sold_out'` | `'expired'`.
- Reservation flow: `reserved` → `in_process` → `ready` → `picked_up`. Valid statuses: `('reserved', 'in_process', 'ready', 'picked_up', 'cancelled', 'expired')`.
  - `PATCH /reservations/:id/status` (store_admin): Advance `reserved`→`in_process` or `in_process`→`ready`
  - `POST /reservations/:id/verify` (store_admin): Mark `picked_up` (matches pickup code)
  - `POST /reservations/:id/cancel` (consumer): Only if `reserved`, restores quantity
  - `POST /reservations/:id/reject` (store_admin): If `reserved`/`in_process`, restores quantity
- `public/images/` holds shared static assets (copied to `client-app/public/images/`).

## Team Conventions
- All features must be production-ready (logic/functionality > design changes).
- All projects share the same Supabase backend/database.
- Frontends deployable to Vercel with proper environment variables.

## Branching
- `master`: Stable main branch. Use feature branches for changes; avoid direct commits to `master`.
