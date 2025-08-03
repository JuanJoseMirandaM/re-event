import {Injectable} from '@angular/core';
import {catchError, from, map, Observable, of, throwError} from 'rxjs';
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
} from 'aws-amplify/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  signIn(email: string, password: string): Observable<SignInOutput> {
    return from(signIn({username: email, password})).pipe(
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
    return from(confirmSignUp({username: email, confirmationCode: code})).pipe(
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
