import {Injectable} from '@angular/core';

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

}
