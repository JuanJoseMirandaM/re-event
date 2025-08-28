# 🔍 Búsqueda Facial - Face Search

## 🎯 Descripción

Componente Angular que permite a los usuarios subir una imagen y buscar caras similares usando AWS Rekognition. La funcionalidad incluye subida de imágenes a S3 con tipo "face-scans" y búsqueda en una colección de caras.

## ✨ Características

- **Selección de Imagen**: Drag & drop o selección manual de una sola imagen
- **Validación**: Solo acepta JPG y PNG (máximo 10MB)
- **Proceso Completo**: URL presignada → Subida a S3 → Búsqueda facial
- **Resultados Detallados**: Muestra coincidencias con porcentaje de similitud
- **Debug Panel**: Herramientas de prueba para conexión y endpoints

## 🔄 Flujo de Funcionamiento

### 1. Generación de URL Presignada
```typescript
POST /presigned-api/generate-presigned-url
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "fileName": "scan.jpeg",
  "type": "face-scans"
}
```

**Respuesta:**
```json
{
  "uploadUrl": "https://facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com/face-scans/...",
  "s3Key": "face-scans/af3e587e-a81e-455e-a449-9f566fe5f776/fileName.jpeg",
  "type": "face-scans"
}
```

### 2. Subida de Imagen a S3
```typescript
PUT <uploadUrl>
Content-Type: image/jpeg
<binary-image-data>
```

### 3. Búsqueda Facial
```typescript
POST https://9mszstbuql.execute-api.us-east-1.amazonaws.com/dev/search-by-face
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "data": {
    "bucket": "facefinder-amazon-community-bolivia-2025-dev",
    "key": "face-scans/af3e587e-a81e-455e-a449-9f566fe5f776/fileName.jpeg",
    "collection_id": "facefinder-faces-dev"
  }
}
```

## 📱 Interfaz de Usuario

### Estados de la Aplicación
- **🔍 Selección**: Área de drag & drop para seleccionar imagen
- **📤 Procesando**: Indicador de progreso con pasos
- **🎯 Resultados**: Muestra coincidencias encontradas
- **❌ Error**: Manejo de errores con mensajes descriptivos

### Información Mostrada
- **Configuración**: Bucket y Collection ID visibles
- **Progreso**: Pasos del proceso (1/3, 2/3, 3/3)
- **Coincidencias**: Lista de caras similares con porcentaje
- **Metadatos**: S3 Key, External Image ID, etc.

## 🛠️ Servicios Utilizados

### FaceSearchService
- `generateFaceScanUrl(fileName: string)`: Genera URL presignada para face-scans
- `uploadFaceScanImage(file: File, uploadUrl: string)`: Sube imagen a S3
- `searchByFace(s3Key: string)`: Busca caras similares
- `uploadAndSearchFace(file: File)`: Proceso completo
- `validateImageFile(file: File)`: Valida tipo y tamaño

### Configuración
```typescript
private readonly BUCKET_NAME = 'facefinder-amazon-community-bolivia-2025-dev';
private readonly COLLECTION_ID = 'facefinder-faces-dev';
```

## 📋 Validaciones

### Tipos de Archivo Permitidos
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)

### Límites
- **Máximo archivos**: 1 imagen por búsqueda
- **Tamaño máximo**: 10MB por imagen
- **Tipos permitidos**: Solo JPG y PNG

## 🎨 Estilos y Responsive

### Clases CSS Principales
- `.upload-area`: Área de drag & drop con estados hover y drag-over
- `.selected-image-container`: Contenedor de imagen seleccionada
- `.preview-image`: Preview de 96x96px con overlay
- `.spinner`: Indicador de carga animado

### Estados Visuales
- **Selección**: Área de drag & drop azul
- **Procesando**: Spinner con pasos del progreso
- **Éxito**: Fondo verde con resultados
- **Error**: Fondo rojo con mensaje de error

