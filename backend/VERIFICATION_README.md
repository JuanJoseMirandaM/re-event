# Sistema de Verificación - Guía de Despliegue

## 🎯 Descripción

Sistema de verificación que permite a los organizadores generar códigos únicos por rol y a los usuarios verificar su cuenta para cambiar de `GUEST` a roles específicos del evento.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Organizador   │───▶│ Generate Codes   │───▶│   DynamoDB      │
│   (App)         │    │    Lambda        │    │ (verification   │
└─────────────────┘    └──────────────────┘    │    codes)       │
                                               └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Usuario       │◀───│  Verify Code     │◀───│   DynamoDB      │
│   (App)         │    │    Lambda        │    │ (users)         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Componentes

### Lambdas
- **`generate-codes`**: Genera códigos únicos por rol y crea documento HTML
- **`verify-code`**: Verifica usuarios con códigos y actualiza roles

### APIs
- **`POST /users/generate-codes`**: Generar códigos de verificación
- **`POST /users/verify-code`**: Verificar código de usuario

### Base de Datos
- **`verification_codes`**: Tabla para almacenar códigos de verificación
- **`users`**: Tabla actualizada con campos de verificación

### Almacenamiento
- **S3**: Para almacenar documentos HTML de códigos

## 🚀 Despliegue

### 1. Preparar Dependencias

```bash
# Instalar dependencias de user lambdas
cd backend/lambdas/user
npm install

# Instalar dependencias de verification lambdas
cd ../verification
npm install
```

### 2. Configurar Variables

Editar `terraform/variables.tf`:
```hcl
variable "s3_bucket_name" {
  description = "S3 bucket name for storing verification codes PDF"
  type        = string
  default     = "reevent-verification-codes-dev"  # Cambiar según ambiente
}
```

### 3. Desplegar Infraestructura

```bash
cd terraform

# Planificar cambios
terraform plan

# Aplicar cambios
terraform apply
```

### 4. Verificar Despliegue

```bash
# Verificar lambdas creadas
aws lambda list-functions --query 'Functions[?contains(FunctionName, `reevent`) && (contains(FunctionName, `generate-codes`) || contains(FunctionName, `verify-code`))]'

# Verificar APIs creadas
aws apigateway get-rest-apis --query 'items[?name==`reevent-api-dev`]'
```

## 🧪 Testing

### 1. Generar Códigos (Organizador)

```bash
# Obtener token de organizador
TOKEN=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id $(terraform output -raw cognito_user_pool_id) \
  --client-id $(terraform output -raw cognito_client_id) \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=organizer@example.com,PASSWORD=password123 \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Generar códigos
curl -X POST $(terraform output -raw api_gateway_url)/users/generate-codes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "roleQuantities": {
      "ATTENDEE": 10,
      "SPEAKER": 2
    }
  }'
```

### 2. Verificar Código (Usuario)

```bash
# Obtener token de usuario
TOKEN=$(aws cognito-idp admin-initiate-auth \
  --user-pool-id $(terraform output -raw cognito_user_pool_id) \
  --client-id $(terraform output -raw cognito_client_id) \
  --auth-flow ADMIN_NO_SRP_AUTH \
  --auth-parameters USERNAME=user@example.com,PASSWORD=password123 \
  --query 'AuthenticationResult.IdToken' \
  --output text)

# Verificar código
curl -X POST $(terraform output -raw api_gateway_url)/users/verify-code \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "verificationCode": "ABC123",
    "userId": "usr-001"
  }'
```

## 📊 Monitoreo

### CloudWatch Logs

```bash
# Ver logs de generación
aws logs tail /aws/lambda/reevent-generate-codes-dev --follow

# Ver logs de verificación
aws logs tail /aws/lambda/reevent-verify-code-dev --follow
```

### Métricas Importantes

- **Códigos generados por rol**
- **Códigos usados vs disponibles**
- **Tiempo de respuesta de verificación**
- **Errores de códigos inválidos**

