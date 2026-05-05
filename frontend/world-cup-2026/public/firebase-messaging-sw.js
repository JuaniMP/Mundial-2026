/* eslint-disable no-undef */
/**
 * Firebase Cloud Messaging — Service Worker
 * Background message handler for WC 2026 Hub.
 *
 * The main app sends Firebase config via postMessage after SW registration,
 * so no hardcoded credentials are needed here.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

let initialized = false;

// Receive Firebase config from the main app thread
self.addEventListener('message', (event) => {
  if (event.data?.type === 'FIREBASE_CONFIG' && !initialized) {
    try {
      firebase.initializeApp(event.data.config);

      const messaging = firebase.messaging();

      // Handle messages received while the app is in the background
      messaging.onBackgroundMessage((payload) => {
        const title = payload.notification?.title ?? 'WC 2026';
        const body  = payload.notification?.body  ?? '';

        self.registration.showNotification(title, {
          body,
          icon:  '/favicon.ico',
          badge: '/favicon.ico',
          tag:   'wc2026-notification',
          data:  payload.data ?? {},
          actions: [
            { action: 'open', title: '📱 Abrir app' },
            { action: 'dismiss', title: 'Descartar' },
          ],
        });
      });

      initialized = true;
      console.log('[SW] Firebase Messaging initialized');
    } catch (err) {
      console.error('[SW] Firebase init error:', err);
    }
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});
