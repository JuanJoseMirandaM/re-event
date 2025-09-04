import {ApplicationConfig, isDevMode, provideEnvironmentInitializer, provideZoneChangeDetection} from '@angular/core';
import {provideRouter} from '@angular/router';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideServiceWorker} from '@angular/service-worker';
import {initializeApp, provideFirebaseApp} from "@angular/fire/app";
import {getMessaging, provideMessaging} from "@angular/fire/messaging";
import {routes} from './app.routes';
import {configureAmplify} from "./core/config/amplify-config";
import {authInterceptor} from './core/interceptors/auth.interceptor';
import {environment} from "../environments/environment";
import {provideTranslateService} from '@ngx-translate/core';
import {provideTranslateHttpLoader} from '@ngx-translate/http-loader';
import {provideState, provideStore} from '@ngrx/store';
import {provideEffects} from '@ngrx/effects';
import {userReducer} from './core/store/reducers/user.reducer';
import {eventsReducer} from './core/store/reducers/events.reducer';
import {provideStoreDevtools} from '@ngrx/store-devtools';
import {UserEffects} from './core/store/effects/user.effect';
import {EventsEffects} from './core/store/effects/events.effect';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    }),
    provideEnvironmentInitializer(() => () => configureAmplify()),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideMessaging(() => getMessaging()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: 'en'
    }),
    provideStore(),
    provideEffects(UserEffects, EventsEffects),
    provideState({name: 'user', reducer: userReducer}),
    provideState({name: 'events', reducer: eventsReducer}),
    provideStoreDevtools({maxAge: 25, logOnly: !isDevMode()})
  ]
};
