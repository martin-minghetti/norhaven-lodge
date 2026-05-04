# Norhaven Lodge

Booking site demo · cabañas boutique frente al lago. Built in public, time-tracked.

> **Demo project** for portfolio. The lodge and cabins are fictional. Photos from Unsplash under Unsplash License — see [`public/images/CREDITS.md`](public/images/CREDITS.md).

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, Turbopack)
- **TypeScript** strict
- **Tailwind v4** + **shadcn/ui**
- **Drizzle ORM** + **Supabase Postgres**
- **MercadoPago SDK** (sandbox)
- **Resend** + **react-email**
- **Vercel AI SDK** (semantic search)
- **Vitest** + **Playwright**
- Deploy: **Vercel**

## Quick start

```bash
git clone https://github.com/martin-minghetti/norhaven-lodge.git
cd norhaven-lodge
npm install
cp .env.example .env.local
# Fill in DATABASE_URL + Supabase keys (or create your own project)
npm run db:push    # apply schema
npm run db:seed    # 3 cabins + 15 reviews
npm run dev        # http://localhost:3000
```

## Status (sessions log)

See [`BUILD_LOG.md`](BUILD_LOG.md) for the full time-tracked build journal. The metric is wall-clock from T-0 (first artifact) to T-final (live deploy).

| Session | Date | Time invested | What was built |
|---------|------|--------------|----------------|
| 1 | 2026-05-04 | ~1h 07 min | Schema, seed, photos, home + cabin detail pages |

## What's done

- ✅ Schema: cabins, bookings, blocked_dates, reviews
- ✅ Seed: 3 cabañas (Casa Lago, Loft del Bosque, Cabaña del Cerro) + 15 reviews
- ✅ 35 curated photos (auto-mapped to semantic paths)
- ✅ Home page (hero, listing, location, experience, testimonials, CTA)
- ✅ Cabin detail page (gallery, description, amenities, sticky booking card, reviews)
- ✅ Custom palette (cream / forest green / warm brown) + Fraunces serif headlines

## What's pending

- [ ] Booking flow (`/cabanas/[slug]/reservar`) + MercadoPago sandbox integration
- [ ] Webhook handler `/api/webhooks/mp`
- [ ] Email confirmation via Resend
- [ ] AI semantic search in hero (Vercel AI SDK + tool calling)
- [ ] Tests: Vitest unit + Playwright E2E
- [ ] Deploy to Vercel (= T-final)

## Project structure

```
src/
├── app/
│   ├── layout.tsx            # Fonts (Fraunces + Inter), root metadata
│   ├── page.tsx              # Home
│   ├── cabanas/[slug]/
│   │   └── page.tsx          # Cabin detail (TODO: + /reservar)
│   └── globals.css           # Custom palette + theme
├── components/
│   ├── site-header.tsx
│   ├── site-footer.tsx
│   └── ui/                   # shadcn primitives
└── lib/
    ├── db/
    │   ├── schema.ts         # Drizzle schema
    │   ├── index.ts          # Drizzle client
    │   └── seed.ts           # Initial data
    ├── queries.ts            # Server-side query helpers
    └── utils.ts

drizzle/
├── 0000_init.sql             # First migration
└── meta/

public/images/                # 35 curated photos + CREDITS.md
```

## Environment variables

See [`.env.example`](.env.example) for the full list. Minimum to run dev:

```env
DATABASE_URL=postgresql://postgres.<ref>:<pwd>@aws-1-<region>.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.<ref>:<pwd>@aws-1-<region>.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

For payments and AI, additionally:

```env
MP_ACCESS_TOKEN=TEST-...      # MercadoPago sandbox
RESEND_API_KEY=re_...
OPENAI_API_KEY=sk-...         # or use Vercel AI Gateway
```

## Database commands

```bash
npm run db:generate   # Create migration from schema changes
npm run db:push       # Push schema to Supabase (dev)
npm run db:studio     # Open Drizzle Studio
npm run db:seed       # Reset + seed data
```

## Notes

- Dev server defaults to `:3001` if `:3000` is busy.
- Drizzle Kit needs **session pooler** (port 5432), not transaction pooler. Set `DIRECT_URL` accordingly.
- Pooler hostname format is `aws-1-<region>` (not `aws-0-<region>` as some docs still say).
