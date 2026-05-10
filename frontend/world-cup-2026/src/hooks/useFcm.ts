import { useEffect, useCallback, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging, isFirebaseConfigured, firebaseConfig } from '../firebase';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8082';
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '';

export interface ForegroundMessage {
  title: string;
  body: string;
}

export interface UseFcmReturn {
  /** Current browser notification permission state (or 'unsupported'). */
  permission: NotificationPermission | 'unsupported';
  /** Whether the device token is successfully registered with the backend. */
  registered: boolean;
  /** Latest foreground message received while the app is open. Auto-clears in 6s. */
  foregroundMessage: ForegroundMessage | null;
  /** Whether Firebase is configured in env vars. */
  isConfigured: boolean;
  /** Request notification permission and register FCM token with the backend. */
  requestAndRegister: () => Promise<boolean>;
  /** Unregister — user opts out of push notifications. */
  disable: () => Promise<void>;
}

export function useFcm(authToken: string | null): UseFcmReturn {
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    return Notification.permission;
  });
  const [registered, setRegistered] = useState(false);
  const [foregroundMessage, setForegroundMessage] = useState<ForegroundMessage | null>(null);

  const isConfigured = isFirebaseConfigured();

  // ── Foreground message listener ─────────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured || !authToken) return;
    let cleanup: (() => void) | undefined;

    getFirebaseMessaging().then((messaging) => {
      if (!messaging) return;
      cleanup = onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? 'WC 2026';
        const body = payload.notification?.body ?? '';
        setForegroundMessage({ title, body });
        // Auto-dismiss after 6 seconds
        setTimeout(() => setForegroundMessage(null), 6000);
      });
    });

    return () => cleanup?.();
  }, [isConfigured, authToken]);

  // ── Check existing permission on mount ──────────────────────────────────────
  // permission is already initialised via the lazy useState initialiser above;
  // here we only need to mark the device as registered if permission was pre-granted.
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'granted' &&
      authToken
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRegistered(true);
    }
  }, [authToken]);

  // ── requestAndRegister ──────────────────────────────────────────────────────
  const requestAndRegister = useCallback(async (): Promise<boolean> => {
    if (!isConfigured) {
      console.warn('[FCM] Firebase not configured. Add VITE_FIREBASE_* env vars.');
      return false;
    }
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return false;
    }

    // Ask for permission
    let perm = Notification.permission;
    if (perm === 'default') {
      perm = await Notification.requestPermission();
    }
    setPermission(perm);
    if (perm !== 'granted') return false;

    const messaging = await getFirebaseMessaging();
    if (!messaging) {
      console.warn('[FCM] Messaging not supported in this browser');
      return false;
    }

    // Register service worker & pass Firebase config to it
    let swReg: ServiceWorkerRegistration;
    try {
      swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      // Wait for SW to activate, then send config
      await navigator.serviceWorker.ready;
      const sw = swReg.installing ?? swReg.waiting ?? swReg.active;
      sw?.postMessage({ type: 'FIREBASE_CONFIG', config: firebaseConfig });
    } catch (err) {
      console.error('[FCM] Service worker registration failed:', err);
      return false;
    }

    // Obtain FCM token
    let fcmToken: string;
    try {
      fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY || undefined,
        serviceWorkerRegistration: swReg,
      });
    } catch (err) {
      console.error('[FCM] getToken failed:', err);
      return false;
    }

    if (!fcmToken) {
      console.warn('[FCM] Empty token received');
      return false;
    }

    // Register with backend
    if (!authToken) return false;
    try {
      const res = await fetch(`${API_BASE}/api/v1/notifications/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: fcmToken }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setRegistered(true);
      console.info('[FCM] Token registered with backend ✅');
      return true;
    } catch (err) {
      console.error('[FCM] Backend token registration failed:', err);
      return false;
    }
  }, [isConfigured, authToken]);

  // ── disable ─────────────────────────────────────────────────────────────────
  const disable = useCallback(async (): Promise<void> => {
    if (!authToken) return;
    try {
      await fetch(`${API_BASE}/api/v1/notifications/token`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setRegistered(false);
      console.info('[FCM] Token removed');
    } catch (err) {
      console.error('[FCM] Failed to remove token:', err);
    }
  }, [authToken]);

  return { permission, registered, foregroundMessage, isConfigured, requestAndRegister, disable };
}
