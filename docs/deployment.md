# Guía de Despliegue - re:Event

## 🚀 Prerrequisitos

### Herramientas Necesarias
- **Node.js** 18.x o superior
- **AWS CLI** v2 configurado
- **AWS CDK** v2.x
- **Git** para control de versiones
- **Docker** (opcional, para desarrollo local)

### Configuración AWS
```bash
# Configurar credenciales AWS
aws configure

# Verificar configuración
aws sts get-caller-identity

# Bootstrap CDK (solo primera vez)
cdk bootstrap aws://ACCOUNT-ID/REGION
```

## 📁 Estructura del Proyecto

```
re:Event/
├── frontend/                 # Aplicación PWA
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── build/               # Build artifacts
├── backend/                 # Lambda functions
│   ├── src/
│   │   ├── handlers/        # API handlers
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utilities
│   └── package.json
├── infrastructure/          # AWS CDK
│   ├── lib/
│   │   ├── auth-stack.ts
│   │   ├── database-stack.ts
│   │   ├── api-stack.ts
│   │   └── frontend-stack.ts
│   ├── bin/app.ts
│   └── cdk.json
└── docs/                    # Documentación
```

## 🏗️ Configuración de Infraestructura

### 1. Clonar y Configurar Proyecto
```bash
git clone https://github.com/aws-community/re-event.git
cd re-event

# Instalar dependencias
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
cd infrastructure && npm install && cd ..
```

### 2. Variables de Entorno
Crear archivo `.env` en la raíz:

```bash
# Configuración general
STAGE=dev
AWS_REGION=us-east-1
PROJECT_NAME=re-event

# Dominio (opcional)
DOMAIN_NAME=reevent.awscommunity.com
CERTIFICATE_ARN=arn:aws:acm:us-east-1:123456789:certificate/xxx

# Configuración de notificaciones
ADMIN_EMAIL=admin@awscommunity.com

# Configuración de OAuth (opcional)
GOOGLE_CLIENT_ID=your-google-client-id
LINKEDIN_CLIENT_ID=your-linkedin-client-id
```

### 3. Desplegar Infraestructura
```bash
cd infrastructure

# Verificar cambios
cdk diff

# Desplegar todos los stacks
cdk deploy --all

# O desplegar stack por stack
cdk deploy ReEventAuthStack
cdk deploy ReEventDatabaseStack
cdk deploy ReEventApiStack
cdk deploy ReEventFrontendStack
```

## 🔧 Configuración por Ambiente

### Desarrollo (dev)
```bash
# Variables específicas de desarrollo
export STAGE=dev
export DEBUG=true
export LOG_LEVEL=debug

# Desplegar
cdk deploy --all --context stage=dev
```

### Staging (staging)
```bash
# Variables específicas de staging
export STAGE=staging
export DEBUG=false
export LOG_LEVEL=info

# Desplegar
cdk deploy --all --context stage=staging
```

### Producción (prod)
```bash
# Variables específicas de producción
export STAGE=prod
export DEBUG=false
export LOG_LEVEL=warn
export ENABLE_MONITORING=true

# Desplegar con confirmación
cdk deploy --all --context stage=prod --require-approval=broadening
```

## 📱 Despliegue del Frontend

### Build Local
```bash
cd frontend

# Instalar dependencias
npm install

# Instalar Angular CLI globalmente
npm install -g @angular/cli

# Desarrollo con PWA
ng serve

# Build para desarrollo
ng build --configuration=development

# Build para producción con PWA
ng build --configuration=production

# Preview local
ng serve --configuration=production
```

### Despliegue Automático
El frontend se despliega automáticamente con el CDK stack:

```typescript
// infrastructure/lib/frontend-stack.ts
const distribution = new CloudFrontDistribution(this, 'Distribution', {
  defaultBehavior: {
    origin: new S3Origin(bucket),
    viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    cachePolicy: CachePolicy.CACHING_OPTIMIZED,
  },
  defaultRootObject: 'index.html',
  errorResponses: [
    {
      httpStatus: 404,
      responseHttpStatus: 200,
      responsePagePath: '/index.html',
    },
  ],
});
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy re:Event

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd frontend && npm install
          cd ../backend && npm install
          cd ../infrastructure && npm install
      
      - name: Run tests
        run: |
          cd frontend && npm test
          cd ../backend && npm test
      
      - name: Build frontend
        run: cd frontend && npm run build

  deploy-dev:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to dev
        run: |
          cd infrastructure
          npm install
          npx cdk deploy --all --context stage=dev --require-approval=never

  deploy-prod:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID_PROD }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY_PROD }}
          aws-region: us-east-1
      
      - name: Deploy to production
        run: |
          cd infrastructure
          npm install
          npx cdk deploy --all --context stage=prod --require-approval=never
```

## 🗄️ Configuración de Base de Datos

