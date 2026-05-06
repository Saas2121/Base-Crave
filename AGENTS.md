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

## Reservation status endpoints and flow
- Flow: `reserved` -> `in_process` -> `ready` -> `picked_up`
- `PATCH /reservations/:id/status` (store_admin): advances `reserved`->`in_process` or `in_process`->`ready`.
- `POST /reservations/:id/verify` (store_admin): marks `picked_up` when pickup code matches; accepts `reserved` or `ready` status.
- `POST /reservations/:id/cancel` (consumer): only when status is `reserved`; restores remaining_quantity.
- `POST /reservations/:id/reject` (store_admin): when status is `reserved` or `in_process`; restores remaining_quantity.
- DB constraint: `('reserved', 'in_process', 'ready', 'picked_up', 'cancelled', 'expired')`.

## Database setup
- SQL schema lives in `README.md`, not in migration files. Run it in Supabase SQL Editor.
- If the reservations status constraint is outdated, see the ALTER TABLE command in README.md Troubleshooting section.
- `public/images/` contains static images shared by both frontends; also copied to `client-app/public/images/`.

## UI design system (client-app)
- Font: **General Sans** (loaded via Fontshare: `https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap`).
- Dark theme base: `#101010` background, `#1A1A1A` inputs, `#2A2A2A` borders.
- Accent color: `#F95519` (primary buttons, links).
- Muted text: `#99A1AF`. Headers: `#E3E3E3`.
- Input icons: `icon.svg` (user), `icon2.svg` (lock), `icon3.svg` (email).
- Decorative asset: `group-1.svg` (abstract shapes), `crave (Stroke).svg` (logo).
- Ellipse assets: `ellipse-3.svg`, `ellipse-4.svg`, `ellipse-5.svg`, `ellipse-17.svg`.

## Auth pages layout (client-app)
- All auth pages share: `container` (full viewport, `#101010`), `gradientBg` (top-left gradient), `content` (positioned container matching Figma coords).
- **SignIn** (`client-app/src/pages/SignIn.tsx`): "Welcome Back" centered, email + password fields with SVG icons, "Forgot password?" link, "Don't have an account? Create account" at bottom.
- **Register** (`client-app/src/pages/Register.tsx`): "Create Account" centered, 4 fields (name, email, password, location), hint text under location, "Already have an account? Sign in" below submit button. Uses flex layout — no absolute positioning for fields.
- **Start** (`client-app/src/pages/Start.tsx`): Splash screen with ellipses + emoji overlays, `group-1.svg` card, `crave (Stroke).svg` logo. Auto-redirects to `/signin` after 3s.
