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
// Push Notifications - DISABLED
// ============================
// Las notificaciones push son manejadas por firebase-messaging-sw.js
// para evitar duplicados. Este service worker solo maneja el cache.
self.addEventListener('push', (event) => {
  log('📱 Push received by Angular SW (ignored - handled by Firebase SW)');
  // No hacer nada - Firebase SW se encarga de las notificaciones
});

// ============================
// Notification Click - DISABLED
// ============================
// Los clicks en notificaciones son manejados por firebase-messaging-sw.js
// para evitar conflictos. Este service worker solo maneja el cache.
self.addEventListener('notificationclick', (event) => {
  log('Notification clicked in Angular SW (ignored - handled by Firebase SW)');
  // No hacer nada - Firebase SW se encarga de los clicks
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
