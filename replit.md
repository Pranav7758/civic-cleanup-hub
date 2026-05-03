# Civic Cleanup Hub — SwachhSaathi

A full-stack civic engagement platform (Clean India Mission) rebuilt from GitHub into a pnpm monorepo on Replit.

## Architecture

**Monorepo structure (pnpm workspaces):**
- `artifacts/civic-cleanup` — React + Vite frontend (Tailwind v4, shadcn/ui, wouter, React Query)
- `artifacts/api-server` — Express + Drizzle ORM backend (TypeScript, PostgreSQL)
- `lib/api-spec` — OpenAPI 3 spec (source of truth)
- `lib/api-client-react` — Orval-generated React Query hooks
- `lib/api-zod` — Orval-generated Zod validation schemas
- `lib/db` — Drizzle schema + DB client (`@workspace/db`)

## User Roles & Routing

| Role | Default Route |
|---|---|
| Citizen | `/citizen` |
| Worker | `/worker` |
| NGO | `/ngo` |
| Scrap Dealer | `/scrap` |
| Admin | `/admin` |

## Demo Credentials

- **Admin**: `admin@civic.dev` / `password123`
- **Citizen**: `citizen@civic.dev` / `password123`
- **Worker**: `worker@civic.dev` / `password123`
- **NGO**: `ngo@civic.dev` / `password123`
- **Scrap Dealer**: `scrap@civic.dev` / `password123`

## Key Features

- **Auth**: Custom session auth, Bearer token in localStorage, `setAuthTokenGetter` wires into all generated hooks
- **Citizen**: Dashboard, Waste Reporting (+50 pts), Peer Verification (+10 pts), Wallet/Points, Tiered Cleanliness Score (Bronze→Diamond), Training Modules (+75 pts), Scrap Selling, Item Donations, Community Events, Leaderboard, Government Benefits, Redeem Items
- **Worker**: Assigned report queue, status updates, Dustbin QR scan/collection recording
- **NGO**: Pending donation pickups, community feed posts
- **Scrap Dealer**: Browse citizen scrap listings, accept/complete deals
- **Admin**: User management + role assignment, report moderation, training module creation, redeem item management
- **AI Classification**: Waste photo classification, donation analysis, scrap analysis (via OpenAI)

## Database Tables (PostgreSQL via Drizzle)

`app_users`, `sessions`, `user_roles`, `profiles`, `cleanliness_scores`, `wallet_transactions`, `government_benefits`, `redeem_items`, `training_modules`, `training_progress`, `waste_reports`, `scrap_prices`, `scrap_listings`, `scrap_listing_items`, `donations`, `community_events`, `event_registrations`, `community_posts`, `notifications`, `messages`, `dustbin_collections`

## API Routes (base: `/api`)

- `POST /api/auth/signup` — Register with role
- `POST /api/auth/signin` — Login, returns Bearer token
- `POST /api/auth/signout` — Logout
- `GET /api/auth/me` — Current user
- `GET/POST /api/reports` — Waste reports
- `PATCH /api/reports/:id` — Update report status
- `GET /api/reports/pending-verification` — Peer verify queue
- `POST /api/reports/verify` — Submit peer verification
- `GET /api/wallet/transactions` — Transaction history
- `GET /api/wallet/score` — Cleanliness score
- `GET /api/wallet/benefits` — Government benefits
- `GET /api/wallet/redeem-items`, `POST /api/wallet/redeem` — Redeem store
- `GET /api/training/modules`, `GET /api/training/progress`, `PATCH /api/training/progress` — Training
- `GET /api/scrap/prices`, `GET/POST /api/scrap/listings`, `PATCH /api/scrap/listings/:id` — Scrap marketplace
- `GET/POST /api/donations`, `PATCH /api/donations/:id` — Donations
- `GET /api/events`, `POST /api/events/:id/register` — Events
- `GET /api/dashboard/citizen`, `GET /api/dashboard/worker`, `GET /api/dashboard/ngo` — Dashboards
- `GET /api/dashboard/leaderboard` — Rankings
- `GET /api/admin/dashboard`, `GET /api/admin/users`, `PATCH /api/admin/users/:id/roles` — Admin
- `GET /api/dustbin-collections`, `POST /api/dustbin-collections` — Worker dustbin scans
- `POST /api/classify-waste`, `POST /api/analyze-donation`, `POST /api/analyze-scrap` — AI features

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui, wouter, React Query, react-hook-form, zod
- Backend: Express.js, Drizzle ORM, PostgreSQL, crypto (scrypt) auth
- Code generation: Orval (OpenAPI → hooks + Zod schemas)
- Styling: Emerald/green civic theme, full dark mode support

## Important Notes

- `setAuthTokenGetter` from `@workspace/api-client-react` injects Bearer token into all generated hooks
- Orval config in `lib/api-spec/orval.config.ts` uses `mode: "split"` for react-query and `mode: "single"` for zod
- Run `pnpm --filter @workspace/api-spec run codegen` after changing `lib/api-spec/openapi.yaml`
- File uploads (waste/donation/scrap images) use optional Supabase storage — gracefully skipped when `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` env vars are not set
- Demo accounts are auto-seeded by the API server on startup