## 🔧 Configuración del Proxy

### Proxy Actualizado
```json
{
  "/presigned-api": {
    "target": "https://9mszstbuql.execute-api.us-east-1.amazonaws.com/dev"
  },
  "/s3-upload": {
    "target": "https://facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com"
  },
  "/cloudfront": {
    "target": "https://dba4r74x5p882.cloudfront.net"
  }
}
```

## 🔄 Integración

### Routing
```typescript
// app.routes.ts
{
  path: 'face-search',
  loadComponent: () => import('./features/face-search/face-search.component')
}
```

### Footer Navigation
```html
<button class="re-btn flex flex--col" routerLink="./face-search">
  <span class="text-2xl">🔍</span>
  <span class="text-sm">Buscar</span>
</button>
```

## 🔐 Seguridad

- **Autenticación**: Requiere JWT token válido
- **Validación**: Tipos de archivo y tamaño en frontend
- **URLs Presignadas**: Acceso temporal y seguro a S3
- **Metadatos**: Información de tipo y nombre original en S3

## 📊 Estructura de Respuesta

### Respuesta Exitosa
```json
{
  "success": true,
  "uploadResult": { /* datos de subida */ },
  "searchResult": {
    "FaceMatches": [
      {
        "Similarity": 95.5,
        "Face": {
          "ExternalImageId": "person-123",
          "FaceId": "face-456",
          "BoundingBox": { /* coordenadas */ }
        }
      }
    ]
  },
  "s3Key": "face-scans/uuid/filename.jpg"
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

## 🧪 Pruebas Incluidas

### Panel de Debug
- **🧪 Test Conexión**: Prueba generación de URL presignada
- **🔍 Test Search API**: Prueba endpoint de búsqueda con key de prueba

### Logging Completo
```bash
🚀 Iniciando proceso completo de búsqueda facial para: imagen.jpg
📤 Paso 1/3: URL presignada obtenida
📤 Paso 2/3: Imagen subida exitosamente
🔍 Paso 3/3: Iniciando búsqueda facial
🎉 Proceso completo exitoso
```

## 🔍 Casos de Uso

### Búsqueda Exitosa
1. Usuario selecciona imagen con cara
2. Sistema sube imagen a S3
3. Rekognition encuentra caras similares
4. Muestra resultados con porcentajes de similitud

### Sin Coincidencias
1. Usuario selecciona imagen
2. Sistema procesa correctamente
3. No encuentra caras similares
4. Muestra mensaje informativo

### Manejo de Errores
1. Imagen inválida → Validación frontend
2. Error de subida → Mensaje de error S3
3. Error de búsqueda → Mensaje de error Rekognition
4. Sin conexión → Error de red

## 🚀 Próximas Mejoras

- [ ] Soporte para múltiples caras en una imagen
- [ ] Filtros de similitud mínima
- [ ] Historial de búsquedas
- [ ] Exportar resultados
- [ ] Integración con galería de fotos
- [ ] Búsqueda por lotes
- [ ] Análisis de emociones faciales

## 📚 Dependencias

```json
{
  "@angular/common": "^17.x",
  "@angular/core": "^17.x",
  "rxjs": "^7.x"
}
```

## 🧪 Testing

### Flujo de Prueba Manual
1. Ve a la pestaña "Buscar" 🔍
2. Haz clic en "🧪 Test Conexión"
3. Haz clic en "🔍 Test Search API"
4. Selecciona una imagen con cara
5. Haz clic en "🔍 Buscar Caras Similares"
6. Verifica resultados o errores

### Casos de Prueba
- [ ] Subida de imagen JPG válida
- [ ] Subida de imagen PNG válida
- [ ] Rechazo de archivo no válido
- [ ] Manejo de imagen sin caras
- [ ] Manejo de errores de red
- [ ] Respuesta con múltiples coincidencias
- [ ] Respuesta sin coincidencias