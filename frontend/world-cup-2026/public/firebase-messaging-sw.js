/**
 * Firebase Messaging Service Worker
 *
 * Solo se activa si el proyecto tiene Firebase configurado
 * (self.__FIREBASE_PROJECT_ID__ debe ser un valor real, no vacío).
 * Sin configuración el SW se registra pero no hace nada → login funciona normal.
 */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const projectId = self.__FIREBASE_PROJECT_ID__;

// Si Firebase no está configurado → salir sin inicializar
if (!projectId || projectId === '' || projectId.startsWith('VITE_')) {
  // No-op: notifications push desactivadas — todo lo demás de la app funciona normal
} else {
  firebase.initializeApp({
    apiKey: self.__FIREBASE_API_KEY__,
    authDomain: self.__FIREBASE_AUTH_DOMAIN__,
    projectId: self.__FIREBASE_PROJECT_ID__,
    storageBucket: self.__FIREBASE_STORAGE_BUCKET__,
    messagingSenderId: self.__FIREBASE_MESSAGING_SENDER_ID__,
    appId: self.__FIREBASE_APP_ID__,
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? 'Mundial 2026 Hub';
    const body = payload.notification?.body ?? '';
    self.registration.showNotification(title, {
      body,
      icon: '/vite.svg',
      badge: '/vite.svg',
    });
  });
}
