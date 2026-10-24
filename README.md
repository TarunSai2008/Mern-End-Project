# PantryPal — Cook what you have. Buy only what's missing.

A pantry tracker that turns your shelves into meals and your recipe gaps into
a smart, aisle-grouped grocery list.

---

## Problem Statement

Households forget what's in the pantry, throw away expired food, and shop from
memory — buying duplicates while missing essentials. PantryPal tracks inventory
with expiry alerts, matches it against recipes with quantity-aware shortfalls,
and deducts what you cook.

## Target Users

- **Busy households** deciding "what's for dinner?" from what they actually own.
- **Budget-conscious cooks** who want a grocery list built from real gaps.
- **Waste-watchers** tracking what expires unused.

## Solution

Stock a pantry (name, quantity, unit, aisle, expiry). The match engine ranks
20 built-in recipes by how much of each you already have — "Ready ✓" or
"Missing 2: garlic, butter". Cook mode deducts used quantities transactionally
(all-or-nothing), and one tap merges every shortfall into a grocery list
grouped by aisle with zero duplicates.

## Key Features

- **Expiry-smart pantry** — "use first" badges within 3 days, expired alerts,
  and a "use first" banner on the kitchen page.
- **Quantity-aware matching** — shortfalls computed with unit-family
  compatibility (g/kg, ml/l); incompatible staples (grams vs teaspoons) are
  assumed available rather than blocking recipes.
- **Transactional cook mode** — validates every ingredient before deducting
  anything; a shortfall (409) leaves the pantry untouched.
- **Smart grocery list** — "add missing" merges by ingredient, marks items
  already listed, groups by aisle, and never duplicates.
- **Waste report** — expired-in-pantry, use-within-3-days, shelf distribution.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS 4, React Router 6, Axios |
| Backend | Node.js, Express 4, Mongoose 8, Zod validation |
| Auth | JWT (7-day), bcryptjs, rate-limited auth |
| Database | MongoDB (Atlas or local); `USE_MEMORY_DB=1` zero-config demo |
| Tests | `node:test` + `mongodb-memory-server` (17 checks incl. unit-conversion tests) |
| Deployment | Render (backend `render.yaml`) + Vercel (frontend `vercel.json`) |

## Architecture

```text
React SPA (Vercel) — kitchen tabs, pantry tiles, cook-mode checklist
   │  axios + JWT bearer
   ▼
Express API (Render)
   │   /api/pantry          CRUD with computed expiry status
   │   /api/recipes/match   rank by quantity-aware shortfalls (units engine)
   │   /api/recipes/:id/cook        validate-then-deduct (all-or-nothing)
   │   /api/recipes/:id/add-missing  merge shortfalls into grocery list
   │   /api/grocery         CRUD + aisle grouping
   │   /api/reports/waste   expired / expiring / aisle distribution
   ▼
utils/units.js — name + unit normalization, compatible families, base conversion
   ▼
MongoDB: User · PantryItem (unique per user+name) · Recipe (catalog) · GroceryItem
```

## Major Workflows

1. **Stock the pantry** — tiles with quantity bars, aisle chips and expiry
   countdowns; duplicates rejected (409) with an "edit instead" hint.
2. **What can I cook?** — every recipe ranked by shortfall count with the
   exact missing items and quantities.
3. **Cook mode** — tick ingredients, adjust servings (quantities rescale),
   confirm → pantry quantities deduct atomically.
4. **Smart grocery list** — "+ missing to list" merges a recipe's shortfalls;
   ticking off items; re-merging adds nothing twice.
5. **Waste report** — what expired, what's urgent, and where your shelves run
   heavy.

## Local Setup

```bash
# 1. Backend
cd backend
npm install
npm test                       # 17-check suite (no database needed)

# Zero-config demo:
USE_MEMORY_DB=1 npm start      # API on http://localhost:5108

# Or with a real MongoDB:
cp .env.example .env           # set MONGODB_URI + JWT_SECRET
npm run seed
npm start

# 2. Frontend
cd ../frontend
npm install
npm run dev                    # app on http://localhost:5308
```

**Demo credentials**: `arav@demo.com` / `Demo@1234`. Seed includes a 27-item
pantry (one expired, several expiring), 20 recipes, and a grocery list with
one pending item.

## Environment Variables

### backend/.env

| Name | Purpose |
|---|---|
| `PORT` | API port (default 5108) |
| `MONGODB_URI` | MongoDB connection string (empty + `USE_MEMORY_DB=1` for demo mode) |
| `USE_MEMORY_DB` | `1` = ephemeral in-memory MongoDB, auto-seeded on boot |
| `JWT_SECRET` | Secret used to sign JWTs — long random string in production |
| `CLIENT_ORIGIN` | Frontend origin allowed by CORS (default http://localhost:5308) |

### frontend/.env

| Name | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL (default http://localhost:5108/api) |

## API Overview

| Method & path | Purpose |
|---|---|
| `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` | Auth |
| `GET/POST /api/pantry` · `PATCH/DELETE /api/pantry/:id` | Pantry CRUD (expiry computed) |
| `GET /api/recipes` · `GET /api/recipes/match` · `GET /api/recipes/:id` | Catalog + ranked matching |
| `POST /api/recipes/:id/cook` | Transactional deduction (409 on shortfall) |
| `POST /api/recipes/:id/add-missing` | Merge shortfalls into grocery list |
| `GET/POST /api/grocery` · `PATCH/DELETE /api/grocery/:id` | Grocery list |
| `GET /api/reports/waste` | Waste analytics |
| `GET /api/health` | Health probe |

## Deployment

- **Backend**: Render web service from `backend/render.yaml`; set `MONGODB_URI`,
  `JWT_SECRET`, `CLIENT_ORIGIN`; health check `/api/health`.
- **Frontend**: Vercel from `frontend/` (SPA rewrite); set `VITE_API_URL`.

Live links: backend — [add URL] · frontend — [add URL]

## Error Handling & Security

- Zod validation everywhere; negative quantities, malformed dates and
  out-of-range servings rejected with clear messages.
- Duplicate protection via unique compound indexes (user+name) surfaced as
  friendly 409s.
- Cook mode is validate-then-mutate: a 409 leaves the pantry byte-identical.
- Pantry and grocery queries are user-scoped; another account's data is never
  visible or mutable.
- bcrypt(12) hashing, no account enumeration, rate-limited auth, 7-day JWTs.
- Frontend handles loading/empty/error/success states; toasts on every
  mutation; 401 auto-logout.

## Roadmap

- Barcode-scan restocking.
- Recipe contributions by users.
- Price capture for a real "money saved" metric.
- Household sharing with multiple members.
