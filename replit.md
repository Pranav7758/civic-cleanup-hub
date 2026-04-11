# Project Overview

EcoConnect is a Vite React waste-management platform imported from Lovable and adapted for Replit.

# Architecture

- Frontend: React, TypeScript, Vite, shadcn/ui, Tailwind CSS
- Backend: Express served from `server/index.ts`
- Database: Supabase PostgreSQL when `SUPABASE_DATABASE_URL` is configured, otherwise Replit PostgreSQL via `DATABASE_URL`
- Data access: browser calls same-origin `/api/*` routes; PostgreSQL credentials stay server-side

# Migration Notes

- Supabase browser SDK usage was replaced with a Replit server API backed by PostgreSQL.
- Supabase credentials are expected to be stored as environment secrets, not committed to source.
- The development workflow runs `npm run dev`, which starts the Express/Vite server on port 5000.
- Database schema is synced with `npm run db:push`.