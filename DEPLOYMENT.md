# Hosted website

Deployed on 27 October 2026 under the Vercel account selected by the owner (`yxtubetv796@gmail.com`).

- Website: https://fswd.abhaysinh8.dev
- API: https://globetrotter-api-mu.vercel.app
- Supabase project: https://supabase.com/dashboard/project/iclegtmgzfsyfgjafkvu
- Region: Mumbai; Vercel functions use `bom1`.
- Deployment target: production, requested when connecting the public custom domain. Both production deployments reached `READY`, with their production aliases assigned.

## Deployment identifiers

| Component | Vercel project ID | Deployment ID |
| --- | --- | --- |
| Website | `prj_HdcxQbUrDjIQwlVTwVLBMQe8UQ1E` | `dpl_4bnKgdFnrZA6NUJqAWxF4pETVLaA` |
| API | `prj_7ODEtYu0QHIJOZX6ienUuxCXDQy7` | `dpl_5m7V2b6zWEbsSfaCyzEFrsTu4DRe` |

Runtime credentials are stored as encrypted Vercel environment variables. They are excluded from uploaded source files and Git. The website's `BACKEND_API_URL` points to the API deployment above. Public share links use the actual website origin.

The API's `FRONTEND_URL` is `https://fswd.abhaysinh8.dev`. The website uses the API's stable production hostname, so later production API deployments do not require changing the website environment variable.

## Custom domain

The domain remains registered with its existing provider. Name.com manages authoritative DNS. The owner added this Vercel-recommended record, and Vercel confirmed the DNS configuration is correct and project ownership is verified:

| Type | Host | Answer |
| --- | --- | --- |
| CNAME | `fswd` | `ddeafa56cede3fe2.vercel-dns-017.com` |

The subdomain is attached to `globetrotter-web` and follows its production deployment. Preserve the other DNS records. Vercel manages the HTTPS certificate for the connected hostname.

HTTPS was verified through a successful TLS handshake with certificate validation enabled. The certificate covers `fswd.abhaysinh8.dev`, is issued by Let's Encrypt, and has automatic renewal enabled in Vercel.

## Validation completed

- Both production builds passed; Vercel also completed both hosted builds.
- Backend and frontend lint and TypeScript checks passed.
- Eight API integration checks passed against Supabase, covering atomic creation, ownership, concurrent additions, saved order, dates, repeatable automatic plans, budget separation, and shared copies.
- Local browser checks against Supabase covered registration, login, trip creation, automatic planning after reload, and the calendar and builder at a 390px mobile width.
- Temporary test accounts and their trips were removed after verification.
- The compiled API runtime check passed, including a real PostgreSQL readiness query. The Prisma generator explicitly uses CommonJS to match Vercel's backend runtime and prevent startup crashes from `import.meta` in emitted CommonJS.
- A browser check on the production custom domain confirmed Explore loads the seeded destinations after the runtime repair.
- Production registration and sign-in succeeded in a real browser, reaching the authenticated dashboard. The temporary account was removed after verification.

Create your own account through the registration page. No public demo passwords are installed.

## Remaining product features

Password recovery emails and uploaded-photo storage are not configured. Photo URL editing supports valid external image links and handles failed image loads. Currency changes change the denomination; automatic exchange-rate conversion is not implemented.

## Future deployments

Use the same Vercel projects and the deployment steps in `README.md`. Deploy to production to update the public website. Keep the API's `JWT_SECRET` consistent across redeployments and retain the stable API hostname in `BACKEND_API_URL`. Preview deployments remain separate from the public domain.

Application tables deliberately deny access to Supabase's anonymous and authenticated Data API roles. Database access goes through the Express API and its ownership checks. Supabase may report the informational [RLS enabled without policies notice](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) for this intentional setup.
