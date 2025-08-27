import {inject, Injectable} from "@angular/core";
import {getToken, Messaging} from "@angular/fire/messaging";
import {environment} from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class FcmService {

  #messaging = inject(Messaging);

  async installFCMServiceWorker() {
    const registrations: ReadonlyArray<ServiceWorkerRegistration> = await navigator.serviceWorker.getRegistrations();

    if(!registrations || registrations.length === 0) {
      console.log("No hay service worker registrado. Registrando nuevo SW");
      let swRegistered = await this.registerSw();
      if(swRegistered !== null) {
        await navigator.serviceWorker.ready;
        this.requestNotificationPermission(swRegistered);
      }
    } else {
      let registration = registrations.find(
        (reg) => reg.active && reg.active.scriptURL.includes('firebase-messaging')
      );
      if(!!registration) {
        console.log("El service worker ya esta registrado");
        await navigator.serviceWorker.ready;
        this.requestNotificationPermission(registration);
      } else {
        console.log("El service worker no esta registrado. Procediendo a registrarlo");
        let swRegistered = await this.registerSw();
        if(swRegistered !== null) {
          await navigator.serviceWorker.ready;
          this.requestNotificationPermission(swRegistered);
        }
      }
    }
  }

  async registerSw(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        if(!!registration) {
          console.log('Registro de service worker exitoso');
          return registration;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Error al registrar el Service Worker', error);
        return null;
      }
    } else {
      console.warn('El navegador no soporta Service Workers')
      return null;
    }
  }

  async requestNotificationPermission(registration: ServiceWorkerRegistration) {
    console.log("Verificado permisos para notificaciones.");
    const permission = await Notification.permission;

    if(permission === 'granted') {
      console.log("Permiso previamente autorizado. Obteniendo token.");
      this.getFcmToken(registration);
    } else if(permission === 'default') {
      console.log("Solicitando permiso para notificaciones.");
      const result = await Notification.requestPermission();
      if(result === 'granted') {
        console.log("Permiso concedido. Obteniendo token.");
        this.getFcmToken(registration);
      } else {
        console.warn('Permiso denegado por el usuario')
      }
    }
  }

  async getFcmToken(registration: ServiceWorkerRegistration) {
    console.log("Solicitando token de notificacion.");
    try {
      const token = await getToken(this.#messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration
      });
      if(!!token) {
        console.log('FCM Token obtenido:', token);
        this.saveNotificationToken(token);
      } else {
        console.warn('No se pudo obtener el token')
      }
    } catch (error) {
      console.error('Error getting token', error);
    }
  }

  saveNotificationToken(token: string) {
    localStorage.setItem('pushToken', token);
  }
}
