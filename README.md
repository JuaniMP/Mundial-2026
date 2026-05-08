# Mundial 2026 — Un Mundial para Todos

> Plataforma digital de fan-engagement para el **FIFA World Cup 2026** (México 🇲🇽 · EE.UU. 🇺🇸 · Canadá 🇨🇦).
>
> Stack: **Vite + React 18 + TypeScript + Tailwind** (frontend) · **Spring Boot 3 + MySQL 8** (backend API) · **Firebase FCM** (push notifications) · **Stripe** (pagos sandbox) · **Tailscale** (acceso VM remota).

[![CI](https://github.com/JuaniMP/Mundial-2026/actions/workflows/ci.yml/badge.svg)](https://github.com/JuaniMP/Mundial-2026/actions)
[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![Sprint](https://img.shields.io/badge/sprint-4%20completado-blue)]()

---

## Índice

- [Características implementadas](#características-implementadas)
- [Arquitectura](#arquitectura)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Quickstart](#quickstart)
- [Variables de entorno](#variables-de-entorno)
- [Stack y decisiones](#stack-y-decisiones)
- [API — Endpoints principales](#api--endpoints-principales)
- [Roadmap / Sprints](#roadmap--sprints)
- [Documentación](#documentación)
- [Cómo contribuir](#cómo-contribuir)

---

## Características implementadas

| Módulo | Descripción | Sprint |
|---|---|---|
| 🔐 **Auth JWT** | Registro, login, recuperación de contraseña por email (Gmail SMTP) | 1 |
| 🌍 **Partidos & API FIFA** | Integración con football-data.org v4, caché Caffeine 5 min | 1–2 |
| 🏟️ **Mapa de Estadios** | 16 sedes con coordenadas, estadísticas e integración Leaflet | 2 |
| 📊 **Tabla de Posiciones** | Tabla general (API en vivo) + grupos A–L estáticos FIFA WC 2026 | 2–4 |
| 🎟️ **Entradas (Stripe)** | Compra de tickets por categoría (VIP / General / Premium), webhooks Stripe sandbox | 3 |
| 🎴 **Álbum Digital** | Colección de stickers por jugador, apertura de packs, progreso | 1–2 |
| 🏆 **Superpolla** | Predicciones de resultados, leaderboard global | 1–2 |
| 🔔 **Push Notifications (FCM)** | Firebase Cloud Messaging: notificación al comprar entrada y al registrarse resultado, broadcast al topic "partidos" | 4 |
| 📧 **Notificaciones in-app** | Historial de notificaciones por usuario en BD | 4 |

---

## Arquitectura

```
                      ┌─────────────────────────────┐
                      │   Browser / PWA              │
                      │   React 18 + Vite + TS       │
                      │   Tailwind · React Router    │
                      └────────────┬────────────────-┘
                                   │ HTTP + JWT
                      ┌────────────▼────────────────-┐
                      │   Spring Boot 3.2 (API)       │
                      │   :8082 · JWT · Caffeine      │
                      │   JPA/Hibernate               │
                      └──────┬──────────┬────────────-┘
                             │          │
              ┌──────────────▼──┐  ┌────▼──────────────┐
              │ MySQL 8         │  │  Servicios externos│
              │ VM via Tailscale│  │  ├ football-data.org│
              │ 100.87.26.105   │  │  ├ Stripe (sandbox) │
              └─────────────────┘  │  ├ Gmail SMTP       │
                                   │  └ Firebase FCM     │
                                   └────────────────────-┘
```

---

## Estructura del repositorio

```text
Mundial-2026/
├── backend/                        # Spring Boot 3 API
│   ├── src/main/java/co/edu/unbosque/
│   │   ├── config/                 # SecurityConfig, CorsConfig, FirebaseConfig
│   │   ├── controller/             # REST controllers (Auth, Partido, Estadio,
│   │   │                           #   Entrada, Notification, Superpolla, Album…)
│   │   ├── dto/                    # Request/Response DTOs
│   │   ├── entity/                 # JPA entities (Usuario, Partido, Entrada…)
│   │   ├── repository/             # Spring Data JPA repositories
│   │   ├── service/                # Lógica de negocio (Stripe, FCM, Football…)
│   │   └── security/               # JwtAuthFilter, JwtService
│   ├── src/main/resources/
│   │   └── application.properties  # Configuración (ver Variables de entorno)
│   ├── start-dev.bat               # Script de arranque local con env vars
│   └── pom.xml
│
├── frontend/world-cup-2026/        # React + Vite frontend
│   ├── public/
│   │   └── firebase-messaging-sw.js # Service Worker para push en background
│   ├── src/
│   │   ├── pages/                  # Login, Dashboard, Partidos, Standings,
│   │   │                           #   Estadios, Entradas, Superpolla, Album
│   │   ├── components/             # Navbar, layout, shared components
│   │   ├── hooks/                  # useFcm, useAuth, useMatches…
│   │   ├── types/                  # TypeScript interfaces compartidas
│   │   ├── firebase.ts             # Firebase app + messaging singleton
│   │   └── App.tsx                 # Router principal
│   ├── .env.example                # Variables de entorno requeridas
│   └── package.json
│
├── docs/                           # Documentación técnica y de producto
│   ├── architecture/               # ARCHITECTURE.md, ADRs, diagramas C4
│   ├── design-system/              # DESIGN.md (Diplomatic Gallery), tokens
│   ├── product/                    # spec.md, user stories, checklists
│   └── runbooks/                   # Operaciones en producción
│
├── basededatos/                    # Scripts SQL de referencia
├── .github/
│   ├── workflows/ci.yml            # CI: lint + typecheck + build
│   └── pull_request_template.md
└── README.md                       # estás aquí
```

---

## Quickstart

### Prerrequisitos

| Herramienta | Versión mínima | Notas |
|---|---|---|
| Node.js | 20 LTS | Ver `.nvmrc` |
| Java (JDK) | 17 | Eclipse Adoptium recomendado |
| Maven | 3.9+ | O usa el wrapper `mvnw` |
| MySQL | 8.x | En VM remota vía Tailscale |
| Tailscale | cualquiera | Para conectar a la VM MySQL |

### Backend

```bash
cd backend

# Opción A — script de desarrollo (Windows, incluye env vars)
start-dev.bat

# Opción B — Maven directo con env vars
set FIREBASE_ENABLED=true
set FIREBASE_SERVICE_ACCOUNT_FILE=C:\ruta\al\service-account.json
set STRIPE_SECRET_KEY=sk_test_...
mvn spring-boot:run

# → API disponible en http://localhost:8082
# → Swagger UI en http://localhost:8082/swagger-ui.html
```

> **Importante:** la base de datos MySQL está en una VM remota (Tailscale).
> Asegúrate de que Tailscale esté activo y la VM encendida antes de arrancar.

### Frontend

```bash
cd frontend/world-cup-2026

# 1) Copia y rellena el archivo de entorno
cp .env.example .env.local
# → edita .env.local con tus claves Stripe y Firebase

# 2) Instala dependencias
npm install

# 3) Arranca Vite
npx vite --port 5173
# → http://localhost:5173
```

---

## Variables de entorno

### Backend — `application.properties` / env vars

| Variable | Descripción | Requerida |
|---|---|---|
| `DB_USER` | Usuario MySQL | No (default: `juanita_mh`) |
| `DB_PASSWORD` | Contraseña MySQL | No (default en props) |
| `JWT_SECRET` | Secreto Base64 para firmar JWT (≥256 bits) | No (default en props) |
| `STRIPE_SECRET_KEY` | Clave secreta Stripe (`sk_test_...`) | Sí para pagos |
| `STRIPE_PUBLISHABLE_KEY` | Clave publicable Stripe (`pk_test_...`) | Sí para pagos |
| `STRIPE_WEBHOOK_SECRET` | Secreto webhook Stripe (`whsec_...`) | Sí para webhooks |
| `FIREBASE_ENABLED` | `true` para activar FCM | No (default: `false`) |
| `FIREBASE_SERVICE_ACCOUNT_FILE` | Ruta al JSON de servicio de Firebase | Solo si FCM habilitado |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | JSON de servicio inline (alternativa al archivo) | Solo si FCM habilitado |
| `MAIL_USERNAME` | Cuenta Gmail para envío de correos | No (default en props) |
| `MAIL_PASSWORD` | App password de Gmail | No (default en props) |
| `FOOTBALL_DATA_KEY` | API key de football-data.org | No (default en props) |
| `CORS_ORIGINS` | Origins permitidos (lista separada por comas) | No (default: localhost:5173…) |

### Frontend — `.env.local`

| Variable | Descripción |
|---|---|
| `VITE_STRIPE_PK` | Clave publicable Stripe (`pk_test_...`) |
| `VITE_FIREBASE_API_KEY` | API key del proyecto Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<proyecto>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ID del proyecto Firebase |
| `VITE_FIREBASE_STORAGE_BUCKET` | `<proyecto>.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Número del proyecto Firebase |
| `VITE_FIREBASE_APP_ID` | App ID de la web app registrada en Firebase |
| `VITE_FIREBASE_VAPID_KEY` | Clave pública VAPID (Firebase Console → Cloud Messaging → Certificados push web) |

> Copia `frontend/world-cup-2026/.env.example` como punto de partida.

---

## Stack y decisiones

| Capa | Tecnología | Notas |
|---|---|---|
| **Frontend** | Vite 6 + React 18 + TypeScript 5 + Tailwind 3 | SPA con React Router v6 |
| **Backend** | Spring Boot 3.2 + Java 17 | REST API, JPA/Hibernate |
| **Base de datos** | MySQL 8 en VM remota (Tailscale) | DDL auto: `update` |
| **Autenticación** | JWT (jjwt 0.12) + Spring Security 6 | Tokens con expiración 1h |
| **Pagos** | Stripe Java SDK 25.x | Sandbox, webhooks |
| **Push Notifications** | Firebase Admin SDK 9.2 (backend) + Firebase JS SDK 11.x (frontend) | FCM v1 API, VAPID |
| **API FIFA** | football-data.org v4 | Caché Caffeine 5 min |
| **Email** | Spring Mail + Gmail SMTP | Recuperación de contraseña |
| **CI** | GitHub Actions | Lint + typecheck + build |

---

## API — Endpoints principales

### Auth
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Registro de usuario |
| `POST` | `/api/v1/auth/login` | Login → devuelve JWT |
| `POST` | `/api/v1/auth/forgot-password` | Solicitar reset de contraseña |
| `POST` | `/api/v1/auth/reset-password` | Confirmar reset con token |

### Partidos & Standings
| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/v1/partidos` | Lista de partidos WC 2026 |
| `GET` | `/api/v1/football/standings` | Tabla general de posiciones |
| `GET` | `/api/v1/estadios` | 16 sedes con coordenadas |

### Entradas (Stripe)
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/entradas/checkout` | Crear sesión Stripe Checkout |
| `POST` | `/api/v1/entradas/webhook` | Webhook Stripe (pago exitoso) |
| `GET` | `/api/v1/entradas/mis-entradas` | Entradas del usuario autenticado |

### Notificaciones (FCM)
| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/v1/notifications/token` | Registrar token FCM del dispositivo |
| `DELETE` | `/api/v1/notifications/token` | Eliminar token (desactivar push) |
| `GET` | `/api/v1/notifications/has-token` | Verificar si hay token registrado |
| `POST` | `/api/v1/notifications/test` | Enviar push de prueba al propio usuario |
| `GET` | `/api/v1/notifications/mis-notificaciones` | Historial de notificaciones |

> Swagger UI completo en `http://localhost:8082/swagger-ui.html` (con el backend activo).

---

## Roadmap / Sprints

| Sprint | Entregables | Estado |
|---|---|---|
| **1 — Foundations** | Auth JWT, estructura Spring Boot, entidades base, email, football-data API | ✅ Completo |
| **2 — Core Features** | Mapa de estadios (Leaflet), partidos en vivo, álbum digital, superpolla, tabla posiciones | ✅ Completo |
| **3 — Pagos Stripe** | Flujo completo de compra de entradas, Stripe Checkout, webhooks, historial | ✅ Completo |
| **4 — Push Notifications** | Firebase FCM (backend Admin SDK + frontend Messaging SDK), VAPID, Service Worker, grupos A–L en Standings | ✅ Completo |
| **5 — Hardening** | Tests e2e (Playwright), observabilidad, perf budget, accesibilidad WCAG 2.1 | ⏳ Pendiente |
| **6 — Deploy** | Vercel (frontend) + hosting backend, dominio, CI/CD completo | ⏳ Pendiente |

---

## Documentación

| Documento | Descripción |
|---|---|
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | Visión big-picture, diagramas C4, flujos de datos |
| [`docs/architecture/adrs/`](docs/architecture/adrs/) | Architecture Decision Records (por qué elegimos cada tecnología) |
| [`docs/design-system/DESIGN.md`](docs/design-system/DESIGN.md) | Sistema de diseño _Diplomatic Gallery_ |
| [`docs/product/spec.md`](docs/product/spec.md) | Spec funcional con user stories |
| [`backend/README.md`](backend/README.md) | Guía del backend: setup, env vars, endpoints |
| [`frontend/world-cup-2026/README.md`](frontend/world-cup-2026/README.md) | Guía del frontend: setup, páginas, Firebase/Stripe |
| [`docs/runbooks/`](docs/runbooks/) | Procedimientos operativos |

---

## Cómo contribuir

Lee [CONTRIBUTING.md](CONTRIBUTING.md). Resumen:

```bash
# 1) Crea tu rama
git checkout -b feat/mi-feature   # o fix/, docs/, chore/

# 2) Haz tus cambios y asegura que pasa CI
cd frontend/world-cup-2026 && npm run lint && npm run typecheck && npm run build

# 3) Commit con Conventional Commits
git commit -m "feat(notifications): add in-app notification badge"

# 4) Abre PR contra main — usa el template de PR
git push origin feat/mi-feature
```

---

## Licencia

[MIT](LICENSE) © 2026 — Juanita Mejia y contribuidores.
