# Terraform Infrastructure - re:Event

Esta carpeta contiene toda la infraestructura como código (IaC) para la aplicación re:Event usando Terraform.

## 🏗️ Arquitectura

La infraestructura está organizada en módulos reutilizables:

- **Database**: DynamoDB con tabla unificada y GSI
- **Auth**: Cognito User Pool con Google OAuth + Lambda
- **API**: Lambda functions + API Gateway completo
- **Storage**: S3 para imágenes de FaceFinder
- **AI**: Rekognition para reconocimiento facial
- **Messaging**: SQS para procesamiento batch
- **Security**: IAM roles unificados
- **Compute**: Lambda functions para ambos proyectos
- **CDN**: CloudFront para servir imágenes
- **Frontend**: S3 + CloudFront (próximamente)

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
- **Tabla Unificada**: `reevent-users-{environment}`
- **Partition Key**: `userId` (re:Event) / `PK` (FaceFinder)
- **Sort Key**: `SK` (para FaceFinder)
- **GSI**: `EmailIndex` + índices para FaceFinder
- **Billing**: Pay-per-request

### 🔐 Cognito
- **User Pool**: Autenticación de usuarios
- **OAuth**: Integración con Google
- **Atributos**: email, name, phone_number, custom:company
- **Dominio**: `reevent-auth-{environment}.auth.{region}.amazoncognito.com`

### ⚡ Lambda
**re:Event Functions:**
- `reevent-auth-post-confirmation-{environment}`: Post-confirmación Cognito
- `reevent-*-{environment}`: API endpoints

**FaceFinder Functions:**
- `reevent-presigned-batch-{environment}`: URLs pre-firmadas batch
- `reevent-presigned-search-{environment}`: URLs pre-firmadas búsqueda
- `reevent-search-by-face-{environment}`: Búsqueda facial
- `reevent-save-analyze-{environment}`: Procesamiento batch
- `reevent-brand-publish-{environment}`: Watermarks
- `reevent-get-paginated-items-{environment}`: Paginación

### 🔑 IAM
- **Rol**: `ReEventLambdaRole-{environment}`
- **Políticas**: 
  - AWSLambdaBasicExecutionRole
  - DynamoDBWriteAccess (PutItem)

## 📊 Outputs Disponibles

Después del despliegue:

```bash
terraform output
```

**re:Event Outputs:**
- `users_table_name`: Nombre de la tabla DynamoDB
- `users_table_arn`: ARN de la tabla DynamoDB
- `lambda_role_arn`: ARN del rol de Lambda
- `user_pool_id`: ID del User Pool de Cognito
- `user_pool_client_id`: ID del cliente SPA
- `cognito_domain`: Dominio de autenticación
- `api_gateway_url`: URL del API Gateway

**FaceFinder Outputs:**
- `facefinder_s3_bucket_name`: Bucket S3 para imágenes
- `rekognition_collection_id`: Collection ID de Rekognition
- `sqs_queue_url`: URL de la cola SQS
- `cloudfront_domain_name`: Dominio de CloudFront
- `facefinder_lambda_functions`: Detalles de funciones Lambda

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