# PantryPal backend

Express + Mongoose API for PantryPal. See the repo root README for the full product overview.

- `npm start` — production start
- `npm run dev` — watch mode
- `npm test` — backend checks incl. unit-conversion tests (in-memory MongoDB)
- `npm run seed` — seed demo data into `MONGODB_URI`
- `npm run atlas-check` — verify the Atlas connection string

Zero-config demo (PowerShell): `$env:USE_MEMORY_DB = "1"; npm start` boots an
ephemeral database and seeds it if empty. A configured MongoDB database is
also seeded on first startup if it has no users. The in-memory database is for
local demos only; its data disappears on restart.

The recommended Render deployment uses the repository's root `render.yaml` Blueprint to
build and serve both the frontend and API in one web service. Set `MONGODB_URI`
in Render's Environment page to a MongoDB Atlas connection string.
