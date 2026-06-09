# Bookly — Frontend

## A production-ready, mobile-first booking frontend for barbershops.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL to your backend
pnpm dev                     # http://localhost:3000
```

Scripts: `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm typecheck` · `pnpm lint`
· `pnpm test` · `pnpm test:e2e`

### Environment

| Variable                   | Description                                           |
| -------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Go backend (default `localhost:8080`) |
| `NEXT_PUBLIC_APP_URL`      | Public URL of this app (Paystack callback URLs)       |
| `API_PROXY_TARGET`         | Optional dev proxy target to avoid CORS               |

## Key routes

| Route                                | Purpose                                                              |
| ------------------------------------ | -------------------------------------------------------------------- |
| `/`                                  | Marketing landing page                                               |
| `/book/[shopSlug]`                   | **Customer booking flow** (the core journey)                         |
| `/payment/callback`                  | Paystack return URL — polls `GET /bookings/:code` for live status    |
| `/login` `/signup`                   | Owner authentication                                                 |
| `/forgot-password` `/reset-password` | Password recovery (real BE endpoints)                                |
| `/onboarding/*`                      | 3-step shop setup (shop → capacity → hours)                          |
| `/dashboard`                         | Overview                                                             |
| `/dashboard/bookings`                | Bookings list with **search + pagination** + read-only detail drawer |
| `/dashboard/services`                | Services CRUD                                                        |
| `/dashboard/business-hours`          | Weekly hours editor                                                  |
| `/dashboard/blocked-dates`           | Block/unblock dates                                                  |
| `/dashboard/analytics`               | Revenue & booking analytics                                          |
| `/dashboard/settings`                | Shop info, capacity, visibility, payments                            |

## Project structure

```
src/
  app/
    (auth)/            login, signup
    (onboarding)/      onboarding/shop, booking-config, business-hours
    (dashboard)/       dashboard + 7 modules
    book/[shopSlug]/   customer booking flow
    payment/callback/  Paystack return + status polling
    page.tsx           landing
  components/
    ui/                design-system primitives (button, input, sheet, …)
    booking/           customer-flow components (steps, stepper, summary)
    dashboard/         sidebar, topbar, drawers, charts, cards
    shop/              shared business-hours editor
    brand/             logo
  hooks/               React Query hooks per domain
  lib/
    api/               typed API clients (one per backend module) + http client
    query/             query keys
    validation.ts      Zod schemas
    dates.ts utils.ts config.ts
  stores/              Zustand stores (auth, booking, shop)
  types/               shared domain types
```

## Performance & PWA

Speed optimizations applied:

- `optimizePackageImports` tree-shakes `lucide-react` + `date-fns`; `compress`,
  `poweredByHeader: false`, and production source maps off.
- The analytics SVG chart is **lazy-loaded** (`next/dynamic`, no SSR) so it's off
  the dashboard's critical path.
- React Query `staleTime` tuned for rarely-changing public data (shop 5 min,
  services 60 s, availability 15 s) to cut refetches; the backend also sends
  `Cache-Control` on public reads.
- Avatars use a lightweight lazy `<img>` (the API exposes no image URLs yet — see
  the images epic; `next/image` returns when real images land).
- App is well code-split per route (shared JS ~106 kB; `/book` ~223 kB incl.
  Framer Motion, which is the largest remaining chunk and a lazy-load candidate).

**PWA & icons:** installable with a web manifest (`app/manifest.ts`) and a full
icon set generated from the brand mark — `app/icon.svg` (modern SVG favicon),
`app/favicon.ico` (multi-res 16/32/48 for legacy browsers & crawlers),
`app/apple-icon.png` (iOS), and `public/icon-192/512` + maskable for install.
A production-only service worker (`public/sw.js`) does app-shell caching with an
`/offline` fallback (not registered in dev or under e2e). Regenerate all icons
with `pnpm generate-icons`.

> Note: Lighthouse/Core-Web-Vitals were not run in this environment; the above are
> best-practice optimizations + bundle analysis. Run `lighthouse` against a
> production build before launch.

## Testing

A full test pyramid, all backend calls mocked with **MSW** (one set of handlers

- fixtures shared across every layer — `src/test/`).

| Layer      | Tool                           | What it covers                                                                                                               |
| ---------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Unit       | Vitest                         | money/date/duration formatting, Zod schemas, booking-store reducer logic, and the API client's 401-refresh + dedup behaviour |
| Component  | Vitest + React Testing Library | service-step (loading/empty/error/select), details-step validation & store sync, stepper navigation, status badges           |
| End-to-end | Playwright (Chromium + mobile) | the full customer journey (shop → service → date → time → details → pay → success) and owner login/validation                |

```bash
pnpm test          # unit + component (Vitest, jsdom)
pnpm test:watch    # watch mode
pnpm test:e2e      # Playwright — boots `next dev` with MSW in the browser
pnpm test:e2e:ui   # Playwright UI mode
```

- **Unit/component**: MSW runs as a Node server (`src/test/server.ts`), wired
  into Vitest's lifecycle in `src/test/setup.ts`.
- **E2E**: the same handlers run as an MSW **browser worker**, started only when
  `NEXT_PUBLIC_API_MOCKING=enabled` (set by `playwright.config.ts`). It's loaded
  via a dynamic import in `MockProvider`, so msw stays out of the production
  bundle. The payments mock echoes the app's Paystack callback URL back, so the
  checkout redirect lands on the real in-app success page — no real Paystack or
  backend needed.
- Current status: **57 unit/component tests + 6 e2e specs, all green** against
  the real backend contract.

> First e2e run downloads the Chromium build: `npx playwright install chromium`.

## Production notes

- `pnpm build` produces an optimized build; `pnpm typecheck` is clean under
  `strict`.
- Code-split routes, lazy data, skeleton loading, optimistic updates on service
  mutations, and `next/image` remote patterns are configured.
- Deploy on Vercel (or any Node host) with the env vars above.
