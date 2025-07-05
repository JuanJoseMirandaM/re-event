import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  email: string;
  name: string;
  company: string;
  phone: string;
  role: 'ATTENDEE' | 'SPEAKER' | 'SPONSOR' | 'VOLUNTEER' | 'ORGANIZER';
  verified: boolean;
  points: number;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
  error?: {
    code: string;
    message: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('current_user');
    
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(userData: {
    email: string;
    password: string;
    name: string;
    company: string;
    phone: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, userData);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setAuth(response.data.accessToken, response.data.user);
        }
      })
    );
  }

  verifyCode(code: string): Observable<any> {
    const userEmail = this.currentUserSubject.value?.email;
    return this.http.post(`${environment.apiUrl}/auth/verify-code`, {
      code,
      userEmail
    }).pipe(
      tap(response => {
        if (response.success) {
          const currentUser = this.currentUserSubject.value;
          if (currentUser) {
            const updatedUser = {
              ...currentUser,
              verified: true,
              role: response.data.role
            };
            this.currentUserSubject.next(updatedUser);
            localStorage.setItem('current_user', JSON.stringify(updatedUser));
          }
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
  }

  private setAuth(token: string, user: User): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('current_user', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
  }

  isAuthenticated(): boolean {
    return !!this.tokenSubject.value;
  }

  isVerified(): boolean {
    return this.currentUserSubject.value?.verified || false;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}