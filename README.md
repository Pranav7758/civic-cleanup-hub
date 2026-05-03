# ♻️ SwachhSaathi — Civic Cleanup Hub

> **India's Circular Economy & Clean India Mission Platform**
> A full-stack civic engagement ecosystem connecting Citizens, Sanitation Workers, NGOs, Scrap Dealers, and Administrators.

---

## 🌿 What is SwachhSaathi?

SwachhSaathi ("Clean Friend" in Hindi) is a role-based civic platform built to power India's **Swachh Bharat Mission**. It creates a circular economy where:

- 🏘️ **Citizens** report waste, sell scrap, donate goods, and earn reward points
- 🚛 **Workers** collect waste, scan dustbins, and complete field tasks
- 🤝 **NGOs** coordinate donations, camps, and urgent community needs
- ♻️ **Scrap Dealers** buy citizen scrap, manage pickup routes, and track earnings
- 🛡️ **Admins** govern the platform, manage users, moderate reports, and set policies

Every action in the platform feeds back into the ecosystem — a citizen sells scrap → dealer collects it → citizen earns points → points unlock government benefits → everyone wins.

---

## 🎨 Module Color Themes

Each role has a distinct visual identity to make switching between accounts instantly recognisable.

| Role | Color | Sidebar | Page Background |
|---|---|---|---|
| 🌿 **Citizen** | Forest Green | `#1b5e20 → #2e7d32` | Soft green mist |
| 💜 **Worker** | Deep Violet | `#3b1fa8 → #7c3aed` | Lavender tint |
| 🌊 **NGO** | Dark Teal | `#004d40 → #00695c` | Aqua-mint tint |
| 🟠 **Scrap Dealer** | Deep Orange | `#bf360c → #e64a19` | Warm amber/cream |
| 🔵 **Admin** | Navy Indigo | `#1a237e → #283593` | Periwinkle tint |

---

## 🏗️ Architecture

