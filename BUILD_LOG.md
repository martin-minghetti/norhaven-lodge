# Cabin Demo · Build Log

> Tracking honesto de cuánto tardamos en construir el sitio entero, de cero a producción.

## La métrica

**T-0** (inicio): 2026-05-04 17:04:34 ART
- Primer artefacto del proyecto generado (curación de fotos en Unsplash via agent-browser).
- Marca el momento en que paramos de hablar y empezamos a producir.

**T-final** (proyecto cerrado): 2026-05-05 14:35 ART
- Sitio live en https://norhaven-lodge.vercel.app, end-to-end funcionando, tests Vitest + Playwright passing, narrativa marketing publicada, security hardening completo.

**Total wall-clock activo**: ~3h 13 min (S1 + S2 + S3 + security pass)

## Reglas

- Tiempo **wall-clock activo**. Pausas largas (>15 min sin tocar el proyecto) no cuentan.
- Múltiples sesiones se suman.
- Source of truth: este archivo + git log (timestamps inmutables) + Vercel deployments.

## Hitos (storytelling, no métrica principal)

| Timestamp | Hito | Tiempo desde T-0 |
|-----------|------|------------------|
| 17:04:34 | T-0 · arranque (photo curation R1) | 0:00 |
| 17:09:19 | Round 2 fotos (filter landscape) | +4:45 |
| 17:24:00 | Round 3 fotos (bosque/text/lifestyle) | +19:26 |
| 17:25:32 | Set fotos cerrado (44 aprobadas) | +20:58 |
| 17:34:00 | Spec del demo aprobado por Martín | +29:26 |
| 17:36:58 | `create-next-app` scaffold + initial commit (`d9a4a8f`) | +32:24 |
| 17:37:16 | BUILD_LOG en repo (`398f7df`) | +32:42 |
| 17:38:00 | Repo público live: https://github.com/martin-minghetti/norhaven-lodge | +33:26 |
| 17:41:30 | Deps instaladas: Drizzle, MP SDK, Resend, AI SDK, Supabase, Vitest, Playwright | +36:56 |
| 17:41:30 | shadcn/ui init + 13 componentes base agregados | +36:56 |
| 17:55:00 | Supabase project creado via CLI (sa-east-1) | +50:26 |
| 17:58:00 | Schema pushed + seed ok (3 cabañas + 15 reviews) | +53:26 |
| 18:08:00 | 35 fotos bajadas a /public/images (33 MB) | +63:26 |
| 18:25:00 | Home page completa (hero, listing, ubicación, experiencia, testimonios, CTA) | +80:26 |
| 18:35:00 | Cabin detail page completa (galería, descripción, amenities, sticky booking card, reviews) | +90:26 |
| **18:12:03** | **⏸ Session 1 pausada** | **+67:29** |
| **2026-05-04 22:25** | **▶ Session 2 reanudada** · env vars MP + Resend cargados | **+67:29 activo** |
| 2026-05-04 22:31 | Bloque A done · booking flow + MP sandbox + webhook + email Resend + páginas resultado · build limpio | **+73:29 activo** |
| 2026-05-04 22:50 | Deploy prod #1 a Vercel · https://norhaven-lodge.vercel.app · env vars production cargadas | +92 activo |
| 2026-05-04 22:55 | Hallazgo: MP sandbox checkout rechaza ("Hubo un error accediendo a esta página") tanto desde init_point como sandbox_init_point. Causa probable: panel MP requiere "Configurar ambiente de desarrollo" (1 tarea pendiente). Pivote a `PAYMENT_MODE=simulated` para demo público | +97 activo |
| 2026-05-04 23:02 | Bloque A end-to-end LIVE · simulated-checkout funcionando · booking → paid → email Resend confirmado en DB | **+104 activo** |
| 2026-05-04 23:21 | Bloque B done · AI semantic search en hero con Gemini 2.5 Flash via Google AI free tier · generateObject con schema Zod · valida matches + noMatchMessage | **+123 activo** |
| 2026-05-04 23:30 | Fix layout: results panel via React portal fuera del hero + grid adaptativo según matches (1 = centered, 2 = 2-col, 3 = 3-col) | +132 activo |
| **2026-05-04 23:36** | **⏸ Session 2 pausada** · todo deployado en prod · falta solo tests + cierre marketing | **+138 activo** |
| **2026-05-05 13:25** | **▶ Session 3 reanudada** · plan: refactor → tests Vitest → Playwright E2E → T-final + marketing | **+138 activo** |
| 2026-05-05 13:30 | Refactor: extracción de `rangesOverlap` (función pura) + `bookings-schema.ts` (separado de server-only) | +143 activo |
| 2026-05-05 13:35 | Vitest configurado · 27 tests passing (formatPriceARS, bookingInputSchema, rangesOverlap) | +148 activo |
| 2026-05-05 13:37 | Playwright configurado · E2E happy path passing: home → cabin → form (calendar real) → simulated checkout → confirm + cleanup DB | +150 activo |
| **2026-05-05 13:55** | **🏁 T-FINAL inicial · proyecto cerrado** · tests + narrativa marketing publicada | **+153 activo · 2h 33 min total** |
| 2026-05-05 14:00 | Security audit · 6 findings (3 HIGH + 2 MEDIUM + 1 LOW) | +158 activo |
| 2026-05-05 14:35 | Hardening completo: RLS Supabase + IDOR token simulated-checkout + rate limit AI search + security headers + webhook ts freshness + .env.example. Deploy prod. 45 unit + 1 E2E passing | +193 activo |
| **2026-05-05 14:35** | **🔒 Security hardening done · proyecto cerrado v2** | **+193 activo · 3h 13 min total** |

