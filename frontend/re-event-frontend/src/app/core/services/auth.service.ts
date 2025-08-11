import { Injectable } from '@angular/core';
import { catchError, from, map, Observable, of, throwError, BehaviorSubject, switchMap } from 'rxjs';
import {
  type AuthSession,
  type AuthUser,
  confirmSignUp,
  type ConfirmSignUpOutput,
  fetchAuthSession,
  fetchUserAttributes,
  getCurrentUser,
  signIn,
  type SignInOutput,
  signOut,
  signUp,
  type SignUpOutput,
  signInWithRedirect,
  getCurrentUser as getCurrentUserFromRedirect,
  fetchAuthSession as fetchAuthSessionFromRedirect,
} from 'aws-amplify/auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
    loading: true,
    error: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.initializeAuthState();
  }

  private async initializeAuthState(): Promise<void> {
    try {
      this.authStateSubject.next({ ...this.authStateSubject.value, loading: true });
      
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const isAuthenticated = !!session.tokens?.idToken;
      
      this.authStateSubject.next({
        isAuthenticated,
        user,
        session,
        loading: false,
        error: null
      });
    } catch (error) {
      this.authStateSubject.next({
        isAuthenticated: false,
        user: null,
        session: null,
        loading: false,
        error: null
      });
    }
  }

  signIn(email: string, password: string): Observable<SignInOutput> {
    return from(signIn({ username: email, password })).pipe(
      map(result => {
        this.updateAuthState();
        return result;
      }),
      catchError(error => {
        this.authStateSubject.next({ ...this.authStateSubject.value, error: error.message });
        return throwError(() => error);
      })
    );
  }

  signInWithGoogle(): Observable<void> {
    return from(signInWithRedirect({ provider: 'Google' })).pipe(
      catchError(error => {
        this.authStateSubject.next({ ...this.authStateSubject.value, error: error.message });
        return throwError(() => error);
      })
    );
  }

  handleAuthRedirect(): Observable<{ user: AuthUser; session: AuthSession }> {
    return from(getCurrentUserFromRedirect()).pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('No se pudo obtener el usuario después de la redirección');
        }
        
        return from(fetchAuthSessionFromRedirect()).pipe(
          map(session => {
            this.authStateSubject.next({
              isAuthenticated: true,
              user,
              session,
              loading: false,
              error: null
            });
            return { user, session };
          })
        );
      }),
      catchError(error => {
        this.authStateSubject.next({ ...this.authStateSubject.value, error: error.message });
        return throwError(() => error);
      })
    );
  }

  signOut(): Observable<void> {
    return from(signOut()).pipe(
      map(() => {
        this.authStateSubject.next({
          isAuthenticated: false,
          user: null,
          session: null,
          loading: false,
          error: null
        });
      }),
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

  getCurrentUserId(): Observable<string> {
    return from(fetchAuthSession()).pipe(
      map(session => session.tokens?.accessToken?.payload?.sub?.toString() || ''),
      catchError(() => of(''))
    );
  }

  isAuthStateReady(): Observable<boolean> {
    return this.authState$.pipe(
      map(state => !state.loading)
    );
  }

  isAuthenticated(): Observable<boolean> {
    return this.authState$.pipe(
      map(state => state.isAuthenticated)
    );
  }

  getAuthToken(): Observable<string> {
    return this.authState$.pipe(
      map(state => state.session?.tokens?.idToken?.toString() ?? '')
    );
  }

  clearError(): void {
    this.authStateSubject.next({ ...this.authStateSubject.value, error: null });
  }

  getAuthState(): AuthState {
    return this.authStateSubject.value;
  }

  private async updateAuthState(): Promise<void> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      
      this.authStateSubject.next({
        isAuthenticated: !!session.tokens?.idToken,
        user,
        session,
        loading: false,
        error: null
      });
    } catch (error) {
      this.authStateSubject.next({
        isAuthenticated: false,
        user: null,
        session: null,
        loading: false,
        error: null
      });
    }
  }
}
