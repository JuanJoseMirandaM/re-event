# re:Event Frontend

Aplicación web progresiva (PWA) para el AWS Community Day 2025, construida con Angular 19 y tecnologías modernas.

## 🚀 Características

- **Angular 19**: Framework moderno con standalone components
- **PWA**: Aplicación web progresiva instalable
- **NgRx**: Gestión de estado reactiva
- **i18n**: Soporte multiidioma (ES/EN)
- **Firebase**: Notificaciones push y servicios
- **AWS Amplify**: Integración con servicios AWS
- **Responsive**: Diseño adaptable a todos los dispositivos

## 🛠️ Tecnologías

- **Angular 19.1.0** - Framework principal
- **NgRx 19.2.1** - Gestión de estado
- **Angular Fire 19.2.0** - Integración Firebase
- **AWS Amplify 6.15.4** - Servicios AWS
- **Angular Service Worker** - PWA capabilities
- **Angular CDK** - Componentes avanzados
- **RxJS 7.8.0** - Programación reactiva

## 🚀 Desarrollo

### Prerrequisitos

- Node.js >= 18
- npm >= 9
- Angular CLI 19.1.2

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd frontend/re-event-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:4200/`

### Scripts Disponibles

```bash
# Desarrollo
npm start              # Servidor de desarrollo
npm run sv-local       # Servidor accesible desde red local

# Construcción
npm run build          # Build de producción
npm run build:dev      # Build de desarrollo
npm run build:prod     # Build de producción (alias)

# Testing
npm test               # Ejecutar tests unitarios
npm run watch          # Build en modo watch
```

## 🔧 Configuración

### Variables de Entorno

El proyecto usa dos archivos de configuración:

- `src/environments/environment.ts` - Desarrollo
- `src/environments/environment.prod.ts` - Producción

### Configuración de APIs

```typescript
// environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: '/api',  // Usa proxy local
  cognitoConfig: {
    // ... configuración de desarrollo
  }
};

