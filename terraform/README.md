# Terraform Infrastructure - re:Event

Esta carpeta contiene toda la infraestructura como código (IaC) para la aplicación re:Event usando Terraform.

## 🏗️ Arquitectura

La infraestructura está organizada en módulos reutilizables:

- **✅ Database**: DynamoDB con todas las tablas necesarias
- **✅ Auth**: Cognito User Pool con Google OAuth + Lambda
- **✅ API**: Lambda functions + API Gateway con CORS configurado
- **📋 Frontend**: S3 + CloudFront (pendiente)

## 📁 Estructura

```
terraform/
├── main.tf                 # Configuración principal unificada
├── variables.tf            # Variables globales (re:Event + FaceFinder)
├── outputs.tf             # Outputs principales
├── deploy.sh              # Script de despliegue
├── modules/               # Módulos reutilizables
│   ├── database/          # DynamoDB unificado
│   ├── auth/              # Cognito + Lambda
│   ├── api/               # Lambda + API Gateway completo
│   ├── storage/           # S3 para FaceFinder
│   ├── ai/                # Rekognition
│   ├── messaging/         # SQS
│   ├── security/          # IAM roles
│   ├── compute/           # Lambda functions
│   ├── cdn/               # CloudFront
│   └── frontend/          # S3 + CloudFront (próximamente)
└── environments/          # Configuraciones por ambiente
    ├── dev/
    └── prod/
```

## 🚀 Despliegue

### Prerrequisitos

1. **Terraform** >= 1.0
2. **AWS CLI** configurado con perfil "terraform"
3. **Credenciales AWS** en `~/.aws/credentials`

### Comandos Rápidos

```bash
# Planificar despliegue en desarrollo
./deploy.sh -e dev -a plan

# Aplicar cambios en desarrollo
./deploy.sh -e dev -a apply

# Aplicar cambios en producción (con auto-approve)
./deploy.sh -e prod -a apply -y

# Destruir recursos de desarrollo
./deploy.sh -e dev -a destroy
```

### Despliegue Manual

```bash
# Inicializar Terraform
terraform init

# Planificar cambios
terraform plan -var-file="environments/dev/terraform.tfvars"

# Aplicar cambios
terraform apply -var-file="environments/dev/terraform.tfvars"
```

### Configuración por Ambiente

Edita los archivos en `environments/{env}/terraform.tfvars`:

```hcl
# Configuración básica
environment = "dev"
aws_region  = "us-east-1"

# OAuth (configurar con valores reales)
google_client_id     = "your-google-client-id"
google_client_secret = "your-google-client-secret"

# FaceFinder (configurar para reconocimiento facial)
event_name = "amazon-community-bolivia-2025"
aws_profile = "terraform"
```

## ⚙️ Recursos Creados

### 🗄️ DynamoDB
- **Users**: `reevent-users-{environment}` - Gestión de usuarios
- **Events**: `reevent-events-{environment}` - Gestión de eventos
- **Evaluations**: `reevent-evaluations-{environment}` - Evaluaciones de sesiones
- **Points**: `reevent-points-claims-{environment}` y `reevent-points-codes-{environment}` - Sistema de puntos
- **Notifications**: `reevent-notifications-{environment}` - Notificaciones
- **FCM**: `reevent-fcm-tokens-{environment}` - Tokens de notificaciones push
- **Verification**: `reevent-verification-codes-{environment}` - Códigos de verificación

### 🔐 Cognito
- **User Pool**: `us-east-1_koSnqucA2`
- **Client ID**: `162d0f9irj230mhiuhhh2t3o8m`
- **OAuth**: Integración con Google
- **Atributos**: email, name, phone_number, custom:company
- **Dominio**: `reevent-auth-dev.auth.us-east-1.amazoncognito.com`

