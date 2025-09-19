// Importa las librerías compat de Firebase
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js');

// Inicializa Firebase
firebase.initializeApp({
    apiKey: "AIzaSyA5e4Qf0nUW-ALm40oAUrNImuyrZkBXMVY",
    authDomain: "kinua-fcm.firebaseapp.com",
    projectId: "kinua-fcm",
    storageBucket: "kinua-fcm.firebasestorage.app",
    messagingSenderId: "62396424616",
    appId: "1:62396424616:web:145f9df7cf9270105ebd9d",
    measurementId: "G-YFNCEBPK0H"
});

// Instancia de Messaging
const messaging = firebase.messaging();

// Maneja mensajes en background
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'Nueva Notificación';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes una nueva notificacion',
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        data: payload.data,
        tag: payload.data?.notificationId || `fcm-${Date.now()}`, // Evitar duplicados
        renotify: true,
        vibrate: [200, 100, 200],
        actions: [
            { action: 'open', title: 'Abrir'}
        ]
    };

    // Verificar si ya existe una notificación con el mismo tag
    self.registration.getNotifications({ tag: notificationOptions.tag }).then(notifications => {
        if (notifications.length === 0) {
            self.registration.showNotification(notificationTitle, notificationOptions);
        } else {
            console.log('[firebase-messaging-sw.js] Notification already exists, skipping duplicate');
        }
    });
});

// Manejar click en notificación
self.addEventListener('notificationclick', function(event) {
    event.notification.close();

    const actionData = event.notification.data;
    let targetUrl = '/';

    // Determinar URL objetivo
    if (actionData?.actionType === 'link') {
        targetUrl = actionData.actionValue;
    } else if (actionData?.actionType === 'screen') {
        targetUrl = '/' + actionData.actionValue;
    } else if (actionData?.link) {
        targetUrl = actionData.link;
    } else if (actionData?.url) {
        targetUrl = actionData.url;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Si hay una ventana abierta, enfocarla y navegar
            if (clientList.length > 0) {
                const client = clientList[0];
                client.focus();
                client.postMessage({
                    type: 'NOTIFICATION_CLICK',
                    data: { ...actionData, targetUrl }
                });
            } else {
                // Abrir nueva ventana
                const fullUrl = targetUrl.startsWith('http') ? targetUrl : self.location.origin + targetUrl;
                return clients.openWindow(fullUrl);
            }
        })
    );
});