```
SwachhSaathi Monorepo (pnpm workspaces)
├── artifacts/
│   ├── civic-cleanup/        ← React + Vite frontend
│   └── api-server/           ← Express + Drizzle backend
├── lib/
│   ├── api-spec/             ← OpenAPI 3 spec (source of truth)
│   ├── api-client-react/     ← Orval-generated React Query hooks
│   ├── api-zod/              ← Orval-generated Zod schemas
│   └── db/                   ← Drizzle ORM schema + PostgreSQL client
└── scripts/                  ← Shared utility scripts
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, shadcn/ui |
| **Routing** | wouter |
| **Data Fetching** | TanStack React Query + Orval-generated hooks |
| **Forms** | react-hook-form + Zod |
| **Backend** | Express.js, TypeScript, Node.js |
| **ORM** | Drizzle ORM |
| **Database** | PostgreSQL |
| **Auth** | Custom scrypt session tokens, Bearer token in localStorage |
| **AI** | OpenAI (waste classification, scrap identification, donation analysis) |
| **Code Generation** | Orval — OpenAPI → React Query hooks + Zod schemas |

---

## 👥 User Roles & Pages

### 🌿 Citizen (`/citizen`)

| Page | Route | Description |
|---|---|---|
| Dashboard | `/citizen` | Cleanliness score, wallet summary, quick actions |
| Report Waste | `/citizen/reports` | Submit waste reports with photo + AI classification |
| Wallet | `/citizen/wallet` | Points balance, transaction history, redeem items, govt benefits |
| Training | `/citizen/training` | Waste segregation courses, earn 75 pts per module |
| Sell Scrap | `/citizen/scrap` | List scrap for pickup with AI image identifier |
| Donate | `/citizen/donate` | Donate goods to NGOs |
| Events | `/citizen/events` | Browse & register for cleanup drives |
| Help NGOs | `/citizen/ngo-needs` | View and respond to NGO urgent needs |
| Leaderboard | `/citizen/leaderboard` | City-wide rankings |
| My Dustbin | `/citizen/dustbin` | QR-linked personal dustbin |

**Point Economy:**
- Report waste → **+50 pts**
- Peer-verify a report → **+10 pts**
- Complete training module → **+75 pts**
- Scrap pickup completed → **+reward pts**
- Donation collected → **+60 pts**

### 🚛 Worker (`/worker`)

| Page | Route | Description |
|---|---|---|
| Dashboard | `/worker` | Assigned tasks, earnings, route summary |
| Assigned Reports | `/worker/reports` | Accept & resolve citizen waste reports |
| Smart Bins | `/worker/bins` | Live IoT dustbin fill-level monitoring |
| Dustbin Scan | `/worker/dustbin` | QR scan → log collection |
| Training | `/worker/training` | Safety & protocol training modules |

### 🤝 NGO (`/ngo`)

| Page | Route | Description |
|---|---|---|
| Dashboard | `/ngo` | Impact stats, volunteer count, upcoming events |
| Donations | `/ngo/donations` | Manage citizen donations — filter by category, schedule pickups |
| Community Feed | `/ngo/feed` | Post updates and community announcements |
| Camps & Events | `/ngo/manage-events` | Create and manage cleanup events |
| Urgent Needs | `/ngo/urgent` | Post urgent community needs (visible to citizens) |

### ♻️ Scrap Dealer (`/scrap`)

| Page | Route | Description |
|---|---|---|
| Dashboard | `/scrap` | Orange hero, wallet, weekly earnings chart, material breakdown |
| Citizen Requests | `/scrap/listings` | Browse & accept citizen scrap listings (live API) |
| Pickup Schedule | `/scrap/schedule` | ✨ NEW: Timeline route view of accepted pickups |
| Market Pricing | `/scrap/prices` | Live scrap rates — cards or table view, trend indicators |
| Analytics | `/scrap/analytics` | ✨ NEW: Weekly/monthly charts, material breakdown, achievements |

### 🛡️ Admin (`/admin`)

| Page | Route | Description |
|---|---|---|
| Dashboard | `/admin` | Platform stats, alerts, system health |
| Users | `/admin/users` | Manage all users, assign roles |
| Reports | `/admin/reports` | Moderate citizen waste reports |
| Training | `/admin/training` | Create & manage training modules |
| Redeem Items | `/admin/redeem` | Configure the points redemption store |
| Events | `/admin/events` | Approve and manage all platform events |

---

## 🗃️ Database Schema

```
PostgreSQL Tables (via Drizzle ORM)
├── app_users               ← Core user accounts
├── sessions                ← Auth session tokens
├── user_roles              ← Role assignments (citizen/worker/ngo/scrap_dealer/admin)
├── profiles                ← Extended user profiles
├── cleanliness_scores      ← Tiered score: Bronze → Silver → Gold → Platinum → Diamond
├── wallet_transactions     ← Point credits & debits
├── government_benefits     ← Unlockable govt scheme eligibility
├── redeem_items            ← Reward store catalog
├── training_modules        ← Course definitions
├── training_progress       ← Per-user completion tracking
├── waste_reports           ← Citizen waste submissions
├── scrap_prices            ← Live market rate catalog
├── scrap_listings          ← Citizen sell listings
├── scrap_listing_items     ← Individual items per listing
├── donations               ← Citizen → NGO donation records
├── community_events        ← Cleanup drives & camps
├── event_registrations     ← Citizen event sign-ups
├── community_posts         ← NGO community feed
├── notifications           ← In-app notification log
├── messages                ← Inter-user messaging
└── dustbin_collections     ← Worker QR scan records
```

---

## 🌐 API Reference

**Base URL:** `/api`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/signup` | Register with role |
| `POST` | `/auth/signin` | Login → returns Bearer token |
| `POST` | `/auth/signout` | Logout |
| `GET` | `/auth/me` | Current user info |

### Citizen
| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/reports` | Waste reports |
| `PATCH` | `/reports/:id` | Update report status |
| `GET` | `/reports/pending-verification` | Peer verify queue |
| `POST` | `/reports/verify` | Submit peer verification (+10 pts) |
| `GET` | `/wallet/transactions` | Transaction history |
| `GET` | `/wallet/score` | Cleanliness score & tier |
| `GET` | `/wallet/benefits` | Govt scheme eligibility |
| `GET` | `/wallet/redeem-items` | Reward store catalog |
| `POST` | `/wallet/redeem` | Redeem points for reward |
| `GET` | `/training/modules` | All training modules |
| `GET` | `/training/progress` | User progress |
| `PATCH` | `/training/progress` | Update completion |
| `GET/POST` | `/donations` | Citizen donations |
| `PATCH` | `/donations/:id` | Update donation status |
| `GET` | `/events` | Community events |
| `POST` | `/events/:id/register` | Register for event |

### Scrap
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/scrap/prices` | Live market rates |
| `GET/POST` | `/scrap/listings` | Scrap listings |
| `PATCH` | `/scrap/listings/:id` | Accept / complete listing |