### ⚡ Lambda Functions
- **Auth**: `reevent-create-user-dev` - Post-confirmación de Cognito
- **Users**: `reevent-get-user-dev`, `reevent-update-user-dev`
- **Events**: `reevent-create-event-dev`, `reevent-get-events-dev`, `reevent-get-event-dev`, `reevent-update-event-dev`, `reevent-delete-event-dev`
- **Evaluations**: `reevent-create-evaluation-dev`, `reevent-get-evaluation-dev`, `reevent-get-evaluations-by-session-dev`, `reevent-get-evaluations-by-user-dev`
- **Points**: `reevent-get-total-points-dev`, `reevent-get-points-history-dev`, `reevent-claim-points-dev`, `reevent-deduct-points-dev`, `reevent-generate-code-dev`, `reevent-generate-codes-dev`
- **Notifications**: `reevent-create-notification-dev`, `reevent-get-notifications-dev`
- **FCM**: `reevent-register-fcm-token-dev`
- **Verification**: `reevent-verify-code-dev`

### 🌐 API Gateway
- **REST API**: `67e15rhdb7`
- **Base URL**: `https://67e15rhdb7.execute-api.us-east-1.amazonaws.com/dev`
- **CORS**: Configurado para todos los endpoints
- **Authorizer**: Cognito JWT para autenticación

### 🔑 IAM
- **Rol**: `reevent-api-lambda-role-dev`
- **Políticas**: 
  - AWSLambdaBasicExecutionRole
  - DynamoDBReadWriteAccess
  - S3Access (para archivos)

## 📊 Outputs Disponibles

Después del despliegue:

```bash
terraform output
```

- `api_gateway_id`: ID del API Gateway (`67e15rhdb7`)
- `api_gateway_url`: URL base de la API (`https://67e15rhdb7.execute-api.us-east-1.amazonaws.com/dev`)
- `cognito_domain`: Dominio de autenticación (`https://reevent-auth-dev.auth.us-east-1.amazoncognito.com`)
- `user_pool_id`: ID del User Pool de Cognito (`us-east-1_koSnqucA2`)
- `user_pool_client_id`: ID del cliente SPA (`162d0f9irj230mhiuhhh2t3o8m`)
- `users_table_name`: Nombre de la tabla de usuarios (`reevent-users-dev`)
- `users_table_arn`: ARN de la tabla de usuarios
- `events_table_name`: Nombre de la tabla de eventos (`reevent-events-dev`)
- `events_table_arn`: ARN de la tabla de eventos
- `evaluations_table_name`: Nombre de la tabla de evaluaciones (`reevent-evaluations-dev`)
- `evaluations_table_arn`: ARN de la tabla de evaluaciones
- `lambda_role_arn`: ARN del rol de Lambda

## 🔧 Módulos

### Database Module

Crea una tabla DynamoDB con:
- Single table design con GSI
- Pay-per-request billing
- Atributos: userId (PK), email (GSI)

### Auth Module

Configura:
- Cognito User Pool con OAuth
- Lambda post-confirmation
- IAM roles y políticas
- Google Identity Provider

### Variables Sensibles

Para mayor seguridad, usa variables de entorno:

```bash
export TF_VAR_google_client_id="tu-client-id"
export TF_VAR_google_client_secret="tu-client-secret"
```

## 🔍 Configuración de Google OAuth

