# Bookly — Frontend

A production-ready, mobile-first booking frontend for barbershops, built to the
**Bookly Frontend Master Spec v5** and wired to the `barber-booking-backend` Go
API (`router.go`).

It delivers the complete product: the **customer booking flow** (the headline
experience), owner **authentication**, **mandatory onboarding**, and a full
**dashboard** with all seven modules.

---

## Tech stack

| Concern        | Choice                                  |
| -------------- | --------------------------------------- |
| Framework      | Next.js 15 (App Router, RSC)            |
| Language       | TypeScript (strict)                     |
| Styling        | Tailwind CSS v3 + design tokens         |
| UI primitives  | Hand-built shadcn-style + Radix UI      |
| Data fetching  | TanStack React Query v5 (typed clients) |
| Client state   | Zustand (persisted)                     |
| Forms          | React Hook Form + Zod                   |
| Animation      | Framer Motion                           |
| Font           | Geist Sans                              |
| Icons          | lucide-react                            |
| Toasts         | sonner                                  |

## Getting started

```bash
pnpm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_BASE_URL to your backend
pnpm dev                     # http://localhost:3000
```

Scripts: `pnpm dev` · `pnpm build` · `pnpm start` · `pnpm typecheck` · `pnpm lint`
· `pnpm test` · `pnpm test:e2e`

### Environment

| Variable                   | Description                                            |
| -------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the Go backend (default `localhost:8080`) |
| `NEXT_PUBLIC_APP_URL`      | Public URL of this app (Paystack callback URLs)       |
| `API_PROXY_TARGET`         | Optional dev proxy target to avoid CORS               |

## Key routes

| Route                         | Purpose                                        |
| ----------------------------- | ---------------------------------------------- |
| `/`                           | Marketing landing page                         |
| `/book/[shopSlug]`            | **Customer booking flow** (the core journey)   |
| `/book/[shopSlug]/success`    | Payment result + polling confirmation          |
| `/login` `/signup`            | Owner authentication                           |
| `/verify-email`               | Email verification (post-signup & token link)  |
| `/forgot-password` `/reset-password` | Password recovery                       |
| `/onboarding/*`               | 3-step shop setup (shop → rules → hours)        |
| `/dashboard`                  | Overview                                        |
| `/dashboard/bookings`         | Bookings (Upcoming/Completed/Cancelled/No-show) + drawer |
| `/dashboard/services`         | Services CRUD                                   |
| `/dashboard/business-hours`   | Weekly hours editor                             |
| `/dashboard/blocked-dates`    | Block/unblock dates                             |
| `/dashboard/analytics`        | Revenue & booking analytics                     |
| `/dashboard/settings`         | Shop, rules, Paystack, notifications, plan      |

## The customer booking flow

The headline experience, at `/book/[shopSlug]`. No account, no login, no barber
selection — exactly as the spec requires:

```
Shop link → Service → Date → Time → Details → Payment → Success
```

- **Capacity-based slots** come from `GET /shops/:id/availability`.
- **Payment-first**: a booking is initiated (`POST /bookings/initiate`), then a
  Paystack checkout is started (`POST /payments/init`) and the customer is
  redirected. The success page polls `GET /bookings/:code` until the webhook
  confirms payment.
- Progress is **persisted** (Zustand + localStorage), so a customer returning
  from Paystack keeps their place.
- Fully responsive: sticky bottom CTA on mobile, summary sidebar on desktop,
  animated step transitions, skeletons and graceful empty/error states.

## Project structure

```
src/
  app/
    (auth)/            login, signup, verify-email, forgot/reset
    (onboarding)/      onboarding/shop, booking-config, business-hours
    (dashboard)/       dashboard + 7 modules
    book/[shopSlug]/   customer booking flow + success
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

## Design system

Brand tokens from the spec, as CSS variables in `src/app/globals.css`:

- Primary `#E05A29` · Background `#F2ECEC` · Ink `#132436` · Accent `#9C90FC`
- Soft rounded corners, elevated cards, premium SaaS feel, Geist Sans throughout.

## Auth & token handling

- Tokens live in `localStorage` via a framework-agnostic `tokenStore`.
- The HTTP client auto-attaches the bearer token and transparently refreshes on
  `401` via `POST /auth/refresh` (deduped), retrying the original request once.
- Owner routes (`/onboarding`, `/dashboard`) are guarded client-side by
  `RequireAuth` (tokens aren't readable by middleware).

## API assumptions

Backend handler payloads weren't available at build time, so request/response
**shapes were inferred** from `router.go`, the spec and conventional Go/JSON
design. They are centralised so you can adjust them in one place:

- **Types**: `src/types/index.ts`
- **Endpoints**: `src/lib/api/*.ts`

Notable assumptions:

- `GET /shops/:id` resolves **either an id or a slug** (the customer flow uses a slug).
- Money is stored in **kobo** (`amountKobo`, `priceKobo`); the UI captures Naira
  and converts.
- `POST /bookings/initiate` returns `{ booking, payment? }`; if `payment` is
  absent the app calls `POST /payments/init` with the booking code.
- Endpoints used but **not yet present** in `router.go` (clearly marked in code):
  `/auth/me`, `/auth/verify-email`, `/auth/resend-verification`,
  `/auth/forgot-password`, `/auth/reset-password`, `GET /bookings`,
  `GET /bookings/:code`, `PATCH /bookings/:id`, `GET /shops/:id/analytics`.
  Each lives behind a typed client function — wire or rename in one spot.
- The owner's active shop id is remembered locally (`shop-store`) since the API
  exposes no "list my shops" endpoint. Swap for `/shops/me` if it lands.

## Testing

A full test pyramid, all backend calls mocked with **MSW** (one set of handlers
+ fixtures shared across every layer — `src/test/`).

| Layer            | Tool                          | What it covers                                                                 |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| Unit             | Vitest                        | money/date/duration formatting, Zod schemas, booking-store reducer logic, and the API client's 401-refresh + dedup behaviour |
| Component        | Vitest + React Testing Library| service-step (loading/empty/error/select), details-step validation & store sync, stepper navigation, status badges |
| End-to-end       | Playwright (Chromium + mobile)| the full customer journey (shop → service → date → time → details → pay → success) and owner login/validation |

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
- Current status: **47 unit/component tests + 5 e2e specs, all green.**

> First e2e run downloads the Chromium build: `npx playwright install chromium`.

## Production notes

- `pnpm build` produces an optimized build; `pnpm typecheck` is clean under
  `strict`.
- Code-split routes, lazy data, skeleton loading, optimistic updates on service
  mutations, and `next/image` remote patterns are configured.
- Deploy on Vercel (or any Node host) with the env vars above.
