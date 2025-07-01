# Configuración Angular - re:Event

## 🚀 Setup Inicial

### Crear Proyecto Angular con PWA
```bash
# Instalar Angular CLI
npm install -g @angular/cli

# Crear proyecto
ng new re-event-frontend --routing --style=scss --package-manager=npm

# Navegar al proyecto
cd re-event-frontend

# Agregar PWA
ng add @angular/pwa

# Agregar Angular Material
ng add @angular/material

# Agregar NgRx
ng add @ngrx/store
ng add @ngrx/effects
ng add @ngrx/store-devtools
```

## 📦 Dependencias Principales

### package.json
```json
{
  "dependencies": {
    "@angular/animations": "^17.0.0",
    "@angular/cdk": "^17.0.0",
    "@angular/common": "^17.0.0",
    "@angular/compiler": "^17.0.0",
    "@angular/core": "^17.0.0",
    "@angular/forms": "^17.0.0",
    "@angular/material": "^17.0.0",
    "@angular/platform-browser": "^17.0.0",
    "@angular/platform-browser-dynamic": "^17.0.0",
    "@angular/router": "^17.0.0",
    "@angular/service-worker": "^17.0.0",
    "@ngrx/effects": "^17.0.0",
    "@ngrx/store": "^17.0.0",
    "@ngrx/store-devtools": "^17.0.0",
    "@zxing/ngx-scanner": "^17.0.0",
    "aws-amplify": "^6.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.14.0"
  }
}
```

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── core/                    # Servicios singleton
│   │   ├── auth/
│   │   ├── api/
│   │   └── guards/
│   ├── shared/                  # Componentes compartidos
│   │   ├── components/
│   │   ├── pipes/
│   │   └── directives/
│   ├── features/                # Módulos de funcionalidades
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── sessions/
│   │   ├── points/
│   │   ├── evaluations/
│   │   └── photos/
│   ├── store/                   # NgRx Store
│   │   ├── auth/
│   │   ├── sessions/
│   │   ├── points/
│   │   └── app.state.ts
│   └── app.component.ts
├── assets/
│   ├── icons/
│   ├── images/
│   └── i18n/
└── environments/
```

## ⚙️ Configuración PWA

### ngsw-config.json
```json
{
  "$schema": "./node_modules/@angular/service-worker/config/schema.json",
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.webmanifest",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": [
        "https://api.reevent.awscommunity.com/sessions",
        "https://api.reevent.awscommunity.com/users/profile",
        "https://api.reevent.awscommunity.com/users/points"
      ],
      "cacheConfig": {
        "strategy": "freshness",
        "maxSize": 100,
        "maxAge": "1h",
        "timeout": "10s"
      }
    },
    {
      "name": "api-performance",
      "urls": [
        "https://api.reevent.awscommunity.com/photos",
        "https://api.reevent.awscommunity.com/evaluations"
      ],
      "cacheConfig": {
        "strategy": "performance",
        "maxSize": 50,
        "maxAge": "30m"
      }
    }
  ],
  "navigationUrls": [
    "/**",
    "!/**/*.*",
    "!/**/*__*",
    "!/**/*__*/**"
  ]
}
```

## 🔐 Configuración de Autenticación

### auth.service.ts
```typescript
import { Injectable } from '@angular/core';
import { Amplify, Auth } from 'aws-amplify';
import { Observable, from, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    Amplify.configure({
      Auth: {
        region: 'us-east-1',
        userPoolId: 'us-east-1_XXXXXXXXX',
        userPoolWebClientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX',
        oauth: {
          domain: 'reevent.auth.us-east-1.amazoncognito.com',
          scope: ['email', 'openid', 'profile'],
          redirectSignIn: 'https://reevent.awscommunity.com/callback',
          redirectSignOut: 'https://reevent.awscommunity.com/logout',
          responseType: 'code'
        }
      }
    });
  }

  signUp(email: string, password: string, attributes: any): Observable<any> {
    return from(Auth.signUp({
      username: email,
      password,
      attributes
    }));
  }

  signIn(email: string, password: string): Observable<any> {
    return from(Auth.signIn(email, password));
  }

  signOut(): Observable<any> {
    return from(Auth.signOut());
  }

  getCurrentUser(): Observable<any> {
    return from(Auth.currentAuthenticatedUser());
  }
}
```

## 🗄️ NgRx Store Configuration

### app.state.ts
```typescript
import { AuthState } from './auth/auth.state';
import { SessionsState } from './sessions/sessions.state';
import { PointsState } from './points/points.state';

