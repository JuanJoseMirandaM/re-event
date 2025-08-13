import {Injectable, signal} from '@angular/core';
import {BehaviorSubject, catchError, from, map, Observable, of, switchMap, throwError} from 'rxjs';
import {
  type AuthSession,
  type AuthUser,
  confirmSignUp,
  fetchAuthSession,
  fetchAuthSession as fetchAuthSessionFromRedirect,
  getCurrentUser,
  getCurrentUser as getCurrentUserFromRedirect,
  signIn,
  type SignInOutput,
  signInWithRedirect,
  signOut,
  signUp,
  type SignUpOutput,
} from 'aws-amplify/auth';
import {environment} from '../../../environments/environment';

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
  #authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    session: null,
    loading: true,
    error: null
  });

  authState$ = this.#authStateSubject.asObservable();
  passwordRegister = signal<string>('');

  constructor() {
    this.initializeAuthState();
  }

  private async initializeAuthState(): Promise<void> {
    try {
      this.#authStateSubject.next({...this.#authStateSubject.value, loading: true});

      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      const isAuthenticated = !!session.tokens?.idToken;

      this.#authStateSubject.next({
        isAuthenticated,
        user,
        session,
        loading: false,
        error: null
      });
    } catch (error) {
      this.#authStateSubject.next({
        isAuthenticated: false,
        user: null,
        session: null,
        loading: false,
        error: null
      });
    }
  }

  signIn(email: string, password: string): Observable<SignInOutput> {
    return from(signIn({username: email, password})).pipe(
      map(result => {
        this.updateAuthState();
        return result;
      }),
      catchError(error => {
        this.#authStateSubject.next({...this.#authStateSubject.value, error: error.message});
        return throwError(() => error);
      })
    );
  }

  signInWithGoogle(): Observable<void> {
    return from(signInWithRedirect({provider: 'Google'})).pipe(
      catchError(error => {
        this.#authStateSubject.next({...this.#authStateSubject.value, error: error.message});
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
            this.#authStateSubject.next({
              isAuthenticated: true,
              user,
              session,
              loading: false,
              error: null
            });
            return {user, session};
          })
        );
      }),
      catchError(error => {
        this.#authStateSubject.next({...this.#authStateSubject.value, error: error.message});
        return throwError(() => error);
      })
    );
  }

  signOut(): Observable<void> {
    return from(fetchAuthSession()).pipe(
      switchMap(session => {
        const hasOAuthTokens = session.tokens?.accessToken?.payload?.['token_use'] === 'access';
        const isOAuthUser = session.tokens?.accessToken?.payload?.iss?.includes('cognito');

        if (hasOAuthTokens && isOAuthUser) {
          return this.signOutWithCallbackRedirect();
        } else {
          return this.signOutWithoutRedirect();
        }
      }),
      catchError(error => {
        console.error('Error detecting user type for logout:', error);
        return this.signOutWithoutRedirect();
      })
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

  confirmSignUp(email: string, code: string): Observable<SignInOutput> {
    return from(confirmSignUp({username: email, confirmationCode: code})).pipe(
      switchMap(() => this.signIn(email, this.passwordRegister())),
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

  getAuthState(): AuthState {
    return this.#authStateSubject.value;
  }

  clearError(): void {
    this.#authStateSubject.next({...this.#authStateSubject.value, error: null});
  }

  private signOutWithoutRedirect(): Observable<void> {
    return from(signOut({global: true})).pipe(
      map(() => {
        this.#authStateSubject.next({
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

  private signOutWithCallbackRedirect(): Observable<void> {
    return from(signOut({global: true})).pipe(
      map(() => {
        this.#authStateSubject.next({
          isAuthenticated: false,
          user: null,
          session: null,
          loading: false,
          error: null
        });

        const logoutUrl = `https://${environment.cognitoConfig.domain}/logout?client_id=${environment.cognitoConfig.userPoolClientId}&logout_uri=${encodeURIComponent(environment.cognitoConfig.redirectSignOut)}`;
        console.log('Cognito logout successful, redirecting to OAuth logout URL:', logoutUrl);
        window.location.href = logoutUrl;
      }),
      catchError(error => {
        console.error('Error during Cognito logout:', error);
        this.#authStateSubject.next({
          isAuthenticated: false,
          user: null,
          session: null,
          loading: false,
          error: null
        });

        const logoutUrl = `https://${environment.cognitoConfig.domain}/logout?client_id=${environment.cognitoConfig.userPoolClientId}&logout_uri=${encodeURIComponent(environment.cognitoConfig.redirectSignOut)}`;
        window.location.href = logoutUrl;

        return of(void 0);
      })
    );
  }

  private async updateAuthState(): Promise<void> {
    try {
      const user = await getCurrentUser();
      const session = await fetchAuthSession();
      this.#authStateSubject.next({
        isAuthenticated: !!session.tokens?.idToken,
        user,
        session,
        loading: false,
        error: null
      });
    } catch (error) {
      this.#authStateSubject.next({
        isAuthenticated: false,
        user: null,
        session: null,
        loading: false,
        error: null
      });
    }
  }
}
