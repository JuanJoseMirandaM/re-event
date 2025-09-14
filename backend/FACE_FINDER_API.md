# 📋 **Flujo FaceFinder - Guía Completa**

## 🔄 **Flujo A: Procesamiento Batch (Subir imágenes para análisis)**

### **1. Obtener URL pre-firmada**
```
POST https://{API_GATEWAY_ID}.execute-api.{AWS_REGION}.amazonaws.com/{ENVIRONMENT}/generate-presigned-batch
```
**Cuándo:** Antes de subir cada imagen  
**Para qué:** Obtener URL segura para subir a S3

### **2. Subir imagen a S3**
```
PUT [presigned_url_obtenida]
```
**Destino:** `s3://{S3_BUCKET_NAME}/private/[uuid]/imagen.jpg`

### **3. Procesamiento automático** (sin llamadas manuales)
```
S3 → SQS → save_and_analyze → brand_and_publish
```
**Resultado:** Imagen con watermark en `/share/` y thumbnail en `/thumbnails/`

---

## 🔍 **Flujo B: Búsqueda por rostro**

### **1. Obtener URL pre-firmada**
```
POST https://{API_GATEWAY_ID}.execute-api.{AWS_REGION}.amazonaws.com/{ENVIRONMENT}/generate-presigned-search
```

### **2. Subir imagen de búsqueda**
```
PUT [presigned_url_obtenida]
```
**Destino:** `s3://{S3_BUCKET_NAME}/face-scans/[uuid]/imagen.jpg`

### **3. Buscar rostros similares**
```
POST https://{API_GATEWAY_ID}.execute-api.{AWS_REGION}.amazonaws.com/{ENVIRONMENT}/search-by-face
Body: { "image_key": "face-scans/uuid/imagen.jpg" }
```

---

## 📊 **Flujo C: Consultar resultados**

### **Obtener rostros paginados**
```
GET https://{API_GATEWAY_ID}.execute-api.{AWS_REGION}.amazonaws.com/{ENVIRONMENT}/get-faces/{page}/{size}
```
**Ejemplo:** `/get-faces/1/20` (página 1, 20 elementos)

### **Ver imágenes procesadas**
```
https://{CLOUDFRONT_DOMAIN}/share/[uuid]/imagen.jpg
https://{CLOUDFRONT_DOMAIN}/share/[uuid]/thumbnail.webp
```

---

## 📡 **Endpoints Disponibles**

| Endpoint | Método | Propósito | Flujo |
|----------|--------|-----------|-------|
| `/generate-presigned-batch` | POST | URL para subir imágenes batch | A |
| `/generate-presigned-search` | POST | URL para subir imagen búsqueda | B |
| `/search-by-face` | POST | Buscar rostros similares | B |
| `/get-faces/{page}/{size}` | GET | Obtener rostros paginados | C |

---

## 🏗️ **Infraestructura**

### **Recursos principales:**
- **API Gateway:** `https://{API_GATEWAY_ID}.execute-api.{AWS_REGION}.amazonaws.com/{ENVIRONMENT}`
- **CloudFront:** `https://{CLOUDFRONT_DOMAIN}`
- **S3 Bucket:** `{PROJECT_NAME}-{EVENT_NAME}-{ENVIRONMENT}`
- **DynamoDB:** `{PROJECT_NAME}-metadata-{ENVIRONMENT}`
- **Rekognition Collection:** `{PROJECT_NAME}-faces-{ENVIRONMENT}`
- **SQS Queue:** `{PROJECT_NAME}-batch-queue-{ENVIRONMENT}`

### **Lambda Functions:**
- `{PROJECT_NAME}-save-analyze-{ENVIRONMENT}` (15 min timeout)
- `{PROJECT_NAME}-brand-publish-{ENVIRONMENT}` (5 min timeout, 1024MB)
- `{PROJECT_NAME}-search-by-face-{ENVIRONMENT}` (30s timeout)
- `{PROJECT_NAME}-presigned-batch-{ENVIRONMENT}` (30s timeout)
- `{PROJECT_NAME}-presigned-search-{ENVIRONMENT}` (30s timeout)
- `{PROJECT_NAME}-getPaginatedItems-{ENVIRONMENT}` (60s timeout)

---

## 🔧 **Variables por Entorno**

### **Desarrollo (dev):**
```bash
API_GATEWAY_ID="{terraform output api_gateway_id}"
CLOUDFRONT_DOMAIN="{terraform output cloudfront_domain_name}"
S3_BUCKET_NAME="{terraform output s3_bucket_name}"
AWS_REGION="us-east-1"
ENVIRONMENT="dev"
PROJECT_NAME="facefinder"
EVENT_NAME="amazon-community-bolivia-2025"
```

### **Staging:**
```bash
ENVIRONMENT="staging"
# Resto de variables iguales pero con recursos de staging
```

### **Producción:**
```bash
ENVIRONMENT="prod"
# Resto de variables iguales pero con recursos de producción
```

---

## 📋 **Obtener Variables Reales**

```bash
# Obtener outputs de Terraform
terraform output -var-file="environments/{ENVIRONMENT}/terraform.tfvars"

# Variables específicas
terraform output api_gateway_url
terraform output cloudfront_url
terraform output s3_bucket_name
```
