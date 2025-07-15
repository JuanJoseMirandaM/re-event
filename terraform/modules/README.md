# Terraform Modules

## Estructura Uniforme

Todos los módulos siguen la misma estructura organizacional:

### Archivos Estándar
- `variables.tf` - Variables de entrada del módulo
- `outputs.tf` - Outputs del módulo
- `data.tf` - Data sources y generación automática de ZIPs
- `iam.tf` - Roles y políticas IAM

### Archivos Específicos por Módulo

#### Auth Module
- `main.tf` - Documentación del módulo
- `cognito.tf` - Recursos de Cognito
- `lambda.tf` - Funciones Lambda

#### API Module
- `api-gateway.tf` - API Gateway y recursos
- `user-lambdas.tf` - Funciones Lambda de usuarios

#### Database Module
- `main.tf` - Recursos de DynamoDB

## Generación Automática de ZIPs

Todos los módulos que usan Lambda functions generan automáticamente los archivos ZIP usando `data.archive_file` en `data.tf`, eliminando la necesidad de generar ZIPs manualmente.

## Convenciones de Naming

- Recursos: `${var.project_name}-${resource_type}-${var.environment}`
- IAM Roles: `${var.project_name}Role-${var.environment}`
- Lambda Functions: `${var.environment}-${function_name}`