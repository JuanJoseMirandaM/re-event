import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, switchMap, map, catchError, of } from 'rxjs';
import { ApiResponse } from './evaluation.service';
import {Router} from "@angular/router";
import {Messaging, onMessage} from "@angular/fire/messaging";
import {environment} from "../../../environments/environment";

export interface NotificationRequest {
  title: string;
  body: string;
  image?: string;
  actionType?: 'link' | 'screen';
  actionValue?: string;
  type: 'evento' | 'anuncio' | 'recompensa';
  audience: 'all' | 'segment' | 'user';
  userId?: string; // para audience = "user"
  segmentId?: string; // para audience = "segment"
}

export interface NotificationResponse {
  notificationId: string;
  title: string;
  body: string;
  image?: string;
  actionType?: 'link' | 'screen';
  actionValue?: string;
  type: 'evento' | 'anuncio' | 'recompensa';
  audience: 'all' | 'segment' | 'user';
  targetUserId?: string;
  segmentId?: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive' | 'scheduled';
}

export interface NotificationsResponse {
  items: NotificationResponse[];
  lastKey: string | null;
  count: number;
  totalCount: number;
}

export interface NotificationsParams {
  limit?: number;
  lastKey?: string;
  type?: 'evento' | 'anuncio' | 'recompensa';
  audience?: 'all' | 'segment' | 'user';
  userId?: string; // para audience = "user"
  segmentId?: string; // para audience = "segment"
  status?: 'active' | 'inactive' | 'scheduled';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  #authService = inject(AuthService);
  #http = inject(HttpClient);
  #router = inject(Router);
  #messaging = inject(Messaging);

  private readonly baseUrl = `${environment.apiUrl}`;

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

  getNotifications(params?: NotificationsParams): Observable<NotificationsResponse> {
    return this.#authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        // Construir query parameters
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.set('limit', params.limit.toString());
        if (params?.lastKey) queryParams.set('lastKey', params.lastKey);
        if (params?.type) queryParams.set('type', params.type);
        if (params?.audience) queryParams.set('audience', params.audience);
        if (params?.userId) queryParams.set('userId', params.userId);
        if (params?.segmentId) queryParams.set('segmentId', params.segmentId);
        if (params?.status) queryParams.set('status', params.status);

        const url = `${this.baseUrl}/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        
        return this.#http.get<ApiResponse<NotificationsResponse>>(url, { headers }).pipe(
          map(response => response.data!),
          catchError(error => {
            console.error('Error getting notifications:', error);
            return of({
              items: [],
              lastKey: null,
              count: 0,
              totalCount: 0
            });
          })
        );
      })
    );
  }

  createNotification(notificationData: NotificationRequest): Observable<NotificationResponse> {
    return this.#authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/notifications`;
        
        return this.#http.post<ApiResponse<NotificationResponse>>(url, notificationData, { headers }).pipe(
          map(response => response.data!),
          catchError(error => {
            console.error('Error creating notification:', error);
            throw error;
          })
        );
      })
    );
  }
}
