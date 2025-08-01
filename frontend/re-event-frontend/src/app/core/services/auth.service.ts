import {Injectable} from '@angular/core';
import {catchError, filter, from, map, Observable, of, throwError} from 'rxjs';
import {
  signIn,
  signOut,
  signUp,
  confirmSignUp,
  getCurrentUser,
  fetchUserAttributes,
  fetchAuthSession,
  type SignInOutput,
  type SignUpOutput,
  type ConfirmSignUpOutput,
  type AuthUser,
  type AuthSession,
} from 'aws-amplify/auth';

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

  signIn(email: string, password: string): Observable<SignInOutput> {
    return from(signIn({ username: email, password })).pipe(
      catchError(error => throwError(() => error))
    );
  }

  signOut(): Observable<void> {
    return from(signOut()).pipe(
      catchError(error => throwError(() => error))
    );
  }

  signUp(email: string, password: string, fullName: string): Observable<SignUpOutput> {
    return from(signUp({
      username: email,
      password,
      options: {
        userAttributes: {
          email,
          name: fullName
        }
      }
    })).pipe(
      catchError(error => throwError(() => error))
    );
  }

  confirmSignUp(email: string, code: string): Observable<ConfirmSignUpOutput> {
    return from(confirmSignUp({ username: email, confirmationCode: code })).pipe(
      catchError(error => throwError(() => error))
    );
  }

  getCurrentUser(): Observable<AuthUser | null> {
    return from(getCurrentUser()).pipe(
      catchError(() => of(null))
    );
  }

  getUserAttributes(): Observable<Partial<Record<string, string>>> {
    return from(fetchUserAttributes()).pipe(
      catchError(() => of({}))
    );
  }

  isAuthenticated(): Observable<boolean> {
    return from(fetchAuthSession()).pipe(
      map((session: AuthSession) => !!session.tokens?.idToken),
      catchError(() => of(false))
    );
  }

  getAuthToken(): Observable<string> {
    return from(fetchAuthSession()).pipe(
      map((session: AuthSession) => session.tokens?.idToken?.toString() ?? ''),
      catchError(() => of(''))
    );
  }
}
