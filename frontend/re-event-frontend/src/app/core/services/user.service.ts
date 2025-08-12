import { Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

export enum UserRole {
  ALL = 'ALL',
  GUEST = 'GUEST',
  ATTENDEE = 'ATTENDEE',
  SPEAKER = 'SPEAKER',
  SPONSOR = 'SPONSOR',
  VOLUNTEER = 'VOLUNTEER',
  ORGANIZER = 'ORGANIZER',
}

export interface User {
  userId: string;
  email: string;
  name: string;
  company?: string;
  phoneNumber?: string;
  avatar?: string;
  role: UserRole;
  points: number;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse {
  success: boolean;
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = '/api';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getCurrentUser(): Observable<User> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        if (!userId) {
          throw new Error('User ID not found');
        }
        return this.getUser(userId);
      })
    );
  }

  getUser(userId: string): Observable<User> {
    return this.http.get<ApiResponse>(`${this.baseUrl}/users/${userId}`).pipe(
      map(response => response.data)
    );
  }

  updateCurrentUser(userData: Partial<User>): Observable<User> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        if (!userId) {
          throw new Error('User ID not found');
        }
        return this.updateUser(userId, userData);
      })
    );
  }

  updateUser(userId: string, userData: Partial<User>): Observable<User> {
    return this.http.put<ApiResponse>(`${this.baseUrl}/users/${userId}`, userData).pipe(
      map(response => response.data)
    );
  }
}
