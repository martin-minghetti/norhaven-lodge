# Norhaven Lodge

Booking site demo · boutique lakeside cabins · **public build with stopwatch**.

🌐 **Live**: https://norhaven-lodge.vercel.app
📊 **Build log**: [`BUILD_LOG.md`](BUILD_LOG.md) — timestamped narrative of every milestone

> Portfolio project. The lodge and cabins are fictional. Photos from Unsplash under the Unsplash License — see [`public/images/CREDITS.md`](public/images/CREDITS.md).

## Why this repo

Demonstrates a full-stack booking app integration end to end: relational schema, Server Actions with date-overlap validation, Checkout Pro with signed webhook, transactional email with React templates, and LLM-powered semantic search. **Build time is tracked from first commit (T-0)** — see [`BUILD_LOG.md`](BUILD_LOG.md).

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, Turbopack)
- **TypeScript** strict
- **Tailwind v4** + **shadcn/ui** + Fraunces serif
- **Drizzle ORM** + **Supabase Postgres** (sa-east-1)
- **MercadoPago Checkout Pro** (sandbox · sandbox_init_point + HMAC webhook)
- **Resend** + **react-email** (JSX templates)
- **Vercel AI SDK** + **Google Gemini 2.5 Flash** (semantic search, free tier)
- Deploy: **Vercel** (stable alias + auto deploys)

## Live features

| Feature | Path | Notes |
|---------|------|-------|
| Home with AI search | `/` | Natural-language input → Gemini ranks cabins with generated reasoning |
| Catalog | `/#cabanas` | 3 cabins, fetched from Supabase |
| Cabin detail | `/cabanas/[slug]` | Gallery, amenities, sticky booking card, reviews |
| Booking flow | `/cabanas/[slug]/reservar` | shadcn date-range calendar, server-side overlap validation |
| Simulated checkout | `/bookings/[id]/simulated-checkout` | Public demo without a card — see "Payment modes" below |
| Confirm/Failed | `/bookings/[id]/{confirm,failed}` | Status-aware UI |
| MP webhook | `/api/webhooks/mp` | HMAC SHA256 validation, idempotent |

## Payment modes

The backend integrates the full MercadoPago Checkout Pro flow. It is gated by the `PAYMENT_MODE` env var:

- **`simulated`** (default): the flow lands on an in-app page `/bookings/[id]/simulated-checkout` with a summary and two buttons (approve/reject). Approving marks the booking `paid` and triggers a real Resend email. This is what runs on the public deploy so anyone can test end-to-end without a card or MP account.
- **`production`**: the flow redirects to the actual MercadoPago Checkout Pro via `init_point`/`sandbox_init_point` (driven by `MP_MODE=sandbox|production`), and `/api/webhooks/mp` receives the signed notification.

```env
PAYMENT_MODE=simulated      # public demo
# PAYMENT_MODE=production   # real MP checkout
```

All MP logic (preference creation, webhook signature validation, status mapping) lives in this repo and has been manually tested. Switching is **a single env var**.

## AI semantic search

```ts
// src/lib/ai-search.ts
const { object } = await generateObject({
  model: google("gemini-2.5-flash"),
  schema: searchResultSchema,  // Zod
  system: "...",
  prompt: `Catalog:\n${JSON.stringify(catalog)}\n\nRequest: "${query}"`,
});
```

- Schema enforces structured output: `matches[].{slug, reason, matchScore}` plus optional `noMatchMessage`
- System prompt prevents amenity hallucinations and caps results at 3 matches
- Model: Gemini 2.5 Flash (free tier, 1500 req/day)
- Cost: $0 up to the rate limit

Try it in the hero: `"something for a couple, intimate, with a lake view"` → recommends Casa Lago with generated reasoning.

## Quick start

```bash
git clone https://github.com/martin-minghetti/norhaven-lodge.git
cd norhaven-lodge
npm install
cp .env.example .env.local
# Fill in DATABASE_URL + Supabase keys (see "Environment" below)
npm run db:push    # apply schema
npm run db:seed    # 3 cabins + 15 reviews
npm run dev        # http://localhost:3000
```

## Environment variables

See [`.env.example`](.env.example) for the full list. Minimum to run dev:

