// Importa las librerías compat de Firebase
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js');

// Inicializa Firebase
firebase.initializeApp({
    apiKey: "AIzaSyAPgmfnx8zGQuShmjmA-QO_ulwueVZR42k",
    authDomain: "reevent-fcm.firebaseapp.com",
    projectId: "reevent-fcm",
    storageBucket: "reevent-fcm.firebasestorage.app",
    messagingSenderId: "145026622801",
    appId: "1:145026622801:web:c82d01ccbdc175619e9f70",
    measurementId: "G-DN6DXETYRM"
});

// Instancia de Messaging
const messaging = firebase.messaging();

// Maneja mensajes en background
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message', payload);

    const notificationTitle = payload.notification?.title || 'Nueva Notificación';
    const notificationOptions = {
        body: payload.notification?.body || 'Tienes una nueva notificacion',
        icon: '/assets/icons/icon-192x192.png',
        data: payload.data,
        actions: [
            { action: 'open', title: 'Abrir'}
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Manejar click en notificación
self.addEventListener('notificationclick', function(event) {
    console.log('[firebase-messaging-sw.js] Clicked notification:', event);

    event.notification.close();

    const actionData = event.notification.data;

    if (actionData?.actionType === 'link') {
        event.waitUntil(clients.openWindow(actionData.actionValue));
    } else if (actionData?.actionType === 'screen') {
        event.waitUntil(clients.openWindow('/' + actionData.actionValue));
    } else {
        event.waitUntil(clients.openWindow('/')); // fallback
    }
});
