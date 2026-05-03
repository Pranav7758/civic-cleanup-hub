# SwachhSaathi — Civic Cleanup Hub

A full-stack civic engagement platform that connects citizens, sanitation workers, NGOs, scrap dealers, and administrators to build cleaner, greener communities across India.

---

## Overview

SwachhSaathi (meaning "Cleanliness Companion") digitises India's waste management and civic hygiene ecosystem. Citizens report waste, earn reward points, sell scrap, attend community events, and learn through training modules. Each stakeholder role gets a dedicated, purpose-built dashboard.

---

## Roles

| Role | Purpose |
|------|---------|
| **Citizen** | Report waste, sell scrap, attend events, earn wallet points, redeem rewards |
| **Worker** | Receive and complete assigned cleanup tasks, scan dustbins, complete training |
| **NGO** | Manage community events, government camps, post urgent volunteer/donation needs |
| **Scrap Dealer** | View citizen scrap listings, accept requests, manage pickups and pricing |
| **Admin** | Oversee all users, reports, training modules, redeem items, and events |

---

## Demo Credentials

All accounts use password: `password123`

| Role | Email |
|------|-------|
| Citizen | citizen@civic.dev |
| Worker | worker@civic.dev |
| NGO | ngo@civic.dev |
| Scrap Dealer | scrap@civic.dev |
| Admin | admin@civic.dev |

---

## Features

### Citizen
- Waste report submission with photo and location
- QR-coded smart dustbin scan
- Sell scrap — create listings with item weights and categories
- Wallet with earned points and transaction history
- Redeem points for real rewards (electricity discounts, plant saplings, cinema vouchers, etc.)
- Register for community events and government camps to earn points
- Help NGOs by responding with volunteer or donation offers (includes photo, mobile, address)
- Environmental training modules with progress tracking
- Leaderboard — city and neighbourhood rankings

### Worker
- Assigned waste reports queue with priority levels
- Smart bin live status monitoring
- Dustbin QR scan and verification
- Training and certifications

### NGO
- Create and manage community events (cleanup drives, plantation, awareness, government camps, health camps)
- Post urgent volunteer and donation needs
- Manage event participants and mark attendance
- Record event results (waste collected, participant count)

### Scrap Dealer
- View all pending citizen scrap listings
- Accept requests and track pickups
- Scrap pricing reference table
- Analytics dashboard

### Admin
- User management across all roles
- Waste report overview and assignment
- Training module and redeem item management
- Community events management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Wouter (routing) |
| Styling | Custom CSS design system (gov-card, gov-btn, gov-badge tokens) |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL with Drizzle ORM |
| Auth | Custom scrypt session tokens (Bearer) |
| Monorepo | pnpm workspaces |
| API Contract | OpenAPI 3 → generated React Query hooks + Zod schemas |

---

## Project Structure

```
artifacts/
  civic-cleanup/        # React + Vite frontend
  api-server/           # Express API server
lib/
  db/                   # Drizzle schema and migrations
  api-spec/             # OpenAPI spec and codegen
  api-client-react/     # Generated React Query hooks
```

---

## Getting Started

The project runs via Replit workflows. Both services start automatically:

- **API Server** — Express on the configured port, served at `/api`
- **Frontend** — Vite dev server served at `/`

Database migrations run automatically on server start. Demo accounts and seed data are created on first boot.

---

## Points System

| Action | Points |
|--------|--------|
| Waste report submitted | +10 pts |
| Report resolved | +25 pts |
| Scrap sold | +25–100 pts (based on value) |
| Event registration | +75–150 pts |
| Training module completed | +30 pts |
| NGO help response | +20 pts |

Points accumulate in the citizen wallet and can be redeemed for utility bill discounts, eco products, and more.
