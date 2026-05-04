# ADR-0002: Frontend stack — Vite + React 18 + TypeScript + Tailwind

**Status:** Accepted
**Date:** 2026-05-02
**Deciders:** Tech Lead, Frontend Lead

## Context

Necesitamos un stack de frontend para una SPA prototipo (sin SEO crítico) que muestre 4 experiencias visuales con datos mock al inicio y se conecte a una API real más tarde. El sistema de diseño _Diplomatic Gallery_ ya existe (ver `docs/design-system/DESIGN.md`) y exige Tailwind. El equipo es fuerte en React.

## Decision

- **Bundler/dev server:** Vite 5
- **UI:** React 18
- **Lenguaje:** TypeScript 5 (modo `strict`)
- **Estilos:** Tailwind 3 + CSS variables para tokens
- **Routing:** React Router v6
- **Data fetching:** TanStack Query v5 (cuando llegue la API)
- **Estado UI puntual:** Zustand (cuando lo necesitemos; React Context primero)
- **Forms:** React Hook Form + Zod
- **Iconos:** Material Symbols (lo pide DESIGN.md FR-019)

## Options Considered

### Option A — Vite + React + TS _(Decisión)_

**Pros:** Dev server <500ms; HMR instantáneo; builds rápidos; comunidad enorme; cero magia. Perfecto para SPA.
**Cons:** No SSR/SSG out-of-the-box (no lo necesitamos para prototipo).

### Option B — Next.js 14

**Pros:** SSR/SSG, file-system routing, ISR, opinionated, fuerte en SEO.
**Cons:** Overkill para una SPA prototipo; más capas (App Router, RSC) que no aprovechamos; lock-in mayor; deploy más opinionated (Vercel-first).

### Option C — Create React App

**Cons:** Deprecada por React team. No.

## Trade-off Analysis

Para un prototipo SPA con mock data → API REST clásica, Vite es la opción más rápida y menos opinada. Si en el futuro necesitamos SSR para SEO de páginas públicas (ej. página de un estadio para que indexe Google), evaluamos migrar a Next.js o Astro entonces — la migración desde Vite es manejable porque los componentes React son los mismos.

## Consequences

**Más fácil:**

- Dev experience rapidísima.
- Onboarding mínimo.
- Deploy a cualquier static host (Vercel, Netlify, Cloudflare Pages, S3+CloudFront).

**Más difícil:**

- SEO si necesitáramos páginas indexables (mitigable con prerendering selectivo o migración a Next.js).
- Routing manual (vs Next.js auto).

**Revisitar:**

- Si una vista necesita SEO, evaluar migrar esa ruta a SSG/SSR (Astro, Next.js).
- Si el bundle inicial supera 200kB gzip, considerar code-splitting más agresivo o framework con RSC.

## Action Items

1. [x] Crear `apps/web` con `npm create vite@latest -- --template react-ts`.
2. [x] Configurar Tailwind 3 con design tokens en `tailwind.config.ts`.
3. [x] Configurar alias `@/` en `tsconfig.json` y `vite.config.ts`.
4. [ ] Configurar Storybook para componentes del design system (en Fase 1).
5. [ ] Configurar Playwright para e2e (en Fase 4).
