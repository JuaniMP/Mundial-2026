# ADR-0001: Estructura monorepo con npm workspaces

**Status:** Accepted
**Date:** 2026-05-02
**Deciders:** Tech Lead

## Context

El proyecto tendrá al menos dos aplicaciones (`web` SPA y `api` Spring Boot) que comparten contratos (tipos de matches, predicciones, etc.) y posiblemente una librería de design tokens. Tenemos tres opciones organizativas:

1. Polirepo (un repo por app).
2. Monorepo simple con npm workspaces.
3. Monorepo con herramienta dedicada (Nx, Turborepo, pnpm + Changesets).

Equipo pequeño (~3 personas), pipelines de CI todavía simples, no tenemos muchas apps todavía.

## Decision

**Monorepo con npm workspaces.** Un solo repo `Mundial-2026/` con `apps/` y `packages/`. Sin Nx ni Turbo por ahora — npm workspaces es suficiente para 2-3 paquetes.

## Options Considered

### Option A — Polirepo

**Pros:** Independencia total; cada repo con su CI; PRs pequeños y enfocados.
**Cons:** Cambios cross-cutting (modificar contrato API + consumirlo en web) requieren PRs coordinados en repos distintos; release de tipos compartidos = publicar paquete npm interno.

### Option B — Monorepo con npm workspaces _(Decisión)_

**Pros:** Cambios atómicos (un PR toca web + api + tipos); npm workspaces es nativo, sin tooling extra; `node_modules` único hoisted; sencillo de entender.
**Cons:** CI corre todo aunque cambies una cosa (mitigable con paths filters); el repo crece pero no es problema en este tamaño.

### Option C — Monorepo + Nx/Turborepo

**Pros:** Build cache, task graph, generación de scaffolding, mejor para 10+ apps.
**Cons:** Curva de aprendizaje, complejidad innecesaria para 2 apps; añade lock-in tooling.

## Trade-off Analysis

A 2 apps, Nx/Turbo es overkill. Polirepo introduce coordinación que no necesitamos. Workspaces nativos nos dan lo bueno (cambio atómico, hoisting) sin pagar complejidad.

Cuando llegamos a 5+ apps o las builds del CI tarden >10 minutos sin cache, evaluar Turborepo.

## Consequences

**Más fácil:**

- Refactors cross-cutting en un PR.
- Tipos compartidos sin publicar a npm.
- Onboarding: `git clone && npm install` y listo.

**Más difícil:**

- CI menos selectivo (corre todo). Mitigable con `paths:` filters en workflow.
- Hay que disciplinarse para no acoplar apps a packages internos sin contratos claros.

**Revisitar:**

- Si llegamos a >5 apps, evaluar Turborepo.
- Si CI > 10 min sin caché, evaluar caching distribuido.

## Action Items

1. [x] Configurar `package.json` raíz con `workspaces: ["apps/*", "packages/*"]`.
2. [x] Documentar comandos en `README.md`.
3. [ ] Configurar `paths:` filter en GitHub Actions para no correr CI de api cuando solo cambia web.
