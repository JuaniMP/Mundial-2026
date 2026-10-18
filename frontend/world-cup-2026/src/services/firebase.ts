/**
 * Firebase Client (FCM Push Notifications)
 *
 * Para activar push notifications:
 * 1. Ve a Firebase Console → Configuración del proyecto → General → Tus apps → Web.
 * 2. Copia la configuración de Firebase y rellena las variables VITE_FIREBASE_* en .env.local.
 * 3. En Firebase Console → Cloud Messaging → Certificados push web → genera la VAPID key.
 * 4. En el backend pon firebase.enabled=true y proporciona el service account JSON.
 *
 * Si las variables no están configuradas, el módulo exporta funciones no-op seguras.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, type Messaging } from 'firebase/messaging';
import axios from 'axios';
import { API_BASE_URL } from './http';

const API_BASE = API_BASE_URL;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '';

/** True si el desarrollador ha configurado las variables de entorno de Firebase */
function isConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    VAPID_KEY,
  );
}

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!isConfigured()) return null;
  if (app) return app;
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    return app;
  } catch {
    return null;
  }
}

function getFirebaseMessaging(): Messaging | null {
  if (messaging) return messaging;
  const firebaseApp = getFirebaseApp();
  if (!firebaseApp) return null;
  try {
    messaging = getMessaging(firebaseApp);
    return messaging;
  } catch {
    return null;
  }
}

/**
 * Solicita permiso de notificación al usuario, obtiene el token FCM y lo registra en el backend.
 * Llama a este función después de que el usuario inicia sesión.
 *
 * @returns El token FCM registrado, o null si no se pudo obtener.
 */
export async function registerFcmToken(): Promise<string | null> {
  if (!isConfigured()) {
    // Firebase no configurado — silencioso, no es un error
    return null;
  }

  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return null;
    }

    const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const msg = getFirebaseMessaging();
    if (!msg) return null;

    const token = await getToken(msg, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });

    if (!token) return null;

    // Enviar token al backend para que lo guarde en la BD
    const authToken = sessionStorage.getItem('token');
    if (!authToken) return null;

    await axios.post(
      `${API_BASE}/api/v1/notifications/fcm-token`,
      { token },
      { headers: { Authorization: `Bearer ${authToken}` } },
    );

    return token;
  } catch (err) {
    // Silencioso — push es opcional
    console.debug('[FCM] No se pudo registrar el token:', err);
    return null;
  }
}
