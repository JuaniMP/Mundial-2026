# Frontend — Mundial 2026

Aplicación web de fan-engagement para el FIFA World Cup 2026.

**Stack:** Vite 6 · React 18 · TypeScript 5 · Tailwind CSS 3 · React Router v6 · Firebase JS SDK 11 · Stripe.js

---

## Páginas

| Ruta               | Componente           | Descripción                                       |
| ------------------ | -------------------- | ------------------------------------------------- |
| `/login`           | `Login.tsx`          | Autenticación JWT                                 |
| `/register`        | `Register.tsx`       | Registro de usuario                               |
| `/forgot-password` | `ForgotPassword.tsx` | Recuperación de contraseña                        |
| `/` → `/dashboard` | `Dashboard.tsx`      | Hero próximo partido, accesos rápidos, banner FCM |
| `/matches`         | `Matches.tsx`        | Lista de partidos WC 2026 en vivo                 |
| `/standings`       | `Standings.tsx`      | Tabla general + grupos A–L (FIFA WC 2026)         |
| `/stadiums`        | `Stadiums.tsx`       | Mapa interactivo de las 16 sedes                  |
| `/tickets`         | `Tickets.tsx`        | Compra de entradas vía Stripe                     |
| `/superpolla`      | `Superpolla.tsx`     | Predicciones y leaderboard                        |
| `/album`           | `Album.tsx`          | Álbum digital de stickers                         |

---

## Quickstart

```bash
# Instalar dependencias
npm install

# Configurar entorno (copia y rellena)
cp .env.example .env.local

# Desarrollo
npx vite --port 5173
# → http://localhost:5173

# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## Variables de entorno

Copia `.env.example` como `.env.local` y rellena los valores:

```env
# ── Stripe Sandbox ─────────────────────────────────────────────────────────────
VITE_STRIPE_PK=pk_test_...

# ── Firebase FCM (Push Notifications) ─────────────────────────────────────────
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=<proyecto>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<proyecto>
VITE_FIREBASE_STORAGE_BUCKET=<proyecto>.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=<número-de-proyecto>
VITE_FIREBASE_APP_ID=1:<número>:web:<hash>
# Obtener en: Firebase Console → Cloud Messaging → Certificados push web → Generar par de claves
VITE_FIREBASE_VAPID_KEY=B...
```

> Si alguna variable de Firebase está vacía, el sistema de notificaciones se desactiva
> automáticamente sin romper el resto de la aplicación.

---

## Push Notifications (FCM)

El flujo de notificaciones push funciona así:

1. El usuario hace clic en **"Activar notificaciones"** en el Dashboard.
2. El navegador solicita permiso de notificaciones.
3. Se registra el Service Worker (`/firebase-messaging-sw.js`).
4. El SW recibe la config de Firebase via `postMessage` (evita hardcodear en el SW).
5. Se obtiene el token FCM con la VAPID key.
6. El token se registra en el backend (`POST /api/v1/notifications/token`).
7. El backend suscribe el dispositivo al topic `"partidos"`.

**Disparadores de notificación:**

- Compra exitosa de entrada (Stripe webhook → FCM).
- Actualización de resultado de partido → broadcast al topic `"partidos"`.

**Archivos relevantes:**

```
src/firebase.ts                    # App + Messaging singleton con graceful disable
src/hooks/useFcm.ts               # Hook completo: permiso, token, registro, disable
public/firebase-messaging-sw.js   # Service Worker para push en background
```

---

## Pagos con Stripe

El flujo de compra:

1. El usuario selecciona categoría (VIP / Premium / General) y cantidad.
2. El frontend llama al backend `POST /api/v1/entradas/checkout`.
3. El backend crea una sesión Stripe Checkout y devuelve la URL.
4. El usuario completa el pago en la página de Stripe.
5. Stripe envía webhook al backend (`POST /api/v1/entradas/webhook`).
6. El backend marca la entrada como `PAGADO` y envía notificación FCM.

> Para pruebas usa la tarjeta `4242 4242 4242 4242` con cualquier fecha futura y CVC.

---

## Estructura de archivos

```
src/
├── pages/          # Una página por ruta
├── components/
│   └── layout/     # Navbar, wrappers de layout
├── hooks/
│   ├── useFcm.ts   # Push notifications
│   └── useAuth.ts  # Autenticación JWT
├── types/
│   └── index.ts    # Interfaces TypeScript globales
├── firebase.ts     # Firebase app singleton
└── App.tsx         # Router + rutas protegidas

public/
└── firebase-messaging-sw.js   # Service Worker FCM
```

---

## Comandos disponibles

```bash
npm run dev        # Servidor de desarrollo HMR
npm run build      # Build TypeScript + Vite
npm run preview    # Preview del build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit (sin emitir)
```