## 🔧 Configuración

### Variables de Entorno

#### Generate Codes Lambda
- `VERIFICATION_CODES_TABLE`: Tabla de códigos de verificación
- `S3_BUCKET`: Bucket S3 para documentos HTML

#### Verify Code Lambda
- `USERS_TABLE`: Tabla de usuarios
- `VERIFICATION_CODES_TABLE`: Tabla de códigos de verificación

### Permisos IAM

- **DynamoDB**: GetItem, PutItem, UpdateItem, Query, BatchWrite
- **S3**: PutObject, GetObject, DeleteObject
- **API Gateway**: InvokeFunction

## 🏷️ Roles y Puntos por Verificación

| Rol | Puntos Agregados | Descripción |
|-----|------------------|-------------|
| GUEST | 0 | Usuario registrado pero no verificado |
| ATTENDEE | +50 | Puntos adicionales al verificar como asistente |
| SPEAKER | +200 | Puntos adicionales al verificar como expositor |
| SPONSOR | +300 | Puntos adicionales al verificar como patrocinador |
| VOLUNTEER | +150 | Puntos adicionales al verificar como voluntario |
| ORGANIZER | +500 | Puntos adicionales al verificar como organizador |

## 🔒 Seguridad

- **Autenticación**: JWT tokens de Cognito requeridos
- **Autorización**: Solo organizadores pueden generar códigos
- **Códigos únicos**: 6 caracteres alfanuméricos únicos
- **Uso único**: Cada código solo puede usarse una vez
- **Expiración**: Códigos expiran en 30 días
- **Auditoría**: Registro completo de verificaciones

## 🚨 Troubleshooting

### Errores Comunes

#### Lambda No Encontrada
```bash
# Verificar que las lambdas existen
aws lambda list-functions --query 'Functions[?contains(FunctionName, `reevent`) && contains(FunctionName, `verification`)]'
```

#### Permisos Denegados
```bash
# Verificar permisos IAM
aws iam get-role-policy --role-name reevent-api-lambda-role-dev --policy-name reevent-api-dynamodb-policy-dev
```

#### API Gateway No Responde
```bash
# Verificar que la API está desplegada
aws apigateway get-deployments --rest-api-id $(terraform output -raw api_gateway_id)
```

### Logs Útiles

```bash
# Ver errores de Lambda
aws logs filter-log-events \
  --log-group-name /aws/lambda/reevent-generate-codes-dev \
  --filter-pattern "ERROR"

# Ver errores de API Gateway
aws logs filter-log-events \
  --log-group-name API-Gateway-Execution-Logs_$(terraform output -raw api_gateway_id)/dev \
  --filter-pattern "ERROR"
```

## 📈 Escalabilidad

- **Batch Operations**: Uso de BatchWrite para múltiples códigos
- **Async Processing**: Generación asíncrona de documentos HTML
- **Indexing**: GSIs optimizados para consultas frecuentes
- **Caching**: Considerar CloudFront para documentos HTML

## 🔄 Mantenimiento

### Limpieza de Códigos Expirados

```bash
# Script para limpiar códigos expirados (ejecutar periódicamente)
aws dynamodb scan \
  --table-name reevent-verification-codes-dev \
  --filter-expression "expiresAt < :now" \
  --expression-attribute-values '{":now": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}}' \
  --query 'Items[].verificationCode' \
  --output text
```

### Backup de Datos

```bash
# Exportar códigos de verificación
aws dynamodb scan \
  --table-name reevent-verification-codes-dev \
  --select ALL_ATTRIBUTES \
  --output json > verification-codes-backup.json
```

## 📞 Soporte

Para problemas o preguntas:
1. Revisar logs de CloudWatch
2. Verificar configuración de Terraform
3. Consultar documentación de APIs
4. Contactar al equipo de desarrollo 