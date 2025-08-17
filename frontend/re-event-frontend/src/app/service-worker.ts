/*
/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope;

// ============================
// CONFIG
// ============================
const DEBUG = true;
const APP_VERSION = '1.0.0';

function log(...args: any[]) {
  if (DEBUG) console.log('[SW]', ...args);
}

clientsClaim();

// ============================
// Precaching
// ============================
precacheAndRoute(self.__WB_MANIFEST);

// SPA fallback
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request }) =>
    request.mode === 'navigate' &&
    request.method === 'GET' &&
    request.headers.get('accept')?.includes('text/html') &&
    !fileExtensionRegexp.test(request.url),
  createHandlerBoundToURL('/index.html')
);

// Cache imágenes
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
);

// Cache API
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 5 * 60 })],
  })
);

// ============================
// Push Notifications
// ============================
self.addEventListener('push', (event) => {
  log('📱 Push received:', event);

  if (!event.data) {
    event.waitUntil(
      self.registration.showNotification('Nueva notificación', {
        body: 'Tienes una nueva notificación',
        icon: '/assets/icons/icon-192x192.png',
        tag: 'default',
      })
    );
    return;
  }

  let data: any;
  try {
    data = event.data.json();
  } catch {
    data = { title: 'Nueva notificación', body: event.data.text() };
  }

  const options: NotificationOptions = {
    body: data.body || data.description || 'Notificación disponible',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/icon-72x72.png',
    tag: data.tag || data.notificationId || `notif-${Date.now()}`,
    data: {
      ...data.data,
      notificationId: data.notificationId,
      link: data.link,
      url: data.link || '/notifications',
    },
    renotify: true,
    // Safari iOS fix → quitar opciones que no soporta
    vibrate: [200, 100, 200],
    dir: 'auto',
    lang: 'es',
  };

  event.waitUntil(self.registration.showNotification(data.title || 'Notificación', options));
});

// ============================
// Notification Click
// ============================
self.addEventListener('notificationclick', (event) => {
  log('Clicked:', event);
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = data.link || data.url || '/';

  const handleClick = async () => {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });

    if (clientList.length > 0) {
      // Enfocar y notificar a todas las ventanas abiertas
      clientList.forEach((client) => {
        client.focus();
        client.postMessage({ type: 'NOTIFICATION_CLICK', data: { ...data, targetUrl } });
      });
    } else {
      // Abrir nueva ventana
      const fullUrl = targetUrl.startsWith('http') ? targetUrl : self.location.origin + targetUrl;
      await clients.openWindow(fullUrl);
    }
  };

  event.waitUntil(handleClick());
});

// ============================
// Lifecycle
// ============================
self.addEventListener('install', (event) => {
  log('Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  log('Activating...');
  event.waitUntil(self.clients.claim());
});

// ============================
// Mensajes desde app
// ============================
self.addEventListener('message', (event) => {
  log('Message:', event.data);

  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'GET_VERSION') {
    event.ports[0].postMessage({ type: 'VERSION', version: APP_VERSION });
  }
});

// ============================
// Errores
// ============================
self.addEventListener('error', (event) => log('Error:', event.error));
self.addEventListener('unhandledrejection', (event) => log('Rejection:', event.reason));

log('SW ready (v' + APP_VERSION + ')');
*/