// environment.prod.ts (producción)
export const environment = {
  production: true,
  apiUrl: 'https://67e15rhdb7.execute-api.us-east-1.amazonaws.com/dev',
  cognitoConfig: {
    // ... configuración de producción
  }
};
```

### Proxy de Desarrollo

El archivo `proxy.conf.json` configura el proxy para desarrollo local:

```json
{
  "/api/*": {
    "target": "https://67e15rhdb7.execute-api.us-east-1.amazonaws.com/dev",
    "secure": true,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

## 📱 PWA Features

### Service Worker

- **Caching**: Estrategia cache-first para assets estáticos
- **Offline**: Funcionalidad offline básica
- **Updates**: Notificaciones de actualizaciones

### Manifest

- **Instalable**: Se puede instalar en dispositivos móviles
- **Iconos**: Conjunto completo de iconos para diferentes tamaños
- **Tema**: Colores y configuración de tema

### Notificaciones Push

- **Firebase Cloud Messaging**: Integrado y configurado
- **Service Worker**: Manejo de notificaciones en background
- **Permisos**: Gestión de permisos de notificación

## 🌐 Internacionalización

### Idiomas Soportados

- **Español (ES)** - Idioma principal
- **Inglés (EN)** - Idioma secundario

### Archivos de Traducción

- `public/i18n/es.json` - Traducciones en español
- `public/i18n/en.json` - Traducciones en inglés

### Uso en Componentes

```typescript
import { TranslateService } from '@ngx-translate/core';

constructor(private translate: TranslateService) {
  // Cambiar idioma
  this.translate.use('es');
  
  // Obtener traducción
  this.translate.get('WELCOME_MESSAGE').subscribe(text => {
    console.log(text);
  });
}
```

## 🏗️ Arquitectura

### Estructura de Carpetas

```
src/
├── app/
│   ├── core/           # Servicios core, interceptors, guards
│   ├── shared/         # Componentes y servicios compartidos
│   ├── features/       # Módulos de funcionalidades
│   ├── layout/         # Componentes de layout
│   └── app.config.ts   # Configuración de la aplicación
├── environments/       # Variables de entorno
└── assets/            # Recursos estáticos
```

### Servicios Principales

- **AuthService**: Gestión de autenticación con AWS Cognito
- **EventsService**: Gestión de eventos
- **UserService**: Gestión de usuarios
- **PointsService**: Sistema de puntos
- **NotificationsService**: Notificaciones push
- **FcmService**: Firebase Cloud Messaging

### Estado con NgRx

```typescript
// Store structure
interface AppState {
  auth: AuthState;
  events: EventsState;
  user: UserState;
  points: PointsState;
  notifications: NotificationsState;
}
```

## 🔐 Autenticación

### AWS Cognito Integration

```typescript
// Configuración en app.config.ts
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_koSnqucA2',
      userPoolClientId: '162d0f9irj230mhiuhhh2t3o8m',
      loginWith: {
        oauth: {
          domain: 'reevent-auth-dev.auth.us-east-1.amazoncognito.com',
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: ['http://localhost:4200/auth/callback'],
          redirectSignOut: ['http://localhost:4200/auth/logout'],
          responseType: 'code'
        }
      }
    }
  }
});
```

### Flujo de Autenticación

1. **Login**: Redirección a Cognito Hosted UI
2. **Callback**: Procesamiento del código de autorización
3. **Tokens**: Almacenamiento de JWT tokens
4. **API Calls**: Inclusión automática de tokens en requests

## 📊 APIs Integration

### HTTP Interceptors

```typescript
// Auth Interceptor - Agrega token JWT
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = getCurrentToken();
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  return next(req);
};

// API Interceptor - Maneja URLs de API
export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('/api')) {
    const apiPath = req.url.replace('/api', '');
    req = req.clone({
      url: `${environment.apiUrl}${apiPath}`
    });
  }
  return next(req);
};
```

### Endpoints Disponibles

- **Users**: `/users/{userId}` (GET, PUT)
- **Events**: `/events` (GET, POST), `/events/{eventId}` (GET, PUT, DELETE)
- **Evaluations**: `/evaluations` (GET, POST), `/evaluations/session/{sessionId}` (GET)
- **Points**: `/points/total` (GET), `/points/history` (GET), `/points/claim` (POST)
- **Notifications**: `/notifications` (GET, POST)
- **FCM**: `/fcm-tokens/register` (POST)

## 🚀 Despliegue

### Build de Producción

```bash
# Build optimizado
npm run build:prod

# Los archivos se generan en dist/s3/
```

### Despliegue a S3

```bash
# Configurar AWS CLI
aws configure

# Sincronizar con S3
aws s3 sync dist/s3/ s3://tu-bucket-name --delete
```

### Variables de Entorno para Producción

Asegúrate de configurar las variables correctas en `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-api-gateway-url.amazonaws.com/prod',
  cognitoConfig: {
    domain: 'tu-cognito-domain.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://tu-dominio.com/auth/callback',
    redirectSignOut: 'https://tu-dominio.com/auth/logout'
  }
};
```

## 🧪 Testing

### Tests Unitarios

```bash
# Ejecutar tests
npm test

# Tests en modo watch
npm test -- --watch
```

### Tests E2E

```bash
# Ejecutar tests e2e
npm run e2e
```

## 🔧 Troubleshooting

### Problemas Comunes

1. **CORS Errors**: Verificar configuración de API Gateway
2. **Auth Issues**: Verificar configuración de Cognito
3. **Build Errors**: Limpiar node_modules y reinstalar
4. **PWA Issues**: Verificar service worker y manifest

### Comandos de Limpieza

```bash
# Limpiar cache
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Limpiar build
rm -rf dist/
npm run build
```

## 📚 Recursos Adicionales

- [Angular Documentation](https://angular.dev/)
- [NgRx Documentation](https://ngrx.io/)
- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request
