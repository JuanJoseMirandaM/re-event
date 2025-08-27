import {inject, Injectable} from '@angular/core';
import {Router} from "@angular/router";
import {Messaging, onMessage} from "@angular/fire/messaging";

export interface Notification {
  notificationId: string;
  title: string;
  description?: string;
  createdAt: string;
  author: string;
  link?: string;
  targetRole: string;
  userId?: string;
  read: boolean;
}

export interface NotificationInput {
  title: string;
  description: string;
  author: string;
  targetRole: string;
  userId: string;
}

export interface CreateNotificationResponse {
  notificationId: string;
  title: string;
  description: string;
  createdAt: string;
  targetRole: string;
  userId: string;
  author: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  #router = inject(Router);
  #messaging = inject(Messaging);

  initForegroundListener() {
    // Escuchar notificaciones en primer plano
    onMessage(this.#messaging, (payload) => {
      console.log('Notificación recibida en foreground:', payload);

      if (payload.data) {
        this.handleAction(payload.data);
      }
    });
  }

  handleAction(data: any) {
    const actionType = data['actionType'];
    const actionValue = data['actionValue'];

    if (actionType === 'link') {
      console.log(`Link externo: ${actionValue}`);
      window.open(actionValue, '_blank');
    } else if (actionType === 'screen') {
      console.log(`Pantalla interna: ${actionValue}`);
      this.#router.navigate([actionValue]);
    } else {
      console.warn('Acción desconocida en notificación:', data);
    }
  }
}
