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

Todos los módulos que usan Lambda functions utilizan archivos ZIP pre-generados usando el script `build-all.sh` en el directorio `backend/lambdas/`, lo que mejora la performance del despliegue y reduce la complejidad de Terraform.

## Convenciones de Naming

- Recursos: `${var.project_name}-${resource_type}-${var.environment}`
- IAM Roles: `${var.project_name}Role-${var.environment}`
- Lambda Functions: `${var.environment}-${function_name}`