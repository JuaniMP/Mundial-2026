# Mundial 2026 — Un Mundial para Todos

> Plataforma digital del Mundial FIFA 2026 (México 🇲🇽 · Estados Unidos 🇺🇸 · Canadá 🇨🇦) — *"Un Mundial para Todos"*.
>
> Stack: **Vite + React 18 + TypeScript + Tailwind** (web) · **Spring Boot + MySQL** (api, próximamente) · **monorepo con npm workspaces**.

[![Status](https://img.shields.io/badge/status-prototype-blue)]()
[![Stage](https://img.shields.io/badge/stage-design--complete-green)]()
[![Spec](https://img.shields.io/badge/spec-001--world--cup--react--frontend-orange)](docs/product/spec.md)

---

## Índice

- [¿De qué va esto?](#de-qué-va-esto)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Quickstart](#quickstart)
- [Stack y decisiones](#stack-y-decisiones)
- [Documentación](#documentación)
- [Roadmap](#roadmap)
- [Cómo contribuir](#cómo-contribuir)
- [Licencia](#licencia)

---

## ¿De qué va esto?

**Un Mundial para Todos** es una plataforma de fan engagement para el Mundial 2026 con cuatro experiencias principales:

| Sección | Qué hace | Story |
|---|---|---|
| 🏟️ **Stadium Experience** | Detalle de estadios, partidos, mapa de calor de asientos, estadísticas. | [US-2](docs/product/spec.md#user-story-2) |
| 🎟️ **Album Digital** | Colección de stickers, progreso por país, apertura de packs. | [US-3](docs/product/spec.md#user-story-3) |
| 🏆 **Superpolla** | Predicciones, leaderboard global, standings. | [US-4](docs/product/spec.md#user-story-4) |
| 📊 **Dashboard** | Hero del próximo partido, accesos rápidos, highlights. | [US-5](docs/product/spec.md#user-story-5) |

El sistema de diseño *"Diplomatic Gallery"* trata el Mundial no como un torneo sino como una cumbre global — editorial, premium, sin bordes de 1px. Detalles en [docs/design-system/DESIGN.md](docs/design-system/DESIGN.md).

---

## Estructura del repositorio

```text
Mundial-2026/
├── apps/
│   ├── web/                    # Frontend Vite + React + TS + Tailwind
│   └── api/                    # Backend Spring Boot (placeholder)
├── packages/
│   └── shared-types/           # Tipos compartidos web ↔ api
├── docs/
│   ├── architecture/
│   │   ├── ARCHITECTURE.md     # Visión big-picture
│   │   ├── adrs/               # Architecture Decision Records
│   │   └── diagrams/           # C4, ER, secuencia
│   ├── design-system/
│   │   ├── DESIGN.md           # Diplomatic Gallery
│   │   └── tokens.md           # Color, type, spacing tokens
│   ├── product/
│   │   ├── spec.md             # Spec funcional
│   │   └── checklists/         # Quality gates
│   ├── runbooks/               # Cómo operar en producción
│   └── design-source/          # Mockups HTML originales (Stitch)
├── .github/
│   ├── ISSUE_TEMPLATE/
│   ├── pull_request_template.md
│   └── workflows/              # CI
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .nvmrc
├── CONTRIBUTING.md
├── LICENSE
├── package.json                # workspaces root
└── README.md                   # estás aquí
```

Cada carpeta tiene su propio `README.md` con su misión, convenciones y comandos.

---

## Quickstart

### Prerrequisitos

- **Node.js 20.x LTS** (ver [`.nvmrc`](.nvmrc))
- **npm 10+** (workspaces nativos)
- **Java 21 + Maven 3.9+** *(solo cuando empiece el backend)*
- **Git**

### Setup

```bash
# 1) Clonar
git clone <tu-url> mundial-2026
cd mundial-2026

# 2) Asegurar versión de Node
nvm use            # lee .nvmrc → 20.x

# 3) Instalar dependencias del workspace completo
npm install

# 4) Levantar el frontend
npm run dev --workspace=apps/web
# → http://localhost:5173
```

### Comandos principales

```bash
npm run dev         # web en modo dev con HMR
npm run build       # build de producción de web
npm run lint        # ESLint en todos los workspaces
npm run typecheck   # tsc --noEmit en todos los workspaces
npm run test        # tests unitarios (vitest)
npm run format      # prettier --write
```

---

## Stack y decisiones

| Capa | Tecnología | ADR |
|---|---|---|
| Frontend | Vite + React 18 + TypeScript 5 + Tailwind 3 | [ADR-0002](docs/architecture/adrs/0002-frontend-stack-vite-react-ts.md) |
| Routing | React Router v6 | ADR-0002 |
| Estado | TanStack Query + Zustand (cuando hace falta) | ADR-0002 |
| Estilos | Tailwind + CSS variables (design tokens) | ADR-0002 |
| Tests | Vitest + Testing Library + Playwright (e2e) | [ADR-0005](docs/architecture/adrs/0005-testing-strategy.md) |
| Backend | Spring Boot 3 + Java 21 | [ADR-0003](docs/architecture/adrs/0003-backend-stack-spring-boot.md) |
| Base de datos | MySQL 8 + JSON columns para payloads heterogéneos | [ADR-0004](docs/architecture/adrs/0004-database-relational-with-json.md) |
| Monorepo | npm workspaces | [ADR-0001](docs/architecture/adrs/0001-monorepo-structure.md) |

> Cada ADR sigue el formato **Status / Context / Decision / Options / Trade-offs / Consequences**. Si propones un cambio importante, abre un ADR nuevo (`0006-...`) antes de codear.

---

## Documentación

La doc viva está en [`docs/`](docs/). Mapa rápido:

- 🏛️ **[docs/architecture/ARCHITECTURE.md](docs/architecture/ARCHITECTURE.md)** — visión big-picture, diagramas C4, flujos.
- 📜 **[docs/architecture/adrs/](docs/architecture/adrs/)** — Architecture Decision Records.
- 🎨 **[docs/design-system/DESIGN.md](docs/design-system/DESIGN.md)** — sistema de diseño *Diplomatic Gallery*.
- 📋 **[docs/product/spec.md](docs/product/spec.md)** — spec funcional con user stories y FRs.
- 📚 **[docs/runbooks/](docs/runbooks/)** — cómo operar en producción.
- 🖼️ **[docs/design-source/](docs/design-source/)** — mockups HTML originales del Stitch (referencia).

---

## Roadmap

| Fase | Entregables | Estado |
|---|---|---|
| **0 — Foundations** | Repo, specs, design system, ADRs base | ✅ |
| **1 — Web prototype** | 4 vistas con datos mock, navegación, responsive | 🚧 |
| **2 — API base** | Spring Boot, MySQL schema, auth (Keycloak/JWT) | ⏳ |
| **3 — Integración** | Web ↔ API, TanStack Query, env config | ⏳ |
| **4 — Hardening** | Tests e2e, CI/CD, observabilidad, perf budget | ⏳ |
| **5 — Launch** | Deploy a Vercel (web) + Cloud Run/EKS (api) | ⏳ |

---

## Cómo contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md) — cubre branch naming, commit convention (Conventional Commits), PR template y quality gates.

Resumen express:

```bash
git checkout -b feat/short-description
# ... cambios ...
npm run lint && npm run typecheck && npm run test
git commit -m "feat(web): add stadium heatmap component"
git push origin feat/short-description
# Abre PR contra main
```

---

## Licencia

[MIT](LICENSE) © 2026 — Juanita Mejia y contribuidores.