export interface AppState {
  auth: AuthState;
  sessions: SessionsState;
  points: PointsState;
}
```

### auth.state.ts
```typescript
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  token: null
};
```

## 📱 Angular Material Configuration

### material.module.ts
```typescript
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

const MaterialModules = [
  MatButtonModule,
  MatCardModule,
  MatFormFieldModule,
  MatInputModule,
  MatToolbarModule,
  MatIconModule,
  MatSidenavModule,
  MatListModule,
  MatTabsModule,
  MatChipsModule,
  MatBadgeModule,
  MatProgressSpinnerModule,
  MatSnackBarModule,
  MatDialogModule,
  MatBottomSheetModule
];

@NgModule({
  imports: MaterialModules,
  exports: MaterialModules
})
export class MaterialModule { }
```

## 📷 QR Scanner Configuration

### qr-scanner.component.ts
```typescript
import { Component, EventEmitter, Output } from '@angular/core';
import { BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-qr-scanner',
  template: `
    <zxing-scanner
      #scanner
      [enable]="scannerEnabled"
      [formats]="allowedFormats"
      (scanSuccess)="onScanSuccess($event)"
      (scanError)="onScanError($event)">
    </zxing-scanner>
  `
})
export class QrScannerComponent {
  @Output() scanResult = new EventEmitter<string>();
  
  scannerEnabled = true;
  allowedFormats = [BarcodeFormat.QR_CODE];

  onScanSuccess(result: string) {
    this.scanResult.emit(result);
  }

  onScanError(error: any) {
    console.error('QR Scan Error:', error);
  }
}
```

## 🔔 Push Notifications

### notification.service.ts
```typescript
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private swPush: SwPush) {}

  subscribeToNotifications() {
    if (this.swPush.isEnabled) {
      this.swPush.requestSubscription({
        serverPublicKey: 'YOUR_VAPID_PUBLIC_KEY'
      }).then(sub => {
        // Enviar subscription al backend
        console.log('Push subscription:', sub);
      }).catch(err => {
        console.error('Could not subscribe to notifications', err);
      });
    }
  }

  listenForNotifications() {
    if (this.swPush.isEnabled) {
      this.swPush.messages.subscribe(message => {
        console.log('Received push message:', message);
        this.showNotification(message);
      });
    }
  }

  private showNotification(message: any) {
    // Mostrar notificación usando Angular Material Snackbar
  }
}
```

## 🚀 Scripts de Build

### angular.json (extracto)
```json
{
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
      "outputPath": "dist/re-event-frontend",
      "index": "src/index.html",
      "main": "src/main.ts",
      "polyfills": "src/polyfills.ts",
      "tsConfig": "tsconfig.app.json",
      "assets": [
        "src/favicon.ico",
        "src/assets",
        "src/manifest.webmanifest"
      ],
      "styles": [
        "./node_modules/@angular/material/prebuilt-themes/indigo-pink.css",
        "src/styles.scss"
      ],
      "scripts": [],
      "serviceWorker": true,
      "ngswConfigPath": "ngsw-config.json"
    }
  }
}
```

## 📋 Comandos Útiles

```bash
# Desarrollo
ng serve --open

# Build producción
ng build --configuration=production

# Analizar bundle
ng build --stats-json
npx webpack-bundle-analyzer dist/re-event-frontend/stats.json

# Testing
ng test
ng e2e

# Linting
ng lint

# Generar componentes
ng generate component features/dashboard
ng generate service core/api/sessions
ng generate guard core/guards/auth
```