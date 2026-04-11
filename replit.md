# Project Overview

EcoConnect is a Vite React waste-management platform imported from Lovable and adapted for Replit.

# Architecture

- Frontend: React, TypeScript, Vite, shadcn/ui, Tailwind CSS
- Backend: Express served from `server/index.ts`
- Database: Replit PostgreSQL via the server-side `DATABASE_URL` environment variable
- Data access: browser calls same-origin `/api/*` routes; PostgreSQL credentials stay server-side

# Migration Notes

- Supabase browser SDK usage was replaced with a Replit server API backed by PostgreSQL.
- Database credentials are read only on the server from environment variables and are not exposed to browser code.
- The development workflow runs `npm run dev`, which starts the Express/Vite server on port 5000.
- Database schema is synced with `npm run db:push`.