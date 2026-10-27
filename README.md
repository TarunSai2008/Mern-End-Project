# PantryPal — Cook what you have. Buy only what's missing.

A pantry tracker that turns your shelves into meals and your recipe gaps into
a smart, aisle-grouped grocery list.

**Demo video:** [Watch the PantryPal walkthrough](https://drive.google.com/file/d/1F-D8V4DhFqRezlNapRYN1Rk6nUMEMuSo/view?usp=drive_link)

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
| Tests | Node.js test runner + `mongodb-memory-server` |
| Deployment | One Render web service serves the React app and Express API; MongoDB Atlas stores data |

## Architecture

```text
React SPA (served by the Express app) — kitchen tabs, pantry tiles, cook-mode checklist
   │  same-origin axios + JWT bearer
   ▼
Express API (Render, same service)
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
npm test                       # backend suite (no external database needed)

# Zero-config demo (PowerShell):
$env:USE_MEMORY_DB = "1"
npm start                      # API on http://localhost:5108

# Or with a real MongoDB:
cp .env.example .env           # set MONGODB_URI + JWT_SECRET
npm start

# 2. Frontend (start this in a second terminal)
cd ../frontend
npm install
npm run dev                    # app on http://localhost:5308
```

On first startup, an empty database is seeded with the demo account, sample
pantry, grocery item, and recipe catalog. The documented demo account is for
showcase use; use your own account for personal data.

The Vite development server proxies `/api` to the backend, matching the
same-origin setup used by the deployed app.

**Demo credentials**: `arav@demo.com` / `Demo@1234`. Seed includes a 28-item
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
| `CLIENT_ORIGIN` | Optional frontend origin for a separately hosted frontend; leave blank for the single-service setup |

### frontend/.env

| Name | Purpose |
|---|---|
| `VITE_API_URL` | API base URL override for a separately hosted frontend (default `/api`) |

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

- **One-service deployment (recommended)**: In Render, create a Blueprint from
  this repository and use the root `render.yaml`. It builds the React app,
  then serves the frontend and API from one `onrender.com` URL. Set the
  `MONGODB_URI` environment variable to your MongoDB Atlas connection string.
  An empty database is seeded automatically on first startup. `JWT_SECRET` is
  generated by Render. Keep database credentials in Render's
  Environment page, never in Git or a committed `.env` file. In Atlas, allow
  connections from your Render service's outbound IP addresses (or configure
  Atlas network access for your deployment).
- **Free plan behavior**: Render spins a free web service down after 15 minutes
  without traffic; the first request after that can take about a minute to
  wake. MongoDB Atlas keeps app data independently of service restarts. See
  [Render's free service limits](https://render.com/docs/free).
- **Temporary demo fallback**: If Atlas rejects the database credentials, the
  app starts with an in-memory demo database so the showcase remains available.
  Changes made in this mode reset whenever the Render service restarts. Set a
  valid `MONGODB_URI` to use persistent Atlas storage.
- **Separate frontend hosting (optional)**: If you later deploy the frontend to
  Vercel, set `VITE_API_URL` to the full Render API URL ending in `/api`, and
  set the backend's `CLIENT_ORIGIN` to the Vercel site origin.

Live app: <https://pantrypal-ggfc.onrender.com>

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

- **Weekly meal planner** — pick the ready recipes, get one aggregated shopping list (quantities merged, pantry netted out), push it to the grocery list in a tap.

## Roadmap

- Barcode-scan restocking.
- Recipe contributions by users.
- Price capture for a real "money saved" metric.
- Household sharing with multiple members.
