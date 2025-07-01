# Especificaciones Técnicas - re:Event

## 🛠️ Stack Tecnológico

### Frontend (PWA)
- **Framework**: Angular 17+ con TypeScript
- **PWA**: Angular Service Worker (@angular/pwa)
- **UI Library**: Angular Material
- **State Management**: NgRx + NgRx Data
- **Routing**: Angular Router
- **Forms**: Angular Reactive Forms + Custom Validators
- **QR Scanner**: @zxing/ngx-scanner
- **Push Notifications**: Angular Service Worker + Firebase Cloud Messaging

### Backend (AWS Serverless)
- **Runtime**: Node.js 18.x (Lambda)
- **Framework**: AWS CDK v2 (TypeScript)
- **API**: API Gateway REST + GraphQL (AppSync)
- **Database**: DynamoDB con Single Table Design
- **Authentication**: AWS Cognito User Pools
- **File Storage**: Amazon S3
- **Message Queue**: Amazon SQS
- **Image Processing**: AWS Lambda + Sharp
- **Monitoring**: CloudWatch + X-Ray

## 📱 Especificaciones PWA

### Manifest.json (Generado por Angular PWA)
```json
{
  "name": "re:Event - AWS Community Day",
  "short_name": "re:Event",
  "description": "Aplicación oficial del AWS Community Day",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#FF9900",
  "background_color": "#232F3E",
  "scope": "/",
  "icons": [
    {
      "src": "assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ]
}
```

### Angular Service Worker Features
- **Offline Caching**: Agenda, perfil usuario, puntos (configurado en ngsw-config.json)
- **Background Sync**: Evaluaciones pendientes
- **Push Notifications**: Notificaciones del evento
- **Update Strategy**: Cache-first para assets, Network-first para API
- **App Shell**: Caching de shell de aplicación
- **Data Groups**: Caching inteligente de datos de API

## 🗄️ Esquema de Base de Datos

### DynamoDB Single Table Design

#### Partition Key (PK) Patterns
- `USER#<email>` - Datos de usuario
- `SESSION#<sessionId>` - Información de sesiones
- `POINTS#<date>` - Transacciones de puntos
- `EVAL#<sessionId>` - Evaluaciones
- `PHOTO#<photoId>` - Metadatos de fotos
- `PRIZE#<prizeId>` - Catálogo de premios
- `NOTIF#<timestamp>` - Notificaciones

#### Sort Key (SK) Patterns
- `PROFILE` - Perfil de usuario
- `POINTS#<timestamp>` - Transacción específica
- `EVAL#<userEmail>` - Evaluación por usuario
- `ATTENDANCE#<userEmail>` - Asistencia a sesión
- `DELIVERY#<type>` - Control de entregas

### Índices Secundarios Globales (GSI)

#### GSI1: Points Leaderboard
- **PK**: `POINTS#TOTAL`
- **SK**: `USER#<email>`
- **Attributes**: `points`, `name`, `company`

#### GSI2: Sessions by Time
- **PK**: `SESSION#<date>`
- **SK**: `<startTime>`
- **Attributes**: `title`, `speaker`, `location`

#### GSI3: Evaluations by Session
- **PK**: `EVAL#<sessionId>`
- **SK**: `<timestamp>`
- **Attributes**: `rating`, `npsScore`, `sentiment`

## 🔌 API Endpoints

### Authentication
```
POST /auth/register
POST /auth/login
POST /auth/verify-code
POST /auth/refresh-token
```

### User Management
```
GET /users/profile
PUT /users/profile
GET /users/points
GET /users/points/history
GET /users/leaderboard
```

### Sessions
```
GET /sessions
GET /sessions/{sessionId}
POST /sessions/{sessionId}/attend
GET /sessions/{sessionId}/qr
```

### Evaluations
```
POST /evaluations
GET /evaluations/session/{sessionId}
GET /evaluations/user/{userEmail}
```

### Points & Prizes
```
POST /points/grant
POST /points/redeem
GET /prizes
POST /prizes/{prizeId}/redeem
```

### Photos
```
POST /photos/upload
GET /photos
GET /photos/{photoId}
```

### Notifications
```
POST /notifications/send
GET /notifications/user
PUT /notifications/{notificationId}/read
```

### Assistance
```
POST /assistance/request
GET /assistance/requests
PUT /assistance/{requestId}/respond
```

## 🔐 Seguridad y Autenticación

