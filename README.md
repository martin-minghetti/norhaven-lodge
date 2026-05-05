# Norhaven Lodge

Booking site demo · cabañas boutique frente al lago · **build pública con cronómetro**.

🌐 **Live**: https://norhaven-lodge.vercel.app
📊 **Build log**: [`BUILD_LOG.md`](BUILD_LOG.md) — narrativa cronometrada de cada hito

> Proyecto de portfolio. El lodge y las cabañas son ficticios. Fotos de Unsplash bajo Unsplash License — ver [`public/images/CREDITS.md`](public/images/CREDITS.md).

## Por qué este repo

Demuestra integración fullstack completa de una booking app real: schema relacional, Server Actions con validación de overlap de fechas, Checkout Pro con webhook firmado, email transaccional con templates React, y semantic search con LLM. **El tiempo de desarrollo está cronometrado** desde el primer commit (T-0) — ver [`BUILD_LOG.md`](BUILD_LOG.md).

## Stack

- **Next.js 16** (App Router, Server Components, Server Actions, Turbopack)
- **TypeScript** strict
- **Tailwind v4** + **shadcn/ui** + Fraunces serif
- **Drizzle ORM** + **Supabase Postgres** (sa-east-1)
- **MercadoPago Checkout Pro** (sandbox · sandbox_init_point + HMAC webhook)
- **Resend** + **react-email** (templates JSX)
- **Vercel AI SDK** + **Google Gemini 2.5 Flash** (semantic search free tier)
- Deploy: **Vercel** (alias estable + auto deploys)

## Features live

| Feature | Path | Notas |
|---------|------|-------|
| Home con AI search | `/` | Input natural → Gemini rankea cabañas con razón generada |
| Catálogo | `/#cabanas` | 3 cabañas, fetch desde Supabase |
| Cabin detail | `/cabanas/[slug]` | Galería, amenities, sticky booking card, reseñas |
| Booking flow | `/cabanas/[slug]/reservar` | Calendar shadcn (date range), validación overlap server-side |
| Checkout simulado | `/bookings/[id]/simulated-checkout` | Demo público sin tarjeta — ver "Payment modes" abajo |
| Confirm/Failed | `/bookings/[id]/{confirm,failed}` | Status-aware UI |
| MP webhook | `/api/webhooks/mp` | HMAC SHA256 validation, idempotente |

## Payment modes

El backend integra MercadoPago Checkout Pro completo. Se controla con la env var `PAYMENT_MODE`:

- **`simulated`** (default): el flow va a una página propia `/bookings/[id]/simulated-checkout` con summary + 2 botones (aprobar/rechazar). Aprobar marca booking `paid` + dispara email Resend real. Es lo que está activo en el deploy público para que cualquiera pueda testear sin tarjeta ni cuenta MP.
- **`production`**: el flow redirige a MercadoPago Checkout Pro real con `init_point`/`sandbox_init_point` (según `MP_MODE=sandbox|production`), y el webhook `/api/webhooks/mp` recibe la notificación firmada.

```env
PAYMENT_MODE=simulated      # demo público
# PAYMENT_MODE=production   # checkout MP real
```

Toda la lógica MP (preference creation, webhook signature validation, status mapping) vive en el repo y está testeada manualmente. Switching es **un solo env var**.

## AI semantic search

```ts
// src/lib/ai-search.ts
const { object } = await generateObject({
  model: google("gemini-2.5-flash"),
  schema: searchResultSchema,  // Zod
  system: "...",
  prompt: `Catálogo:\n${JSON.stringify(catalog)}\n\nPedido: "${query}"`,
});
```

- Schema fuerza output estructurado: `matches[].{slug, reason, matchScore}` + opcional `noMatchMessage`
- System prompt previene hallucination de amenities y limita a 3 matches
- Model: Gemini 2.5 Flash (free tier 1500 req/día)
- Costo: $0 hasta el rate limit

Probá en el hero: `"algo para una pareja, íntimo, con vista al lago"` → recomienda Casa Lago con razón generada.

