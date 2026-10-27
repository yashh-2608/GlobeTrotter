# GlobeTrotter

A travel planner with multi-city itineraries, calendars, budget estimates and public sharing.

Public website: [fswd.abhaysinh8.dev](https://fswd.abhaysinh8.dev). See `DEPLOYMENT.md` for the project identifiers and DNS configuration.

## Stack

- `frontend/`: Next.js 16, React 19 and Auth.js credentials sessions.
- `backend/`: Express 5, Prisma 7 and PostgreSQL (including Supabase).
- The browser calls the Next.js API routes. Those routes forward authenticated requests to Express.
- Prisma migrations own the application schema. Supabase's public Data API has no access to application tables; Express enforces ownership using signed tokens.

## Local setup

1. Install dependencies with Node.js 24: `npm ci`.
2. Copy `backend/.env.example` to `backend/.env` and `frontend/.env.example` to `frontend/.env.local`.
3. Set `DATABASE_URL` to a PostgreSQL URL. On an IPv4 workstation using Supabase, choose its session pooler on port 5432. URL-encode special characters in the password.
4. Generate separate random secrets for `JWT_SECRET` and `AUTH_SECRET`, for example using `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
5. Run `npm run prisma:generate`, then `npm run prisma:deploy --workspace backend`.
6. Run `npm run seed` to populate destinations and activities. This is repeatable and preserves accounts and trips. It does not create public demo accounts.
7. Run `npm run dev`, then open `http://localhost:3000` and create an account.

The API listens on port 4000. `/api/health` checks the process; `/api/ready` also checks database connectivity. Supabase's published root certificate is bundled for verified TLS connections.

## Validation

```sh
npm run build
npm run lint
npm run typecheck --workspace frontend
npm run typecheck --workspace backend
npm run test --workspace backend
npm run test:compiled --workspace backend
```

Integration tests need a migrated database and seeded catalogue. They create temporary test accounts and remove only the records belonging to those accounts afterward. They exercise rollback, concurrent stop insertion, persisted reordering, ownership, date validation, automatic planning, budgets and public copies.

The compiled runtime check builds the API and loads its emitted JavaScript to verify Prisma starts and reaches PostgreSQL. Prisma's generator explicitly uses CommonJS to match the backend's runtime module format.

## Hosting on Vercel with Supabase

Create two Vercel projects from this repository:

| Project | Root directory | Framework | Build command |
| --- | --- | --- | --- |
| API | `backend` | Express | `npm run vercel-build` |
| Website | `frontend` | Next.js | `npm run build` |

Use Node.js 24 for both. Choose a function region close to the database, such as Mumbai (`bom1`).

Set these API environment variables through Vercel's encrypted environment settings:

- `DATABASE_URL`: Supabase PostgreSQL connection URL (session pooler 5432).
- `JWT_SECRET`: random server secret, at least 32 characters.
- `FRONTEND_URL`: the website's URL.

Set these website variables:

- `BACKEND_API_URL`: `https://YOUR_API_DEPLOYMENT/api`.
- `AUTH_SECRET`: a different random secret, at least 32 characters.
- `AUTH_TRUST_HOST`: `true`.

Apply migrations and seed the catalogue before opening registration. Neither deployment build runs the seed or deletes data. The API must be reachable by the website's server; application endpoints still require the user's API token.

Keep `.env` files out of Git and deployment source uploads. Set hosted secrets through Vercel environment variables. Reuse the same API JWT secret across API redeployments so existing sessions continue working.

## Planning behavior

- Trip creation saves all selected destinations atomically.
- Destination order is saved through a bulk reorder endpoint.
- Auto plan adds highly rated catalogue activities to stops without existing activities. Repeated requests preserve existing plans.
- Calendars display saved stop and activity dates and support month navigation.
- Budget estimates and recorded expenses are separate. Catalogue prices are estimates in INR; changing a trip currency changes its denomination and does not perform currency conversion.
- Password recovery email and uploaded-photo storage are not configured. Registration and password login are supported; photo fields accept valid image URLs.