1. **Ve a [Google Cloud Console](https://console.cloud.google.com/)**
2. **Crea un proyecto o selecciona uno existente**
3. **Habilita Google+ API**
4. **Crea credenciales OAuth 2.0:**
   - Tipo: Aplicación web
   - URIs de redirección: `https://reevent-auth-dev.auth.us-east-1.amazoncognito.com/oauth2/idpresponse`

## 🔄 Flujo de Autenticación

1. **Usuario se registra** → Cognito User Pool
2. **Confirmación de email** → Trigger Lambda
3. **Lambda ejecuta** → Crea usuario en DynamoDB
4. **Usuario autenticado** → Tokens JWT disponibles

## 🛠️ Desarrollo Local

Para desarrollo, las URLs de callback apuntan a `localhost:4200`. Asegúrate de que tu aplicación frontend esté corriendo en ese puerto.

## 🔍 Troubleshooting

### Error: Google OAuth no configurado
```bash
# Verifica que las variables estén configuradas
terraform output user_pool_client_id
# Configura las URLs de callback en Google Cloud Console
```

### Error: Lambda no se ejecuta
```bash
# Verifica que el archivo ZIP existe
ls -la ../backend/lambdas/user/auth-post-confirmation.zip
# Reconstruye la función Lambda si es necesario
```

### Error: Permisos DynamoDB
```bash
# Verifica que el rol tenga los permisos correctos
aws iam get-role-policy --role-name ReEventLambdaRole-dev --policy-name DynamoDBWriteAccess-dev
```

## 🛡️ Seguridad

- ✅ Cognito con políticas de contraseña robustas
- ✅ DynamoDB con acceso controlado por IAM
- ✅ Lambda con permisos mínimos necesarios
- ✅ Variables sensibles marcadas como `sensitive`
- ✅ OAuth con Google para autenticación externa

## 🔄 CI/CD

Para integrar con GitHub Actions:

```yaml
- name: Deploy Infrastructure
  run: |
    cd terraform
    ./deploy.sh -e ${{ github.ref == 'refs/heads/main' && 'prod' || 'dev' }} -a apply -y
```

## 🎯 Funcionalidades Integradas

### re:Event + FaceFinder
- **Autenticación unificada**: Cognito para ambos proyectos
- **Base de datos compartida**: Single table design
- **API unificada**: Endpoints de ambos proyectos
- **Sistema de puntos**: Ganar puntos usando FaceFinder
- **Notificaciones**: Push notifications cuando encuentres fotos

### Flujos de Trabajo

**Flujo A: Procesamiento Batch (FaceFinder)**
1. Usuario sube imágenes → S3 `/private/`
2. S3 notifica → SQS → Lambda `save-analyze`
3. Rekognition extrae rostros → DynamoDB
4. Lambda `brand-publish` → S3 `/share/` → CloudFront

**Flujo B: Búsqueda Facial**
1. Usuario sube imagen → S3 `/face-scans/`
2. API → Lambda `search-by-face` → Rekognition
3. Resultados desde DynamoDB → Usuario gana puntos

**Flujo C: Sistema de Puntos**
1. Usuario usa FaceFinder → Gana puntos automáticamente
2. Notificación push → Usuario ve historial

## 📈 Próximos Pasos

1. **Frontend Module**: S3 + CloudFront para web app
2. **Monitoring**: CloudWatch + X-Ray
3. **CI/CD**: GitHub Actions integration
4. **Mobile App**: Integración con app móvil

## 💡 Tips
- Usa `terraform plan` antes de `apply`
- Mantén el estado de Terraform seguro
- Documenta cambios importantes
- Usa tags consistentes en todos los recursos
- Considera usar Terraform Cloud para trabajo en equipo

## 🔧 Comandos de Monitoreo FaceFinder

```bash
# Listar rostros en Rekognition
aws rekognition list-faces --collection-id reevent-faces-dev --profile terraform

# Ver datos en DynamoDB
aws dynamodb scan --table-name reevent-users-dev --profile terraform

# Monitorear cola SQS
aws sqs get-queue-attributes --queue-url $(terraform output -raw sqs_queue_url) --attribute-names All --profile terraform
```

## 💰 Costos Estimados (Dev)

- **DynamoDB**: ~$5/mes (tabla unificada)
- **Lambda**: ~$15/mes (ambos proyectos)
- **S3**: ~$5/mes (imágenes FaceFinder)
- **Rekognition**: ~$15/mes (análisis facial)
- **API Gateway**: ~$3/mes
- **CloudFront**: ~$1/mes
- **SQS**: ~$1/mes
- **Cognito**: Gratis (< 50k usuarios)

**Total estimado**: ~$45/mes para desarrollo completo