### AWS Cognito Configuration
```json
{
  "userPool": {
    "policies": {
      "passwordPolicy": {
        "minimumLength": 8,
        "requireUppercase": true,
        "requireLowercase": true,
        "requireNumbers": true,
        "requireSymbols": false
      }
    },
    "mfaConfiguration": "OPTIONAL",
    "accountRecoverySetting": {
      "recoveryMechanisms": [
        {
          "name": "verified_email",
          "priority": 1
        }
      ]
    }
  },
  "userPoolClient": {
    "generateSecret": false,
    "authFlows": [
      "ALLOW_USER_SRP_AUTH",
      "ALLOW_REFRESH_TOKEN_AUTH"
    ],
    "oAuth": {
      "flows": ["code"],
      "scopes": ["email", "openid", "profile"],
      "callbackUrls": ["https://reevent.awscommunity.com/callback"],
      "logoutUrls": ["https://reevent.awscommunity.com/logout"]
    }
  }
}
```

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "email_verified": true,
  "custom:role": "ATTENDEE",
  "custom:verified": "true",
  "custom:verification_code": "ABC123",
  "iat": 1640995200,
  "exp": 1641081600
}
```

## 📊 Reglas de Negocio

### Sistema de Puntos
```typescript
interface PointsRule {
  action: string;
  points: number;
  maxPerDay?: number;
  roleMultiplier?: Record<UserRole, number>;
  conditions?: string[];
}

const POINTS_RULES: PointsRule[] = [
  {
    action: "REGISTER",
    points: 50,
    maxPerDay: 1
  },
  {
    action: "ATTEND_SESSION",
    points: 25,
    conditions: ["within_session_time"]
  },
  {
    action: "COMPLETE_EVALUATION",
    points: 15,
    roleMultiplier: { SPEAKER: 2 }
  },
  {
    action: "UPLOAD_PHOTO",
    points: 10,
    maxPerDay: 5
  }
];
```

### Validaciones de Código
```typescript
interface VerificationCode {
  code: string;
  role: UserRole;
  maxUses: number;
  expiresAt: Date;
  eventId: string;
}

// Códigos por rol
const CODE_PATTERNS = {
  ATTENDEE: /^[A-Z]{2}[0-9]{4}$/,
  SPEAKER: /^SPK[0-9]{3}$/,
  SPONSOR: /^SPN[0-9]{3}$/,
  VOLUNTEER: /^VOL[0-9]{3}$/,
  ORGANIZER: /^ORG[0-9]{3}$/
};
```

## 🖼️ Procesamiento de Imágenes

### Lambda Function para Fotos
```typescript
export const processPhoto = async (event: S3Event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  
  // Descargar imagen original
  const originalImage = await s3.getObject({ Bucket: bucket, Key: key }).promise();
  
  // Procesar con Sharp
  const processedImage = await sharp(originalImage.Body)
    .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
    .composite([{
      input: await getEventLogo(),
      gravity: 'southeast',
      blend: 'over'
    }])
    .jpeg({ quality: 85 })
    .toBuffer();
  
  // Guardar imagen procesada
  await s3.putObject({
    Bucket: bucket,
    Key: `processed/${key}`,
    Body: processedImage,
    ContentType: 'image/jpeg'
  }).promise();
};
```

## 📱 Notificaciones Push

### SQS Message Format
```json
{
  "type": "PUSH_NOTIFICATION",
  "target": {
    "type": "ALL|ROLE|USER",
    "value": "ATTENDEE|user@example.com"
  },
  "notification": {
    "title": "¡Sesión por comenzar!",
    "body": "La charla de Serverless inicia en 5 minutos",
    "icon": "/icons/session.png",
    "badge": "/icons/badge.png",
    "data": {
      "sessionId": "session-123",
      "action": "VIEW_SESSION"
    }
  },
  "timestamp": "2025-03-15T10:25:00Z"
}
```

## 🚀 Configuración de Despliegue

### AWS CDK Stack Structure
```
infrastructure/
├── lib/
│   ├── auth-stack.ts          # Cognito User Pool
│   ├── database-stack.ts      # DynamoDB Tables
│   ├── api-stack.ts           # API Gateway + Lambda
│   ├── storage-stack.ts       # S3 Buckets
│   ├── messaging-stack.ts     # SQS + SNS
│   └── frontend-stack.ts      # CloudFront + S3
├── bin/
│   └── app.ts                 # CDK App Entry Point
└── cdk.json                   # CDK Configuration
```

### Environment Variables
```bash
# Development
STAGE=dev
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXX
DYNAMODB_TABLE_NAME=re-event-dev
S3_BUCKET_NAME=re-event-photos-dev
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/re-event-notifications-dev

# Production
STAGE=prod
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_YYYYYYYYY
COGNITO_CLIENT_ID=YYYYYYYYYYYYYYYYYYYYYYYY
DYNAMODB_TABLE_NAME=re-event-prod
S3_BUCKET_NAME=re-event-photos-prod
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/re-event-notifications-prod
```

## 📈 Métricas y Monitoreo

### CloudWatch Dashboards
- **User Metrics**: Registros, logins, verificaciones
- **Session Metrics**: Asistencia, evaluaciones, ratings
- **Points Metrics**: Transacciones, canjes, leaderboard
- **System Metrics**: Lambda duration, DynamoDB throttles, API errors

### Alertas Críticas
- API Gateway 4xx/5xx > 5%
- Lambda errors > 1%
- DynamoDB throttling > 0
- Cognito authentication failures > 10%