# Astral Forge

A modern astrological blueprint engine — turns natal chart placements into intentional creation maps using a 9-point alchemical system. Built around the **Astral Forge Archetype Library** (864 planetary-sign combinations across 6 planetary relationships).

## Run & Operate

Use the **Astral Forge** and **API Server** workflows in Replit to start the services. To run manually:

- `pnpm --filter @workspace/astroboros run dev` — run the frontend (port 5173)
- `PORT=8080 pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

All commands must be run from the monorepo root.

## Required Environment Variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (for saved charts via Drizzle) |
| `CLERK_PUBLISHABLE_KEY` | Clerk auth — API server |
| `CLERK_SECRET_KEY` | Clerk auth — API server |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk auth — frontend |
| `VITE_CLERK_PROXY_URL` | Clerk proxy URL (e.g. `https://your-domain/api/__clerk`) |
| `VITE_SUPABASE_URL` | Supabase project URL (for blueprint sharing / anonymous saves) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (for blueprint sharing) |

## Stack

- **Monorepo:** pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend:** React 19, Vite, Tailwind CSS 4, Radix UI, TanStack Query, Wouter routing
- **API:** Express 5, Clerk auth middleware, Pino logging
- **Database:** PostgreSQL + Drizzle ORM (saved charts for signed-in users)
- **Blueprint sharing:** Supabase (anonymous blueprint save/load by shareable ID)
- **Auth:** Clerk (proxied through `/api/__clerk`)
- **API codegen:** Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)

## Where Things Live

- `lib/db/src/schema/index.ts` — DB schema source of truth
- `lib/api-spec/openapi.yaml` — API contract (source of truth for codegen)
- `artifacts/astroboros/src/` — frontend source
- `artifacts/api-server/src/` — backend source
- `artifacts/astroboros/src/lib/archetypes/` — Astral Forge archetype data

## Architecture Decisions

- Clerk auth is proxied through the API server (`/api/__clerk`) so the app works on `.replit.app` without a custom CNAME
- Blueprint sharing uses Supabase (anonymous, no login required); saved charts for signed-in users use the Drizzle/PostgreSQL backend
- `supabase.ts` initializes lazily (proxy pattern) so the app loads even without Supabase credentials
- API server defaults `PORT=8080` when unset (artifact.toml only injects PORT in production)

## Gotchas

- Run all pnpm commands from the monorepo root (`attached_assets/bring_app_life/Bring-App-Life/`)
- `drizzle-kit push` requires a reachable DATABASE_URL — ensure the host allows inbound connections from Replit's IP range
- Clerk proxy only activates in production (`NODE_ENV=production`) — dev uses Clerk's development instance directly
- `pnpm approve-builds` may be needed for `@clerk/shared` and `core-js` post-install scripts

## Product

- **Home:** Enter birth data to generate a natal chart blueprint
- **Blueprint:** Full alchemical reading with archetype interpretations across 9 enneagram points
- **Compare:** Side-by-side comparison of two natal blueprints
- **My Charts:** Saved blueprints for signed-in users
- **Blueprint sharing:** Shareable links for anonymous blueprints (via Supabase)

## User Preferences

_Populate as you build._

## Pointers

- See the `pnpm-workspace` skill for workspace structure and TypeScript setup
- Archetype expansion prompt: `attached_assets/Pasted-Astroboros-Archetype-Expansion-Prompt-Mirror-Generation_1784208077170.txt`
