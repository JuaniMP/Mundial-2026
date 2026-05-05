# Contributing — Mundial 2026

¡Gracias por sumarte! Este documento describe el flujo de trabajo, convenciones y quality gates del repo.

## Tabla de contenidos

- [Cómo está organizado el repo](#cómo-está-organizado-el-repo)
- [Setup local](#setup-local)
- [Branching](#branching)
- [Commits — Conventional Commits](#commits--conventional-commits)
- [Pull Requests](#pull-requests)
- [Quality gates](#quality-gates)
- [Convenciones de código](#convenciones-de-código)
- [Tests](#tests)
- [Documentación](#documentación)
- [ADRs — cuándo crear uno](#adrs--cuándo-crear-uno)

---

## Cómo está organizado el repo

Es un monorepo con npm workspaces:

- `apps/web` — frontend Vite + React + TS
- `apps/api` — backend Spring Boot (placeholder)
- `packages/shared-types` — tipos compartidos
- `docs/` — toda la documentación viva

Lee el [README](README.md) raíz para el mapa completo.

---

## Setup local

```bash
nvm use              # Node 20
npm install          # instala todo el workspace
npm run dev          # arranca apps/web
```

---

## Branching

Trabajamos con **trunk-based development** sobre `main`. Branches efímeras, vida corta (≤ 3 días idealmente):

| Tipo     | Prefijo     | Ejemplo                               |
| -------- | ----------- | ------------------------------------- |
| Feature  | `feat/`     | `feat/web-stadium-heatmap`            |
| Fix      | `fix/`      | `fix/web-album-progress-rounding`     |
| Chore    | `chore/`    | `chore/upgrade-vite-5`                |
| Docs     | `docs/`     | `docs/adr-frontend-stack`             |
| Refactor | `refactor/` | `refactor/web-extract-card-primitive` |

**Reglas:**

- Una branch = un PR = un propósito.
- Reb base contra `main` antes de mergear (squash merge).
- Nada de `develop`, `staging` etc. — un solo trunk.

---

## Commits — Conventional Commits

Formato:

```
<tipo>(<scope>): <descripción imperativa, ≤72 caracteres>

[cuerpo opcional]

[footer opcional]
```

**Tipos válidos:**

`feat` · `fix` · `chore` · `docs` · `refactor` · `test` · `perf` · `style` · `build` · `ci` · `revert`

**Scopes válidos:**

`web` · `api` · `shared` · `docs` · `repo` · `ci` · `deps`

### Ejemplos

```
feat(web): add stadium heatmap component
fix(web): correct album progress rounding for Mexico
docs(adr): add ADR-0006 caching strategy
chore(deps): bump vite to 5.4.10
refactor(api): extract MatchService from controller
```

---

## Pull Requests

Todos los cambios pasan por PR. Plantilla en [`.github/pull_request_template.md`](.github/pull_request_template.md).

**Checklist mínimo de un PR:**

- [ ] Branch nombrada según convención.
- [ ] Commits siguen Conventional Commits.
- [ ] `npm run lint && npm run typecheck && npm run test` pasa local.
- [ ] Cambios visuales: screenshot adjunto.
- [ ] Cambios de API: tipos compartidos actualizados en `packages/shared-types`.
- [ ] Doc actualizada si aplica (`docs/`, `README.md`, ADR si arquitectónico).
- [ ] Issue/ticket linkeado (`Closes #123`).

**Reglas:**

- Mínimo 1 reviewer aprobador.
- CI verde antes de merge.
- Squash merge (mantenemos historial limpio en `main`).

---

## Quality gates

Antes de pedir review:

```bash
npm run lint            # ESLint
npm run typecheck       # tsc --noEmit en todos los workspaces
npm run test            # vitest unit tests
npm run format -- --check
```

CI corre lo mismo + tests e2e (Playwright) en `apps/web`.

---

## Convenciones de código

### TypeScript / React

- **Imports absolutos** desde `src/` con alias `@/` (ya configurado en `tsconfig.json`).
- **Componentes**: PascalCase, un componente por archivo, `<NombreComponente>.tsx`.
- **Hooks**: camelCase, prefijo `use`, en `src/hooks/`.
- **Types**: PascalCase, en `src/types/` o cerca del módulo si son privados.
- **Sin `any`** (regla `@typescript-eslint/no-explicit-any` en error). Usa `unknown` y narrowing.
- **No default export** en componentes de UI (excepto routes y `App.tsx`) — facilita refactors y autocompletado.
- **Tailwind primero**, custom CSS solo si es necesario y va en `src/styles/`.

### Estilos

- Sigue [DESIGN.md](docs/design-system/DESIGN.md) — _no inventes colores ni font-sizes_.
- Tokens en CSS variables; nunca hardcodees `#004e34` — usa `var(--color-primary)` o `bg-primary` (Tailwind).
- **No 1px solid borders** (regla del design system). Diferenciación por tonos de surface o whitespace.

### Java / Spring (cuando aplique)

- Java 21, Lombok permitido para POJOs / DTOs.
- Capas: `controller → service → repository` (sin lógica en controllers).
- DTOs nunca exponen entidades JPA directamente.
- Tests con JUnit 5 + Mockito + Testcontainers para integración.

---

## Tests

### Frontend

- **Unit**: Vitest + Testing Library, junto al archivo (`Component.test.tsx` al lado de `Component.tsx`).
- **e2e**: Playwright en `apps/web/e2e/`.
- **Cobertura mínima**: 70% líneas en `src/components/` y `src/hooks/`.

### Backend

- **Unit**: JUnit 5 + Mockito.
- **Integration**: `@SpringBootTest` + Testcontainers (MySQL real).
- **Contract**: si hablamos con el frontend, los tipos de `packages/shared-types` se validan.

---

## Documentación

Si tu cambio:

- **Modifica arquitectura** (componentes, contratos entre apps, infra) → actualiza `docs/architecture/ARCHITECTURE.md` y abre un ADR.
- **Cambia el design system** → actualiza `docs/design-system/DESIGN.md` y `tokens.md`.
- **Agrega un endpoint nuevo o entidad** → actualiza el schema de `packages/shared-types`.
- **Es un proceso operativo** (deploy, rollback, oncall) → escribe un runbook en `docs/runbooks/`.

Si tienes que justificar a alguien por qué hiciste algo, **escríbelo**. La doc te salva en el code review de aquí a 3 meses.

---

## ADRs — cuándo crear uno

Crea un ADR cuando la decisión:

- Es difícil o costosa de revertir.
- Afecta a más de un equipo o módulo.
- Tiene trade-offs no obvios.
- Le quitará tiempo a alguien dentro de 6 meses si no se documenta.

**Cómo crearlo:**

1. Copia el template de `docs/architecture/adrs/0000-template.md`.
2. Numéralo: el siguiente ADR libre.
3. Estado inicial: `Proposed`.
4. Abre PR — discute en el PR.
5. Una vez aprobado, cambia estado a `Accepted` y mergea.

---

## Dudas

Abre un issue con label `question` o pregunta en el canal del equipo.
