# Architecture Decision Records (ADRs)

Decisiones arquitectónicas que pesan. Cada una vive como un archivo Markdown numerado.

## Convenciones

- Numeración secuencial: `0001`, `0002`, `0003`...
- Slug en kebab-case: `0002-frontend-stack-vite-react-ts.md`.
- Estado: `Proposed` → `Accepted` | `Rejected` → eventualmente `Deprecated` o `Superseded by ADR-XXXX`.
- Inmutables una vez `Accepted`: si la decisión cambia, **se crea un ADR nuevo** que la deprecate.

## Cuándo crear uno

Lee la guía en [CONTRIBUTING.md](../../../CONTRIBUTING.md#adrs--cuándo-crear-uno). Si alguien va a preguntar *"¿por qué hicimos esto?"* dentro de 6 meses, escríbelo.

## Índice

| # | Título | Estado | Fecha |
|---|---|---|---|
| [0001](0001-monorepo-structure.md) | Estructura monorepo con npm workspaces | Accepted | 2026-05-02 |
| [0002](0002-frontend-stack-vite-react-ts.md) | Frontend: Vite + React 18 + TypeScript | Accepted | 2026-05-02 |
| [0003](0003-backend-stack-spring-boot.md) | Backend: Spring Boot 3 + Java 21 | Accepted | 2026-05-02 |
| [0004](0004-database-relational-with-json.md) | Base de datos: MySQL relacional + JSON payload para tipos heterogéneos | Accepted | 2026-05-02 |
| [0005](0005-testing-strategy.md) | Estrategia de testing (Vitest + Playwright + JUnit + Testcontainers) | Accepted | 2026-05-02 |

Template para nuevos: [`0000-template.md`](0000-template.md).
