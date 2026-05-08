# Backend — Mundial 2026 API

API REST con **Spring Boot 3.2 + Java 17 + MySQL 8**.

Puerto: `8082` · Context path: `/` · Swagger: `http://localhost:8082/swagger-ui.html`

---

## Quickstart

### Prerrequisitos

- Java 17 (Eclipse Adoptium recomendado)
- Maven 3.9+
- MySQL 8 accesible (VM remota vía Tailscale en `100.87.26.105:3306`)
- Tailscale activo y conectado

### Arranque (desarrollo local)

```bash
# Opción A — script Windows (incluye env vars de Stripe y Firebase)
cd backend
start-dev.bat

# Opción B — Maven con env vars manuales
cd backend
set FIREBASE_ENABLED=true
set FIREBASE_SERVICE_ACCOUNT_FILE=C:\ruta\al\service-account.json
set STRIPE_SECRET_KEY=sk_test_...
set STRIPE_PUBLISHABLE_KEY=pk_test_...
mvn spring-boot:run
```

La primera vez, Maven descarga dependencias (~2-3 min). Arranques siguientes: ~45 s.

---

## Variables de entorno

Todas tienen valor por defecto en `application.properties`. Para producción/staging
configúralas como variables de entorno del sistema o en tu pipeline CI/CD.

| Variable | Default | Descripción |
|---|---|---|
| `DB_USER` | `juanita_mh` | Usuario MySQL |
| `DB_PASSWORD` | _(en props)_ | Contraseña MySQL |
| `JWT_SECRET` | _(en props)_ | Secreto Base64 ≥256 bits para JWT |
| `JWT_EXPIRATION_MS` | `3600000` | Expiración del token (1 hora) |
| `STRIPE_SECRET_KEY` | placeholder | `sk_test_...` de Stripe Dashboard |
| `STRIPE_PUBLISHABLE_KEY` | placeholder | `pk_test_...` de Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | placeholder | `whsec_...` de Stripe CLI/Dashboard |
| `FIREBASE_ENABLED` | `false` | `true` para activar FCM |
| `FIREBASE_SERVICE_ACCOUNT_FILE` | _(vacío)_ | Ruta al `.json` de Firebase service account |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | _(vacío)_ | JSON inline (alternativa al archivo) |
| `MAIL_HOST` | `smtp.gmail.com` | Host SMTP |
| `MAIL_USERNAME` | _(en props)_ | Cuenta Gmail |
| `MAIL_PASSWORD` | _(en props)_ | App password de Gmail |
| `FOOTBALL_DATA_KEY` | _(en props)_ | API key de football-data.org |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Origins permitidos (lista con comas) |

---

## Módulos principales

### Autenticación
- `AuthController` — registro, login, forgot/reset password
- `JwtService` — generación y validación de tokens JWT
- `JwtAuthFilter` — filtro de seguridad Spring Security

### Partidos & Estadios
- `FootballDataService` — integración con football-data.org v4, caché Caffeine 5 min
- `PartidoController` / `EstadioController` — endpoints REST

### Entradas (Stripe)
- `StripeService` — crea sesiones Checkout, procesa webhooks
- `EntradaController` — endpoints de compra e historial
- Al confirmar pago → notifica vía FCM al comprador

### Notificaciones (Firebase FCM)
- `FirebaseConfig` — inicializa Admin SDK desde archivo JSON o variable de entorno;
  si `firebase.enabled=false`, se desactiva sin romper la app
- `FcmService` — `sendToToken`, `sendToTopic`, `subscribeToTopic`,
  `notifyTicketPurchase`, `notifyMatchResult`
- `NotificationController` — gestión de tokens FCM e historial

### Soporte & Álbum
- `SoporteController`, `AlbumController`, `JugadorController`

---

## Endpoints principales

### Auth
```
POST /api/v1/auth/register          Registro
POST /api/v1/auth/login             Login → JWT
POST /api/v1/auth/forgot-password   Solicitar reset
POST /api/v1/auth/reset-password    Confirmar reset con token
```

### Partidos & Standings
```
GET  /api/v1/partidos               Lista de partidos
GET  /api/v1/football/standings     Tabla de posiciones
GET  /api/v1/estadios               16 sedes
```

### Entradas
```
POST /api/v1/entradas/checkout      Crear sesión Stripe Checkout
POST /api/v1/entradas/webhook       Webhook Stripe (⚠️ sin auth JWT)
GET  /api/v1/entradas/mis-entradas  Historial del usuario
```

### Notificaciones
```
POST   /api/v1/notifications/token              Registrar token FCM
DELETE /api/v1/notifications/token              Eliminar token
GET    /api/v1/notifications/has-token          ¿Tiene token registrado?
POST   /api/v1/notifications/test               Push de prueba
GET    /api/v1/notifications/mis-notificaciones Historial
```

### Actuator (health / métricas)
```
GET /actuator/health    Estado del servicio
GET /actuator/info      Información de la aplicación
GET /actuator/metrics   Métricas básicas
```

---

## Configuración Firebase FCM

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. Genera una **Service Account key** (JSON):
   `Project Settings → Service accounts → Generate new private key`.
3. Guarda el archivo y configura:
   ```
   set FIREBASE_ENABLED=true
   set FIREBASE_SERVICE_ACCOUNT_FILE=C:\ruta\al\archivo.json
   ```
4. El backend inicializará el Admin SDK al arrancar:
   ```
   ✅ Firebase Admin SDK initialized (FCM ready)
   ```

---

## Base de datos

- **Host:** `100.87.26.105:3306` (VM remota vía Tailscale)
- **Schema:** `MundialHUB2026`
- **DDL:** `spring.jpa.hibernate.ddl-auto=update` (Hibernate gestiona el schema)

Tablas principales: `usuarios`, `partidos`, `estadios`, `entradas`, `notificaciones`,
`jugadores`, `album_stickers`, `superpolla_predicciones`.

---

## Estructura de paquetes

```
co.edu.unbosque/
├── config/         FirebaseConfig, SecurityConfig, CorsConfig, DataSeeder
├── controller/     Un controller por dominio
├── dto/            Request y Response DTOs (@Valid, @NotBlank…)
├── entity/         JPA entities con @Table, @Column
├── exception/      GlobalExceptionHandler
├── repository/     Spring Data JPA interfaces
├── security/       JwtAuthFilter, JwtService, UserDetailsImpl
└── service/        Lógica de negocio
```

---

## Swagger / OpenAPI

Con el backend corriendo:
```
http://localhost:8082/swagger-ui.html
http://localhost:8082/v3/api-docs
```

Todos los endpoints protegidos requieren header:
```
Authorization: Bearer <jwt-token>
```
