import {Injectable} from '@angular/core';
import {map, Observable, shareReplay, switchMap} from 'rxjs';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {AuthService} from './auth.service';
import {environment} from "../../../environments/environment";

export enum UserRole {
  ALL = 'ALL',
  GUEST = 'GUEST',
  ATTENDEE = 'ATTENDEE',
  SPEAKER = 'SPEAKER',
  SPONSOR = 'SPONSOR',
  VOLUNTEER = 'VOLUNTEER',
  ORGANIZER = 'ORGANIZER'
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface VerifyCodeRequest {
  verificationCode: string;
  userId: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  message: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
  }

  /*TODO: check the method to avoid multiple calls to the backend*/
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
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        });

        const url = `${this.baseUrl}/users/${userId}`;
        return this.http.get<ApiResponse<User>>(url, { headers }).pipe(
          map(response => response.data),
          shareReplay(1)
        );
      })
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
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`, userData).pipe(
      map(response => response.data)
    );
  }

  isAdmin(): Observable<boolean> {
    return this.getCurrentUser().pipe(
      map(user => {
        const adminUserIds = [
          '75624637-0cbc-4af0-9b18-a363569ffaf8', // jhonrocker2012@gmail.com
          '524a0c87-6bcb-4d5e-902f-d1c92744427d'  // jjsmm97@gmail.com
        ];
        return adminUserIds.includes(user.userId);
      })
    );
  }

  verifyCode(verificationCode: string): Observable<VerifyCodeResponse> {
    return this.authService.getCurrentUserId().pipe(
      switchMap(userId => {
        const requestBody: VerifyCodeRequest = {verificationCode, userId};
        return this.http.post<VerifyCodeResponse>(
          `${this.baseUrl}/users/verify-code`,
          requestBody
        );
      })
    );
  }
}
