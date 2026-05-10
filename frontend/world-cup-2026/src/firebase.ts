import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging';

// ── Config (from .env.local) ──────────────────────────────────────────────────
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

/** Returns true only when all Firebase env vars are properly set. */
export const isFirebaseConfigured = (): boolean =>
  !!firebaseConfig.apiKey &&
  !firebaseConfig.apiKey.includes('REEMPLAZA') &&
  !!firebaseConfig.projectId;

// ── Lazy singletons ───────────────────────────────────────────────────────────
let _app: FirebaseApp | null = null;

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) return null;
  if (!_app) {
    _app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return _app;
};

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  const app = getFirebaseApp();
  if (!app) return null;
  const supported = await isSupported();
  if (!supported) return null;
  return getMessaging(app);
};
