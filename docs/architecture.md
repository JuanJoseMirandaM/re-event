# Arquitectura del Sistema - re:Event

## 🏗️ Arquitectura General

La aplicación re:Event utiliza una arquitectura serverless en AWS para garantizar escalabilidad, disponibilidad y costos optimizados.

## 📊 Diagrama de Arquitectura

```
┌─────────────────┐    ┌─────────────────────┐    ┌─────────────────┐
│   PWA Frontend  │────│   Amazon CloudFront │────│   Amazon S3     │
│   (Angular)     │    │   (CDN Global)      │    │   (Static Web)  │
└─────────────────┘    └─────────────────────┘    └─────────────────┘
         │
         │ HTTPS/API Calls
         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Amazon API     │────│   AWS Lambda     │────│   Amazon        │
│  Gateway        │    │   (Business      │    │   DynamoDB      │
│  (REST/GraphQL) │    │   Logic)         │    │   (Database)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌──────────────────┐
│   AWS Cognito   │    │   Amazon SQS     │
│   (Auth)        │    │   (Notifications)│
└─────────────────┘    └──────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Amazon S3      │
                       │   (Images/Files) │
                       └──────────────────┘
```

## 🔧 Componentes Principales

### Frontend (PWA)
- **Tecnología**: Angular 17+ con Angular Service Worker
- **Hosting**: Amazon S3 + CloudFront
- **Características**:
  - Offline-first approach
  - Push notifications nativas
  - Responsive design con Angular Flex Layout
  - Instalable en dispositivos móviles
  - App Shell architecture

### Backend (Serverless)
- **API Gateway**: Punto de entrada para todas las APIs
- **Lambda Functions**: Lógica de negocio distribuida
- **DynamoDB**: Base de datos NoSQL para alta performance
- **Cognito**: Gestión de usuarios y autenticación

### Servicios de Soporte
- **SQS**: Cola de mensajes para notificaciones
- **S3**: Almacenamiento de imágenes y archivos
- **CloudWatch**: Monitoreo y logs
- **EventBridge**: Eventos del sistema

## 🗄️ Modelo de Datos

### Tablas DynamoDB

#### Users
```json
{
  "PK": "USER#email",
  "SK": "PROFILE",
  "name": "string",
  "company": "string",
  "phone": "string",
  "role": "ATTENDEE|SPEAKER|SPONSOR|VOLUNTEER|ORGANIZER",
  "verified": "boolean",
  "verificationCode": "string",
  "points": "number",
  "createdAt": "timestamp"
}
```

#### Sessions
```json
{
  "PK": "SESSION#sessionId",
  "SK": "INFO",
  "title": "string",
  "description": "string",
  "speaker": "string",
  "startTime": "timestamp",
  "endTime": "timestamp",
  "location": "string",
  "qrCode": "string"
}
```

#### Points
```json
{
  "PK": "USER#email",
  "SK": "POINTS#timestamp",
  "amount": "number",
  "type": "EARNED|SPENT|GRANTED",
  "description": "string",
  "sessionId": "string?",
  "grantedBy": "string?"
}
```

#### Evaluations
```json
{
  "PK": "SESSION#sessionId",
  "SK": "EVAL#userEmail",
  "rating": "number",
  "npsScore": "number",
  "comments": "string",
  "sentiment": "POSITIVE|NEUTRAL|NEGATIVE",
  "submittedAt": "timestamp"
}
```

## 🔐 Seguridad

### Autenticación
- AWS Cognito User Pools
- JWT tokens para autorización
- MFA opcional para organizadores

### Autorización
- Role-based access control (RBAC)
- API Gateway authorizers
- Fine-grained permissions por endpoint

### Datos
- Encriptación en tránsito (HTTPS/TLS)
- Encriptación en reposo (DynamoDB, S3)
- Validación de entrada en todas las APIs

## 📈 Escalabilidad

### Auto-scaling
- Lambda: Escalado automático por demanda
- DynamoDB: On-demand billing
- API Gateway: Sin límites de concurrencia

### Performance
- CloudFront para CDN global
- DynamoDB con índices optimizados
- Caching en múltiples niveles

## 🔄 Flujos Principales

### Registro y Verificación
1. Usuario se registra con Cognito
2. Recibe código de verificación
3. Ingresa código de 6 caracteres
4. Sistema asigna rol y activa funcionalidades

### Sistema de Puntos
1. Usuario realiza acción (asistir, evaluar, etc.)
2. Lambda procesa regla de puntos
3. Actualiza balance en DynamoDB
4. Notifica al usuario vía SQS

### Evaluación de Sesiones
1. Usuario escanea QR de sesión
2. Abre formulario dinámico
3. Envía evaluación
4. Sistema procesa sentiment analysis
5. Otorga puntos por completar

## 🚀 Despliegue

### Infraestructura como Código
- AWS CDK (TypeScript)
- Ambientes: dev, staging, prod
- CI/CD con GitHub Actions

### Monitoreo
- CloudWatch Dashboards
- Alertas automáticas
- X-Ray para tracing distribuido