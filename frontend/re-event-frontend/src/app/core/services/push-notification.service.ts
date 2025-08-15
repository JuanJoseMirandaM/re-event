import { Injectable, inject } from '@angular/core';
import { generateClient } from 'aws-amplify/api';
import { AuthService } from './auth.service';
import { pushConfig } from '../config/push-config';

const client = generateClient();

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  #authService = inject(AuthService);

  private pushSubscription: PushSubscription | null = null;
  private isInitialized = false;

  async initializePushNotifications(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('Push notifications already initialized');
      return true;
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('❌ Push notifications not supported in this browser');
      return false;
    }

    try {
      // Verificar que el usuario esté autenticado
      const authState = this.#authService.getAuthState();
      if (!authState.isAuthenticated || !authState.user?.userId) {
        console.log('⚠️ User not authenticated, skipping push notification setup');
        return false;
      }

      // Esperar a que el service worker esté listo
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service Worker ready');

      // Configurar push notifications
      await this.subscribeToPushNotifications(registration);
      
      this.isInitialized = true;
      console.log('✅ Push notifications initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
      return false;
    }
  }

  private async subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      // Verificar si ya existe una suscripción
      let subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        console.log('✅ Existing push subscription found');
        this.pushSubscription = subscription;
        await this.sendSubscriptionToBackend(subscription);
        return;
      }

      // Crear nueva suscripción
      const vapidPublicKey = await this.getVapidPublicKey();
      if (!vapidPublicKey) {
        console.error('❌ VAPID public key not available');
        return;
      }

      console.log('🔄 Creating new push subscription...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      if (subscription) {
        this.pushSubscription = subscription;
        await this.sendSubscriptionToBackend(subscription);
        console.log('✅ Push subscription created and sent to backend');
      }
    } catch (error) {
      console.error('❌ Error subscribing to push notifications:', error);
      // Si falla la suscripción push, no es crítico para la app
      // Las notificaciones del navegador seguirán funcionando
    }
  }

  private async getVapidPublicKey(): Promise<string | null> {
    try {
      return pushConfig.vapidPublicKey;
    } catch (error) {
      console.error('Error getting VAPID public key:', error);
      return null;
    }
  }

  private async sendSubscriptionToBackend(subscription: PushSubscription): Promise<void> {
    try {
      const authState = this.#authService.getAuthState();
      if (!authState.user?.userId) {
        console.error('❌ No user ID available for subscription');
        return;
      }

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        },
        userId: authState.user.userId,
        userRole: 'USER' // Por defecto, se puede personalizar según tu lógica
      };

      console.log('📤 Sending subscription to backend:', {
        endpoint: subscriptionData.endpoint.substring(0, 50) + '...',
        userId: subscriptionData.userId,
        userRole: subscriptionData.userRole
      });

      // TODO: Implementar la llamada al backend para guardar la suscripción
      // Ejemplo de GraphQL mutation que podrías usar:
      /*
      const mutation = `
        mutation SavePushSubscription($input: PushSubscriptionInput!) {
          savePushSubscription(input: $input) {
            success
            message
          }
        }
      `;

      const result = await client.graphql({
        query: mutation,
        variables: { input: subscriptionData }
      });
      */

      console.log('✅ Subscription data prepared (backend integration pending)');

    } catch (error) {
      console.error('❌ Error sending subscription to backend:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  async unsubscribe(): Promise<void> {
    if (this.pushSubscription) {
      try {
        await this.pushSubscription.unsubscribe();
        this.pushSubscription = null;
        this.isInitialized = false;
        console.log('✅ Unsubscribed from push notifications');
      } catch (error) {
        console.error('❌ Error unsubscribing:', error);
      }
    }
  }

  reset(): void {
    this.pushSubscription = null;
    this.isInitialized = false;
    console.log('🔄 Push notification service reset');
  }
}