## Quick start

```bash
git clone https://github.com/martin-minghetti/norhaven-lodge.git
cd norhaven-lodge
npm install
cp .env.example .env.local
# Completá DATABASE_URL + Supabase keys (ver "Environment" abajo)
npm run db:push    # apply schema
npm run db:seed    # 3 cabins + 15 reviews
npm run dev        # http://localhost:3000
```

## Environment variables

Ver [`.env.example`](.env.example) para la lista completa. Mínimo para correr dev:

```env
# Supabase
DATABASE_URL=postgresql://postgres.<ref>:<pwd>@aws-1-<region>.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.<ref>:<pwd>@aws-1-<region>.pooler.supabase.com:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Pagos (simulados por default; producción opcional)
PAYMENT_MODE=simulated
MP_ACCESS_TOKEN=APP_USR-...      # solo si PAYMENT_MODE=production
MP_WEBHOOK_SECRET=...            # solo si PAYMENT_MODE=production
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
│   ├── page.tsx                            # Home con AI search
│   ├── layout.tsx                          # Fonts + metadata
│   ├── globals.css                         # Custom palette
│   ├── cabanas/[slug]/
│   │   ├── page.tsx                        # Cabin detail
│   │   └── reservar/
│   │       ├── page.tsx                    # Booking form (server)
│   │       ├── booking-form.tsx            # Client component (calendar + state)
│   │       └── actions.ts                  # Server action submitBooking
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
npm run db:generate   # Crear migration desde cambios de schema
npm run db:push       # Push schema a Supabase (dev)
npm run db:studio     # Abrir Drizzle Studio
npm run db:seed       # Reset + seed
```

## Decisiones técnicas notables

- **Server Action over API route** para form submission: aprovecha streaming, redirect nativo y zero client-side fetch boilerplate.
- **`use server` + Zod safeParse** en lugar de react-hook-form: form de 5 campos no justifica el peso del runtime.
- **MP webhook con HMAC SHA256 manual** (no SDK helper): `validateMpSignature` en `lib/mp.ts` recompone el manifest `id:DATA;request-id:REQ;ts:TS;` y compara con `crypto.timingSafeEqual`.
- **`formatPriceARS` extraído a `/lib/format.ts`** sin imports server-only: evita arrastrar `postgres` al bundle del cliente cuando un client component formatea precios.
- **Portal para AI results**: el panel de resultados se renderiza fuera del `<section>` del hero (que tiene `overflow-hidden + h-[88vh]`) usando `createPortal` a un `#ai-results-slot` después del hero. Sin esto, los resultados quedaban "flotando" sobre la siguiente sección.

## Limitaciones conocidas

- MP Checkout sandbox real requiere completar el flow "Configurar ambiente de desarrollo" en el panel MP de la app antes de aceptar checkouts. Por eso el demo público usa `PAYMENT_MODE=simulated`. Switching a `production` con cuenta MP completa funciona (código probado, redirect a `init_point` válido confirmado vía API).
- Webhook MP solo se recibe en producción (URL pública). En dev local no llega; testear con cloudflared tunnel si hace falta.

## Build journal

Ver [`BUILD_LOG.md`](BUILD_LOG.md) para la cronología completa con timestamps inmutables.

| Session | Date | Active time | Output |
|---------|------|-------------|--------|
| 1 | 2026-05-04 | ~1h 07 min | Schema, seed, photos, home + cabin detail pages, custom palette |
| 2 | 2026-05-04 | ~1h 11 min | Booking flow + MP integration + Resend email + AI search + deploy |
| **Total a la fecha** | — | **~2h 18 min** | Demo end-to-end live en producción |

## Notes

- Dev server defaults to `:3001` if `:3000` is busy.
- Drizzle Kit needs **session pooler** (port 5432), not transaction pooler. Set `DIRECT_URL` accordingly.
- Pooler hostname format is `aws-1-<region>` (no `aws-0-<region>` como aún figura en algunos docs).
