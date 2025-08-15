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

  async initializePushNotifications(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      await this.subscribeToPushNotifications(registration);
      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  private async subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<void> {
    try {
      // Obtener la suscripción existente o crear una nueva
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        // Crear nueva suscripción
        const vapidPublicKey = await this.getVapidPublicKey();
        if (vapidPublicKey) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as unknown as ArrayBuffer
          });
        }
      }

      if (subscription) {
        this.pushSubscription = subscription;
        await this.sendSubscriptionToBackend(subscription);
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
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
      if (!authState.user?.userId) return;

      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!)
        },
        userId: authState.user.userId,
        userRole: 'USER' // Por defecto, se puede personalizar según tu lógica
      };

      console.log('Sending subscription to backend:', subscriptionData);

    } catch (error) {
      console.error('Error sending subscription to backend:', error);
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
        console.log('Unsubscribed from push notifications');
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  }
}