### Dashboards
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/citizen` | Citizen dashboard data |
| `GET` | `/dashboard/worker` | Worker dashboard data |
| `GET` | `/dashboard/ngo` | NGO dashboard data |
| `GET` | `/dashboard/leaderboard` | City rankings |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/dashboard` | Platform-wide stats |
| `GET` | `/admin/users` | All users |
| `PATCH` | `/admin/users/:id/roles` | Assign roles |

### AI Features
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/classify-waste` | Identify waste type from photo |
| `POST` | `/analyze-donation` | Analyse donation photo |
| `POST` | `/analyze-scrap` | AI scrap type & price estimate |

### IoT / NGO / Worker
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dustbin-collections` | Collection records |
| `POST` | `/dustbin-collections` | Log QR scan |
| `GET/POST` | `/urgent-needs` | NGO urgent need posts |
| `PATCH` | `/urgent-needs/:id/respond` | Citizen respond to need |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- PostgreSQL database

### Setup

```bash
# Install dependencies
pnpm install

# Set environment variables (see below)
# Then start both services:

# Start API server
pnpm --filter @workspace/api-server run dev

# Start frontend (separate terminal)
pnpm --filter @workspace/civic-cleanup run dev
```

### Environment Variables

```env
# API Server
DATABASE_URL=postgresql://user:pass@host:5432/swachhsaathi
SESSION_SECRET=your-secret-here
PORT=8080

# Frontend (optional — AI features)
VITE_OPENAI_API_KEY=sk-...
```

### Regenerate API Client

After modifying `lib/api-spec/openapi.yaml`:

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Type Check Everything

```bash
pnpm run typecheck
```

---

## 🔐 Demo Credentials

All accounts use password: `password123`

| Role | Email |
|---|---|
| 🌿 Citizen | `citizen@civic.dev` |
| 🚛 Worker | `worker@civic.dev` |
| 🤝 NGO | `ngo@civic.dev` |
| ♻️ Scrap Dealer | `scrap@civic.dev` |
| 🛡️ Admin | `admin@civic.dev` |

> Demo accounts are auto-seeded by the API server on every startup.

---

## ♻️ The Circular Economy Loop

```
Citizen lists scrap
        ↓
Scrap Dealer accepts & schedules pickup
        ↓
Dealer collects at the door
        ↓
Dealer marks "Collected" → Citizen earns reward points
        ↓
Citizen redeems points for govt benefits or store items
        ↓
Materials enter the recycling chain → CO₂ saved
        ↓
Platform tracks impact: kg recycled, tonnes CO₂ offset
```

---

## 🌱 Impact Metrics Tracked

| Metric | Description |
|---|---|
| **Cleanliness Score** | Bronze → Silver → Gold → Platinum → Diamond tier per citizen |
| **Total Scrap Recycled** | kg collected across all dealers |
| **CO₂ Offset** | Estimated carbon saving from recycling |
| **Donations Collected** | Clothes, food, electronics routed to NGOs |
| **Reports Resolved** | Waste complaints closed by workers |
| **Training Completions** | Citizens certified in waste segregation |

---

## 📁 Project Structure

```
artifacts/civic-cleanup/src/
├── components/
│   ├── DashboardLayout.tsx   ← Shared layout — per-role color themes
│   └── ui/                   ← shadcn/ui component library
├── context/
│   └── AuthContext.tsx       ← Auth state, token management
├── pages/
│   ├── citizen/              ← 🌿 Green theme pages
│   ├── worker/               ← 💜 Purple theme pages
│   ├── ngo/                  ← 🌊 Teal theme pages
│   ├── scrap/                ← 🟠 Orange theme pages
│   └── admin/                ← 🔵 Navy theme pages
└── styles/
    ├── dashboard.css          ← Gov design system tokens
    ├── worker.css             ← Worker module styles
    ├── ngo.css                ← NGO module styles
    └── scrap.css              ← Scrap module styles
```

---

## 🤝 Contributing

1. All API contracts live in `lib/api-spec/openapi.yaml` — edit spec first, then run codegen
2. Never call service ports directly — always use the proxy at `localhost:80`
3. Each role's pages are fully isolated — do not mix citizen and dealer UI
4. Use `req.log` in route handlers (never `console.log`) for structured logging
5. Run `pnpm run typecheck` before committing

---

*Built with ♻️ for a cleaner India — SwachhSaathi Technologies*
