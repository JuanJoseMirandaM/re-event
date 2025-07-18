# Configuración del Sistema de Notificaciones

Este documento explica cómo configurar y utilizar el sistema de notificaciones en tiempo real para la aplicación re:Event.

## Arquitectura

El sistema de notificaciones utiliza AWS AppSync con GraphQL para proporcionar actualizaciones en tiempo real a los clientes. La arquitectura es la siguiente:

1. **AWS AppSync**: Proporciona la API GraphQL y gestiona las suscripciones en tiempo real.
2. **DynamoDB**: Almacena las notificaciones.
3. **Cognito**: Autentica a los usuarios y controla el acceso a las notificaciones.
4. **Angular + Amplify**: El frontend se conecta a AppSync y recibe actualizaciones en tiempo real.

## Configuración de Terraform

El sistema de notificaciones se configura automáticamente al desplegar la infraestructura con Terraform:

```bash
cd terraform
terraform init
terraform apply
```

## Configuración del Frontend

1. Instala las dependencias de AWS Amplify:

```bash
cd frontend/re-event-frontend
npm install aws-amplify @aws-amplify/ui-angular
```

2. Actualiza los valores en `src/environments/environment.ts` y `environment.prod.ts` con los valores reales de tu despliegue:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://tu-api-gateway-url.execute-api.us-east-1.amazonaws.com/dev',
  region: 'us-east-1',
  userPoolId: 'us-east-1_xxxxxxxx', // Desde la salida de Terraform
  userPoolWebClientId: 'xxxxxxxxxxxxxxxxxxxxxxxxxx', // Desde la salida de Terraform
  cognitoDomain: 'reevent-dev', // Desde la salida de Terraform
  redirectSignIn: 'http://localhost:4200/auth/callback',
  redirectSignOut: 'http://localhost:4200/auth/logout',
  graphqlEndpoint: 'https://xxxxxxxxxxxxxxxxxx.appsync-api.us-east-1.amazonaws.com/graphql', // Desde la salida de Terraform
  graphqlRealtimeEndpoint: 'wss://xxxxxxxxxxxxxxxxxx.appsync-realtime-api.us-east-1.amazonaws.com/graphql' // Desde la salida de Terraform
};
```

3. Inicializa Amplify en tu aplicación Angular. Crea un archivo `aws-config.ts`:

```typescript
import { Amplify } from 'aws-amplify';
import { environment } from './environments/environment';

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      region: environment.region,
      userPoolId: environment.userPoolId,
      userPoolWebClientId: environment.userPoolWebClientId,
      oauth: {
        domain: `${environment.cognitoDomain}.auth.${environment.region}.amazoncognito.com`,
        scope: ['email', 'profile', 'openid'],
        redirectSignIn: environment.redirectSignIn,
        redirectSignOut: environment.redirectSignOut,
        responseType: 'code'
      }
    },
    API: {
      graphql_endpoint: environment.graphqlEndpoint,
      graphql_endpoint_iam_region: environment.region
    },
    graphqlEndpoint: environment.graphqlEndpoint,
    graphqlEndpointRealtime: environment.graphqlRealtimeEndpoint
  });
}
```

Luego, importa y usa esta configuración en tu `app.module.ts`:

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { configureAmplify } from './aws-config';

// Configurar Amplify
configureAmplify();

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

## Uso del Servicio de Notificaciones

### Enviar una notificación

```typescript
import { NotificationService } from './services/notification.service';

constructor(private notificationService: NotificationService) {}

