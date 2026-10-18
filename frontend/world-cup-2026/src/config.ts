/**
 * URL del backend. Se configura con VITE_API_URL (sin /api/v1 al final).
 * Por defecto: localhost en `npm run dev` y el despliegue en Fly.io en el build.
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? 'http://localhost:8082' : 'https://mundial-2026-hub.fly.dev');

export const API_V1 = `${API_BASE_URL}/api/v1`;