```env
# Supabase
DATABASE_URL=postgresql://postgres.<ref>:<pwd>@aws-1-<region>.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.<ref>:<pwd>@aws-1-<region>.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Payments (simulated by default; production optional)
PAYMENT_MODE=simulated
MP_ACCESS_TOKEN=APP_USR-...      # only if PAYMENT_MODE=production
MP_WEBHOOK_SECRET=...             # only if PAYMENT_MODE=production
MP_MODE=sandbox                   # sandbox|production

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Norhaven <onboarding@resend.dev>

# AI search (Google Gemini free tier)
GOOGLE_GENERATIVE_AI_API_KEY=AIza...
```

## Project structure

```
src/
├── app/
│   ├── page.tsx                            # Home with AI search
│   ├── layout.tsx                          # Fonts + metadata
│   ├── globals.css                         # Custom palette
│   ├── cabanas/[slug]/
│   │   ├── page.tsx                        # Cabin detail
│   │   └── reservar/
│   │       ├── page.tsx                    # Booking form (server)
│   │       ├── booking-form.tsx            # Client component (calendar + state)
│   │       └── actions.ts                  # submitBooking server action
│   ├── bookings/[id]/
│   │   ├── confirm/page.tsx                # Success page
│   │   ├── failed/page.tsx                 # Failure page
│   │   └── simulated-checkout/
│   │       ├── page.tsx                    # Demo checkout UI
│   │       └── actions.ts                  # simulatePayment server action
│   └── api/webhooks/mp/route.ts            # MP webhook (HMAC validated)
├── components/
│   ├── hero-search.tsx                     # AI search client component
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   └── ui/                                 # shadcn primitives
├── emails/
│   └── booking-confirmation.tsx            # React Email template
└── lib/
    ├── db/{schema,index,seed}.ts           # Drizzle
    ├── queries.ts                          # Server queries
    ├── bookings.ts                         # createBookingAndPreference + checkAvailability
    ├── mp.ts                               # MP client + signature validator
    ├── ai-search.ts                        # Gemini semantic search server action
    ├── email.ts                            # Resend helper
    ├── format.ts                           # Pure formatters (client-safe)
    └── utils.ts
```

## Database commands

```bash
npm run db:generate   # Generate migration from schema changes
npm run db:push       # Push schema to Supabase (dev)
npm run db:studio     # Open Drizzle Studio
npm run db:seed       # Reset + seed
```

## Notable technical decisions

- **Server Action over API route** for form submission: leverages streaming, native redirect, and zero client-side fetch boilerplate.
- **`use server` + Zod `safeParse`** instead of react-hook-form: a 5-field form does not justify the runtime overhead.
- **Manual HMAC SHA256 webhook validation** (no SDK helper): `validateMpSignature` in `lib/mp.ts` reassembles the manifest `id:DATA;request-id:REQ;ts:TS;` and compares with `crypto.timingSafeEqual`.
- **`formatPriceARS` extracted to `/lib/format.ts`** without server-only imports: prevents pulling `postgres` into the client bundle when a client component formats prices.
- **Portal for AI results**: the results panel is rendered outside the hero `<section>` (which has `overflow-hidden + h-[88vh]`) via `createPortal` into a `#ai-results-slot` placed after the hero. Without this, results would float over the next section.

## Known limitations

- A real MP Checkout sandbox requires completing the "Configurar ambiente de desarrollo" wizard in the MP developer panel before the app accepts checkouts. That is why the public demo runs on `PAYMENT_MODE=simulated`. Switching to `production` with a fully set up MP account works (the redirect to a valid `init_point` was confirmed via API).
- The MP webhook is only delivered in production (public URL). It does not reach localhost; use a cloudflared tunnel if you need to test it locally.

## Build journal

See [`BUILD_LOG.md`](BUILD_LOG.md) for the full timeline with immutable timestamps.

| Session | Date | Active time | Output |
|---------|------|-------------|--------|
| 1 | 2026-05-04 | ~1h 07 min | Schema, seed, photos, home + cabin detail pages, custom palette |
| 2 | 2026-05-04 | ~1h 11 min | Booking flow + MP integration + Resend email + AI search + deploy |
| 3 | 2026-05-05 | ~30 min | Vitest + Playwright + T-final |
| Security pass | 2026-05-05 | ~40 min | RLS, IDOR token, rate limit, security headers, webhook freshness |
| **Total to date** | — | **~3h 13 min** | Demo end-to-end live in production, hardened |

## Notes

- Dev server defaults to `:3001` if `:3000` is busy.
- Drizzle Kit needs the **session pooler** (port 5432), not the transaction pooler. Set `DIRECT_URL` accordingly.
- Pooler hostname format is `aws-1-<region>` (not `aws-0-<region>` as some older docs still show).
