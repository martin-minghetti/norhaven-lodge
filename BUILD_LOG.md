# Cabin Demo · Build Log

> Tracking honesto de cuánto tardamos en construir el sitio entero, de cero a producción.

## La métrica

**T-0** (inicio): 2026-05-04 17:04:34 ART
- Primer artefacto del proyecto generado (curación de fotos en Unsplash via agent-browser).
- Marca el momento en que paramos de hablar y empezamos a producir.

**T-final** (sitio live): pendiente
- Se cierra cuando el sitio esté deployado en Vercel con dominio público y funcionando end-to-end (browse → reserva → checkout MP sandbox → email confirmación).

**Total**: pendiente (se calcula al cerrar)

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
| pendiente | Spec definido | — |
| pendiente | git init + primer commit | — |
| pendiente | Schema Drizzle + Supabase setup | — |
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

