import {inject, Injectable} from "@angular/core";
import {getToken, Messaging} from "@angular/fire/messaging";
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {Observable, switchMap, map, catchError, of} from "rxjs";
import {ApiResponse, Evaluation} from "./evaluation.service";

export interface FcmToken {
  deviceId: string;
  token: string;
  platform: string;
  topics: string[];
}

export interface FcmTokenResponse {
  userId: string;
  deviceId: string;
  fcm_token: string;
  platform: string;
  topics: string[];
}

@Injectable({
  providedIn: "root",
})
export class FcmService {

  #messaging = inject(Messaging);
  #http = inject(HttpClient);
  #authService = inject(AuthService);

  private readonly baseUrl = '/api';

  async installFCMServiceWorker(): Promise<void> {
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

  private async registerSw(): Promise<ServiceWorkerRegistration | null> {
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

  private async requestNotificationPermission(registration: ServiceWorkerRegistration): Promise<void> {
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

  private async getFcmToken(registration: ServiceWorkerRegistration): Promise<void> {
    console.log("Solicitando token de notificacion.");
    try {
      const token = await getToken(this.#messaging, {
        vapidKey: environment.vapidKey,
        serviceWorkerRegistration: registration
      });
      if(!!token) {
        console.log('FCM Token obtenido:', token);
        await this.saveNotificationToken(token);
      } else {
        console.warn('No se pudo obtener el token')
      }
    } catch (error) {
      console.error('Error getting token', error);
    }
  }

  private generateDeviceId(): string {
    // Try to get existing device ID from localStorage
    let deviceId = localStorage.getItem('deviceId');

    if (!deviceId) {
      // Generate a new device ID if none exists
      deviceId = 'web_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('deviceId', deviceId);
    }

    return deviceId;
  }

  private async saveNotificationToken(token: string): Promise<void> {
    // Save to localStorage as backup
    localStorage.setItem('pushToken', token);

    try {
      // Generate device ID
      const deviceId = this.generateDeviceId();

      // Send token to backend using the service method
      this.registerFcmToken({
        deviceId: deviceId,
        token: token,
        platform: 'web',
        topics: ['all']
      }).subscribe({
        next: (response) => {
          console.log('FCM token registrado en el backend:', response);
        },
        error: (error) => {
          console.error('Error al registrar FCM token en el backend:', error);
          // Token still saved in localStorage as backup
        }
      });

    } catch (error) {
      console.error('Error al procesar el token FCM:', error);
      // Token still saved in localStorage as backup
    }
  }

  private registerFcmToken(tokenData: FcmToken): Observable<FcmTokenResponse> {
    return this.#authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/fcm-tokens/register`;
        return this.#http.post<ApiResponse<FcmTokenResponse>>(url, tokenData, { headers }).pipe(
          map(response => response.data!)
        );
      })
    );
  }
}
