# GlobeTrotter

A travel planning platform — design multi-city itineraries, browse destinations and activities, track trip budgets, and share trips publicly.

## Structure

This is an npm workspaces monorepo:

- `frontend/` — Next.js app (UI + a thin API proxy layer to the backend)
- `backend/` — Express API backed by Prisma + PostgreSQL

## Getting started

1. Install dependencies from the repo root:

   ```bash
   npm install
   ```

2. Configure the backend database. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to a PostgreSQL connection string.

3. Set up the database:

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run seed
   ```

4. Run both apps together:

   ```bash
   npm run dev
   ```

   Frontend runs on `http://localhost:3000`, backend on `http://localhost:4000`.

### Seeded accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@globetrotter.dev` | `GlobeTrotter123` |
| User | `yash@example.com` | `TravelReady123` |
| User | `maya@example.com` | `TravelReady123` |

Admin accounts can view platform-wide stats at `/admin`.