## Resumen Session 3

- Total wall-clock activo: **~30 min** (13:25 → 13:55)
- Tests: 27 unit (Vitest) + 1 E2E (Playwright) — todos passing
- Commits agregados: 2 (tests + T-final)
- Hallazgos:
  - Extraer `bookings-schema.ts` fuera de `server-only` permite testear el schema con Vitest sin mocks
  - Playwright clicks reales sobre shadcn Calendar (react-day-picker v9) **sí** disparan `onSelect` correctamente — la limitación que vimos en S2 era específica de agent-browser, no de Playwright
  - Resend rechaza con 403 emails a dominios no verificados (`norhaven.test`) — el `.catch()` en la action absorbe sin romper el flow

## Resumen Session 2

- Total wall-clock activo: **~71 min** (22:25 → pausa 23:36)
- Acumulado proyecto (S1 + S2): **~2h 18 min** desde T-0
- Commits agregados: 5 (booking flow, simulated payment, AI search + 2 fixes)
- Endpoints en prod:
  - https://norhaven-lodge.vercel.app/ (home con AI search)
  - https://norhaven-lodge.vercel.app/cabanas/casa-lago (detail)
  - https://norhaven-lodge.vercel.app/cabanas/casa-lago/reservar (form)
  - https://norhaven-lodge.vercel.app/api/webhooks/mp (live, validation HMAC)
- Featured: AI semantic search funcionando con Gemini Flash free tier; booking → simulated checkout → email Resend confirmado end-to-end

## Pendiente Session 3 — CERRADO

- [x] Tests Vitest (utils, schema validation, formatPrice, overlap logic)
- [x] Tests Playwright E2E (browse → reservar → confirm via simulated)
- [x] T-final formal: BUILD_LOG cerrado + narrativa marketing publicada

## Resumen Session 1

- Total wall-clock activo: **~1h 07 min** (T-0 17:04 → pausa 18:12, descontando idle)
- Commits: 6 en main
- Pages live (dev): `/` + `/cabanas/[slug]`
- Próximo: booking flow + MP

---

### Continúa en Session 2

Pendientes en orden:
- [ ] Booking flow + MP integration (sandbox) — `/cabanas/[slug]/reservar` + server action + webhook + email Resend
- [ ] AI semantic search (Vercel AI SDK + tool calling sobre catálogo)
- [ ] Tests Vitest + Playwright
- [ ] Deploy Vercel — **T-final del proyecto**

Bloqueos resueltos: ninguno.

Para retomar:
```bash
cd ~/Projects/norhaven-lodge
npm run dev
# abrir http://localhost:3001 (o 3000 si está libre)
```
| pendiente | Pages base (home + cabin detail) | — |
| pendiente | Booking flow + MP integration | — |
| pendiente | AI feature live | — |
| pendiente | Tests pasando | — |
| pendiente | Deploy Vercel | — |
| pendiente | **T-final · sitio live** | — |

## Stack

Next.js 16 + TS + Tailwind v4 + shadcn/ui + Supabase + Drizzle + MP + Resend + Vercel AI SDK + Vitest + Playwright + Vercel.

## Para marketing posterior

Tres pruebas de tiempo real:
1. Este archivo (narrativa con timestamps).
2. `git log` del repo (commits con timestamps UTC inmutables).
3. Vercel deployments dashboard (timestamps de cada deploy).

Cualquiera puede verificar las 3.