async sendNotification() {
  try {
    await this.notificationService.createNotification({
      title: 'Nueva sesión añadida',
      description: 'Se ha añadido una nueva sesión a la agenda',
      author: 'Sistema',
      targetRole: 'ALL', // o 'asistente', 'speaker', etc.
      link: '/agenda'
    });
  } catch (error) {
    console.error('Error al enviar notificación:', error);
  }
}
```

### Recibir notificaciones

El componente `NotificationBellComponent` ya está configurado para mostrar las notificaciones y actualizar automáticamente cuando llegan nuevas.

Para usarlo, simplemente añádelo a tu plantilla:

```html
<app-notification-bell></app-notification-bell>
```

## Tipos de Notificaciones

1. **Notificaciones para todos los usuarios**: Establecer `targetRole: 'ALL'`
2. **Notificaciones para un rol específico**: Establecer `targetRole: 'asistente'` (o el rol que corresponda)
3. **Notificaciones para un usuario específico**: Establecer `userId: 'id-del-usuario'`

## Pruebas

Para probar el sistema de notificaciones, puedes usar la consola de AWS AppSync:

### 1. Autenticación

1. Ve a la consola de AWS AppSync
2. Selecciona tu API
3. Ve a la pestaña "Queries"
4. Haz clic en "Login with User Pools"
5. Ingresa tus credenciales de Cognito

### 2. Crear una notificación (mutación)

```graphql
mutation CreateNotification {
  createNotification(input: {
    title: "Prueba de notificación",
    description: "Esta es una notificación de prueba",
    author: "Sistema",
    targetRole: "ALL"
  }) {
    notificationId
    title
    createdAt
  }
}
```

### 3. Probar suscripciones en tiempo real

**Importante**: Para probar suscripciones, necesitas usar dos pestañas del navegador:

**En la primera pestaña**:
1. Ejecuta la suscripción y déjala activa:
```graphql
subscription OnCreateNotification {
  onCreateNotification(targetRole: "ALL") {
    notificationId
    title
    description
    createdAt
    author
  }
}
```

**En la segunda pestaña**:
1. Abre otra pestaña del navegador con la consola de AppSync
2. Autentícate con las mismas credenciales
3. Ejecuta la mutación para crear una notificación
4. Vuelve a la primera pestaña para ver la notificación recibida

**Solución de problemas de suscripciones**:
- Si la suscripción se queda cargando, verifica en la consola de desarrollador del navegador (F12) si hay errores de WebSocket
- Asegúrate de que el esquema GraphQL tiene la directiva `@aws_subscribe` correctamente configurada
- Verifica que el token de autenticación es válido y no ha expirado

### 4. Probar con Postman

Para consultas y mutaciones (no suscripciones):

1. **Obtén un token JWT de Cognito**:
   ```
   POST https://cognito-idp.{tu-region}.amazonaws.com/
   Content-Type: application/x-amz-json-1.1
   X-Amz-Target: AWSCognitoIdentityProviderService.InitiateAuth

   {
     "AuthFlow": "USER_PASSWORD_AUTH",
     "ClientId": "{tu-user-pool-client-id}",
     "AuthParameters": {
       "USERNAME": "{tu-usuario}",
       "PASSWORD": "{tu-contraseña}"
     }
   }
   ```

2. **Configura la solicitud GraphQL**:
   - Método: POST
   - URL: Tu endpoint de AppSync
   - Headers:
     ```
     Content-Type: application/json
     Authorization: {tu-IdToken}
     ```
   - Body (ejemplo para crear una notificación):
     ```json
     {
       "query": "mutation CreateNotification($input: NotificationInput!) { createNotification(input: $input) { notificationId title } }",
       "variables": {
         "input": {
           "title": "Test desde Postman",
           "description": "Probando AppSync",
           "author": "Postman",
           "targetRole": "ALL"
         }
       }
     }
     ```

## Solución de Problemas

1. **Las notificaciones no llegan en tiempo real**:
   - Verifica que estás usando la URL correcta de AppSync
   - Comprueba que el usuario tiene los permisos adecuados en Cognito

2. **Error de autenticación**:
   - Asegúrate de que el usuario ha iniciado sesión correctamente
   - Verifica que el token JWT es válido

3. **Las suscripciones no funcionan**:
   - Comprueba la conexión WebSocket en las herramientas de desarrollo del navegador
   - Verifica que el esquema GraphQL incluye las directivas de suscripción correctas