### Inicialización de DynamoDB
```bash
# Script para poblar datos iniciales
cd backend
npm run seed:dev

# O manualmente
aws dynamodb put-item \
  --table-name re-event-dev \
  --item '{
    "PK": {"S": "SESSION#session-001"},
    "SK": {"S": "INFO"},
    "title": {"S": "Introducción a Serverless"},
    "speaker": {"S": "Ana Martínez"},
    "startTime": {"S": "2025-03-15T09:00:00Z"},
    "endTime": {"S": "2025-03-15T10:00:00Z"},
    "location": {"S": "Auditorio Principal"}
  }'
```

### Backup y Restauración
```bash
# Habilitar backup automático
aws dynamodb put-backup-policy \
  --table-name re-event-prod \
  --backup-policy BackupEnabled=true

# Crear backup manual
aws dynamodb create-backup \
  --table-name re-event-prod \
  --backup-name re-event-backup-$(date +%Y%m%d)
```

## 🔐 Configuración de Cognito

### Configuración OAuth
```bash
# Configurar proveedores OAuth en Cognito
aws cognito-idp create-identity-provider \
  --user-pool-id us-east-1_XXXXXXXXX \
  --provider-name Google \
  --provider-type Google \
  --provider-details '{
    "client_id": "your-google-client-id",
    "client_secret": "your-google-client-secret",
    "authorize_scopes": "email openid profile"
  }'
```

### Códigos de Verificación
```bash
# Script para generar códigos únicos
cd backend
npm run generate-codes -- --role ATTENDEE --count 100
npm run generate-codes -- --role SPEAKER --count 20
npm run generate-codes -- --role SPONSOR --count 10
```

## 📊 Monitoreo y Logs

### CloudWatch Dashboards
```bash
# Crear dashboard personalizado
aws cloudwatch put-dashboard \
  --dashboard-name "re-event-monitoring" \
  --dashboard-body file://monitoring/dashboard.json
```

### Alertas
```bash
# Crear alarma para errores de API
aws cloudwatch put-metric-alarm \
  --alarm-name "re-event-api-errors" \
  --alarm-description "API Gateway 5xx errors" \
  --metric-name 5XXError \
  --namespace AWS/ApiGateway \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## 🧪 Testing

### Tests Unitarios
```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test

# Coverage
npm run test:coverage
```

### Tests de Integración
```bash
# Tests end-to-end
cd e2e-tests
npm install
npm run test:dev
npm run test:prod
```

### Load Testing
```bash
# Usando Artillery
npm install -g artillery
artillery run load-tests/api-load-test.yml
```

## 🔧 Troubleshooting

### Problemas Comunes

#### Error: Stack no existe
```bash
# Verificar stacks existentes
cdk list

# Recrear stack
cdk destroy ReEventApiStack
cdk deploy ReEventApiStack
```

#### Error: Permisos insuficientes
```bash
# Verificar permisos IAM
aws iam get-user
aws sts get-caller-identity

# Verificar políticas adjuntas
aws iam list-attached-user-policies --user-name your-username
```

#### Error: Límites de recursos
```bash
# Verificar límites de servicio
aws service-quotas get-service-quota \
  --service-code lambda \
  --quota-code L-B99A9384

# Solicitar aumento de límite si es necesario
```

### Logs y Debugging
```bash
# Ver logs de Lambda
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/re-event"

# Seguir logs en tiempo real
aws logs tail /aws/lambda/re-event-api-handler --follow

# Buscar errores específicos
aws logs filter-log-events \
  --log-group-name "/aws/lambda/re-event-api-handler" \
  --filter-pattern "ERROR"
```

## 🔄 Rollback

### Rollback de Infraestructura
```bash
# Ver historial de deployments
cdk diff

# Rollback a versión anterior
git checkout previous-working-commit
cdk deploy --all
```

### Rollback de Frontend
```bash
# Rollback usando S3 versioning
aws s3api list-object-versions \
  --bucket re-event-frontend-prod \
  --prefix index.html

# Restaurar versión anterior
aws s3api copy-object \
  --copy-source re-event-frontend-prod/index.html?versionId=VERSION_ID \
  --bucket re-event-frontend-prod \
  --key index.html
```

## 📋 Checklist de Despliegue

### Pre-despliegue
- [ ] Tests unitarios pasando
- [ ] Tests de integración pasando
- [ ] Variables de entorno configuradas
- [ ] Credenciales AWS válidas
- [ ] Backup de base de datos creado

### Post-despliegue
- [ ] Verificar endpoints de API
- [ ] Probar autenticación
- [ ] Verificar notificaciones push
- [ ] Comprobar procesamiento de imágenes
- [ ] Validar métricas en CloudWatch
- [ ] Probar funcionalidades críticas

### Rollback Plan
- [ ] Procedimiento de rollback documentado
- [ ] Backup de configuración anterior
- [ ] Contactos de emergencia disponibles
- [ ] Monitoreo activo post-despliegue