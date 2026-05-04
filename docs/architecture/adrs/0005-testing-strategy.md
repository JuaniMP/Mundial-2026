# ADR-0005: Estrategia de testing

**Status:** Accepted
**Date:** 2026-05-02
**Deciders:** Tech Lead

## Context

Queremos confianza en cambios sin frenarnos. Equipo pequeño → no podemos pagar el costo de tests frágiles ni un test pyramid mal balanceado.

## Decision

Aplicamos la **pirámide de tests**:

```
        /\
       /e2e\        Pocos. Critical paths. Playwright.
      /------\
     / integ. \    Medianos. API + DB real (Testcontainers). Web ↔ API mocked.
    /----------\
   /   unit     \  Muchos. Vitest (web) + JUnit (api).
  /--------------\
```

### Frontend (`apps/web`)

| Tipo        | Herramientas                   | Cobertura objetivo                             | Dónde                         |
| ----------- | ------------------------------ | ---------------------------------------------- | ----------------------------- |
| Unit        | Vitest + React Testing Library | 70% líneas en `components/` y `hooks/`         | `*.test.tsx` junto al archivo |
| Integration | Vitest + MSW (mock API)        | smoke por ruta                                 | `src/routes/**/__tests__/`    |
| e2e         | Playwright                     | critical paths (login, predicción, abrir pack) | `apps/web/e2e/`               |
| Visual      | (futuro) Chromatic / Percy     | componentes del design system                  | Storybook                     |

### Backend (`apps/api`)

| Tipo        | Herramientas                                                            | Cobertura objetivo                   | Dónde                   |
| ----------- | ----------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| Unit        | JUnit 5 + Mockito                                                       | 80% líneas en `service/` y `domain/` | `src/test/java/`        |
| Integration | `@SpringBootTest` + Testcontainers (MySQL real)                         | endpoints + repos críticos           | `src/test/java/.../it/` |
| Contract    | Spring Cloud Contract o JSON Schema diff contra `packages/shared-types` | endpoints expuestos                  | CI check                |

## Reglas

1. **No mockear lo que no es tuyo.** Si testeas tu code contra `axios`, no mockes `axios` — usa MSW.
2. **Un test = una afirmación clara** del comportamiento, no de la implementación.
3. **Test names en imperativo descriptivo**: `should_returnEmptyList_when_userHasNoPredictions`.
4. **Snapshot tests con cuidado** — solo para cosas que NO deberían cambiar (ej: serialización pública).
5. **Tests flaky se desactivan o se arreglan en la PR siguiente.** No "voy a ignorarlo".

## Consequences

**Más fácil:**

- Refactors confiables.
- Detección temprana de regresiones.

**Más difícil:**

- Mantener Testcontainers requiere Docker en local y CI.
- e2e tests son lentos — corren en CI nightly + en PR de cambios visuales.

## Action Items

1. [ ] `apps/web/vitest.config.ts` con coverage threshold.
2. [ ] `apps/web/playwright.config.ts` con webServer integrado.
3. [ ] `apps/api/pom.xml` con JUnit 5, Mockito, Testcontainers.
4. [ ] CI: jobs separados `web-unit`, `web-e2e`, `api-unit`, `api-it`.
