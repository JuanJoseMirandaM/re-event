# Naming Convention

## Estructura Estándar
Todos los recursos siguen el patrón: `${var.project_name}-${resource_type}-${var.environment}`

## Recursos por Módulo

### Auth Module
- **IAM Role**: `${var.project_name}-auth-lambda-role-${var.environment}`
- **IAM Policy**: `${var.project_name}-auth-dynamodb-write-${var.environment}`
- **Lambda Function**: `${var.project_name}-auth-post-confirmation-${var.environment}`
- **Cognito User Pool**: `${var.project_name}-user-pool-${var.environment}`
- **Cognito Client**: `${var.project_name}-spa-client-${var.environment}`
- **Cognito Domain**: `${var.project_name}-auth-${var.environment}`

### API Module
- **IAM Role**: `${var.project_name}-api-lambda-role-${var.environment}`
- **IAM Policy**: `${var.project_name}-api-dynamodb-policy-${var.environment}`
- **Lambda Functions**: `${var.project_name}-{function-name}-${var.environment}`
- **API Gateway**: `${var.project_name}-api-${var.environment}`

### Database Module
- **DynamoDB Table**: `${var.project_name}-users-${var.environment}`

## Variables Requeridas
Todos los módulos requieren:
- `project_name`: Nombre del proyecto (configurable)
- `environment`: Entorno (dev, staging, prod)
- `common_tags`: Tags comunes para todos los recursos

## Beneficios
- **Flexibilidad**: Fácil cambio de nombre del proyecto
- **Consistencia**: Naming uniforme en todos los recursos
- **Organización**: Fácil identificación por entorno y módulo
- **Escalabilidad**: Preparado para múltiples entornos