---
name: Astral Forge auth setup
description: Auth, routing, and backend architecture decisions
---

## Frontend routing
- wouter (NOT react-router-dom) — required for Clerk compatibility
- ClerkProvider lives inside WouterRouter in App.tsx; routerPush/routerReplace use useLocation

## Clerk setup
- publishableKeyFromHost() pattern (verbatim, required) in App.tsx
- Env vars: VITE_CLERK_PUBLISHABLE_KEY (frontend), CLERK_SECRET_KEY (API server)
- Dark space appearance: shadcn theme + cssLayerName: "clerk"
- CSS layer order in index.css: @layer theme, base, clerk, components, utilities; BEFORE @import tailwindcss
- tailwindcss({ optimize: false }) in vite.config.ts — required for Clerk theme CSS @layer ordering in prod
- Appended Clerk CSS must use real newlines (literal \n in CSS causes Tailwind parse errors)

## API server
- Always runs on port 8080 (Replit artifact workflow assigns it)
- Vite proxy: /api → http://localhost:8080 (configured in vite.config.ts)
- Charts routes: GET/POST/DELETE /api/charts — auth via getAuth from @clerk/express
- Drizzle schema: saved_charts (id uuid, user_id text, name text, birthInput jsonb, createdAt timestamptz)

## Pages & UI
- /sign-in, /sign-up — embedded Clerk components with full dark space appearance
- /my-charts — Show when="signed-in", fetches from /api/charts
- Reading page — "Save Blueprint" button visible only when signed-in (Show component)
- Header — Show when="signed-in/out" for conditional nav; useClerk().signOut() for logout
