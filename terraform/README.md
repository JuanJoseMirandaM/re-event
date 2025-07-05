# Terraform Infrastructure - re:Event

Esta carpeta contiene toda la infraestructura como código (IaC) para la aplicación re:Event usando Terraform.

## 🏗️ Arquitectura

La infraestructura está organizada en módulos reutilizables:

- **Database**: DynamoDB con single table design
- **Auth**: Cognito User Pool con OAuth providers
- **API**: Lambda functions + API Gateway
- **Frontend**: S3 + CloudFront distribution

## 📁 Estructura

```
terraform/
├── main.tf                 # Configuración principal
├── variables.tf            # Variables globales
├── outputs.tf             # Outputs principales
├── deploy.sh              # Script de despliegue
├── modules/               # Módulos reutilizables
│   ├── database/          # DynamoDB
│   ├── auth/              # Cognito
│   ├── api/               # Lambda + API Gateway
│   └── frontend/          # S3 + CloudFront
└── environments/          # Configuraciones por ambiente
    ├── dev/
    ├── staging/
    └── prod/
```

## 🚀 Despliegue

### Prerrequisitos

1. **Terraform** >= 1.0
2. **AWS CLI** configurado
3. **Node.js** 18+ (para build de Lambda functions)

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

# Seleccionar workspace
terraform workspace select dev

# Planificar cambios
terraform plan -var-file="environments/dev/terraform.tfvars"

# Aplicar cambios
terraform apply -var-file="environments/dev/terraform.tfvars"
```

## ⚙️ Configuración

### Variables de Ambiente

Edita los archivos en `environments/{env}/terraform.tfvars`:

```hcl
# Configuración básica
environment = "dev"
aws_region  = "us-east-1"

# Dominio (opcional para dev)
domain_name     = "reevent.awscommunity.com"
certificate_arn = "arn:aws:acm:us-east-1:123456789:certificate/xxx"

# OAuth (opcional)
google_client_id     = "your-google-client-id"
google_client_secret = "your-google-client-secret"
```

### Variables Sensibles

Para variables sensibles, usa variables de entorno:

```bash
export TF_VAR_google_client_secret="your-secret"
export TF_VAR_linkedin_client_secret="your-secret"
```

## 🔧 Módulos

### Database Module

Crea una tabla DynamoDB con:
- Single table design
- GSI para consultas optimizadas
- Backup automático en producción
- Encriptación habilitada

### Auth Module

Configura Cognito con:
- User Pool con atributos personalizados
- OAuth providers (Google, LinkedIn)
- Políticas de contraseña
- Dominio personalizado

### API Module

Despliega:
- Lambda functions para cada handler
- API Gateway con CORS
- Authorizer de Cognito
- IAM roles y políticas

### Frontend Module

Configura:
- S3 bucket para hosting
- CloudFront distribution
- Certificado SSL/TLS
- Invalidación automática de cache

## 📊 Outputs

Después del despliegue, obtienes:

```bash
terraform output
```

- `api_gateway_url`: URL de la API
- `cloudfront_distribution_url`: URL del frontend
- `user_pool_id`: ID del User Pool de Cognito
- `user_pool_client_id`: ID del cliente de Cognito
- `dynamodb_table_name`: Nombre de la tabla DynamoDB

## 🔍 Troubleshooting

### Error: Bucket already exists
```bash
# El nombre del bucket debe ser único globalmente
# Cambia el sufijo en el módulo frontend o usa un nombre diferente
```

### Error: Certificate not found
```bash
# Asegúrate de que el certificado ACM esté en us-east-1 para CloudFront
# O deja certificate_arn vacío para usar el certificado por defecto
```

### Error: Lambda deployment package too large
```bash
# Asegúrate de que las dependencias estén en el layer
# Verifica que el build de Lambda sea correcto
```

## 🔄 CI/CD

Para integrar con GitHub Actions:

```yaml
- name: Deploy Infrastructure
  run: |
    cd terraform
    ./deploy.sh -e ${{ github.ref == 'refs/heads/main' && 'prod' || 'dev' }} -a apply -y
```

## 🛡️ Seguridad

- Todas las comunicaciones usan HTTPS
- DynamoDB encriptado en reposo
- IAM roles con permisos mínimos
- Cognito con políticas de contraseña robustas
- S3 buckets con acceso controlado

## 💰 Costos

Estimación mensual por ambiente:

- **Dev**: ~$10-20 USD
- **Prod**: ~$50-100 USD (dependiendo del tráfico)

Principales componentes de costo:
- Lambda invocations
- API Gateway requests
- CloudFront data transfer
- DynamoDB read/write units