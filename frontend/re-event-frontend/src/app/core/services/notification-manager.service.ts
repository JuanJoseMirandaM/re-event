import { Injectable, inject } from '@angular/core';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationManagerService {
  #notificationsService = inject(NotificationsService);
  #pushNotificationService = inject(PushNotificationService);
  #authService = inject(AuthService);

  private isInitialized = false;

  /**
   * Inicializa completamente el sistema de notificaciones después del login
   */
  async initializeAfterLogin(): Promise<boolean> {
    if (this.isInitialized) {
      console.log('✅ Notifications already initialized');
      return true;
    }

    try {
      console.log('🚀 Initializing notification system...');

      // Verificar que el usuario esté autenticado
      const authState = this.#authService.getAuthState();
      if (!authState.isAuthenticated) {
        console.log('⚠️ User not authenticated, skipping notification initialization');
        return false;
      }

      // 1. Solicitar permisos de notificación
      const permission = await this.#notificationsService.requestNotificationPermission();
      
      if (permission !== 'granted') {
        console.log('⚠️ Notification permission not granted, some features may not work');
        // Aún podemos continuar con las notificaciones en la app
      }

      // 2. Inicializar push notifications (para PWA)
      const pushInitialized = await this.#pushNotificationService.initializePushNotifications();
      
      if (pushInitialized) {
        console.log('✅ Push notifications initialized');
      } else {
        console.log('⚠️ Push notifications not available, using browser notifications only');
      }

      // 3. Conectar a las suscripciones de GraphQL
      await this.#notificationsService.connect();
      console.log('✅ Connected to notification subscriptions');

      // 4. Cargar notificaciones existentes
      await this.#notificationsService.loadNotifications();
      console.log('✅ Loaded existing notifications');

      this.isInitialized = true;
      console.log('🎉 Notification system fully initialized!');
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing notification system:', error);
      return false;
    }
  }

  /**
   * Limpia el sistema de notificaciones al hacer logout
   */
  async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up notification system...');

      // Desconectar suscripciones
      this.#notificationsService.disconnect();

      // Limpiar notificaciones locales
      this.#notificationsService.clearNotifications();

      // Reset push notifications
      this.#pushNotificationService.reset();

      this.isInitialized = false;
      console.log('✅ Notification system cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up notification system:', error);
    }
  }

  /**
   * Verifica si las notificaciones están disponibles
   */
  isNotificationSupported(): boolean {
    return 'Notification' in window;
  }

  /**
   * Verifica si las push notifications están disponibles
   */
  isPushNotificationSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Obtiene el estado actual de los permisos
   */
  getNotificationPermission(): NotificationPermission {
    if (!this.isNotificationSupported()) {
      return 'denied';
    }
    return Notification.permission;
  }

  /**
   * Muestra información sobre el soporte de notificaciones
   */
  getNotificationInfo() {
    return {
      browserSupport: this.isNotificationSupported(),
      pushSupport: this.isPushNotificationSupported(),
      permission: this.getNotificationPermission(),
      isInitialized: this.isInitialized,
      serviceWorkerReady: 'serviceWorker' in navigator ? navigator.serviceWorker.ready : null
    };
  }
}