# 📷 Componente de Subida de Imágenes

## 🎯 Descripción

Componente Angular que permite a los usuarios subir múltiples imágenes mediante drag & drop o selección manual. Las imágenes se suben a AWS S3 usando URLs presignadas para reconocimiento facial con AWS Rekognition.

## ✨ Características

- **Drag & Drop**: Arrastra hasta 50 imágenes simultáneamente
- **Selección Manual**: Haz clic para abrir el selector de archivos
- **Validación**: Solo acepta JPG, PNG, GIF, WEBP (máximo 10MB cada una)
- **Progreso en Tiempo Real**: Barra de progreso individual y general
- **Reintentos**: Posibilidad de reintentar subidas fallidas
- **Gestión de Estado**: Estados visuales (pendiente, subiendo, exitoso, error)

## 🔧 Flujo de Funcionamiento

### 1. Generación de URL Presignada
```typescript
POST https://xn9xm38ind.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url
Content-Type: application/json
Authorization: Bearer <jwt_token>

{
  "fileName": "imagen.jpg",
  "type": "to-rekognize"
}
```

**Respuesta:**
```json
{
  "uploadUrl": "https://s3-presigned-url...",
  "s3Key": "path/to/file.jpg",
  "type": "to-rekognize"
}
```

### 2. Subida a S3
```typescript
PUT <uploadUrl>
Content-Type: image/jpeg

<binary-image-data>
```

## 📱 Interfaz de Usuario

### Estados de las Imágenes
- **⏳ Pendiente**: Imagen seleccionada, esperando subida
- **📤 Subiendo**: Imagen en proceso de subida con progreso
- **✅ Exitosa**: Imagen subida correctamente
- **❌ Error**: Error en la subida con opción de reintento

### Acciones Disponibles
- **📤 Subir Todo**: Sube todas las imágenes pendientes
- **🗑️ Limpiar**: Elimina todas las imágenes de la lista
- **🔄 Reintentar**: Reintenta subir una imagen que falló
- **❌ Eliminar**: Elimina una imagen específica de la lista

## 🛠️ Servicios Utilizados

### ImageUploadService
- `generatePresignedUrl(fileName: string)`: Genera URL presignada
- `uploadFileToS3(file: File, uploadUrl: string)`: Sube archivo a S3
- `uploadSingleImage(file: File)`: Proceso completo para una imagen
- `uploadMultipleImages(files: File[])`: Proceso para múltiples imágenes
- `validateImageFile(file: File)`: Valida tipo y tamaño de archivo

### AuthService
- `getAuthToken()`: Obtiene el JWT token para autenticación

## 📋 Validaciones

### Tipos de Archivo Permitidos
- `image/jpeg` (.jpg, .jpeg)
- `image/png` (.png)
- `image/gif` (.gif)
- `image/webp` (.webp)

### Límites
- **Máximo archivos**: 50 imágenes por sesión
- **Tamaño máximo**: 10MB por imagen
- **Tipos permitidos**: Solo imágenes

## 🎨 Estilos y Responsive

### Clases CSS Principales
- `.drag-drop-area`: Área de drag & drop con estados hover y drag-over
- `.image-item`: Contenedor de cada imagen con estados visuales
- `.progress-bar`: Barras de progreso con animaciones
- `.action-btn`: Botones de acción con efectos hover

### Responsive Design
- **Mobile**: Layout vertical, botones más grandes
- **Desktop**: Layout horizontal optimizado
- **Tablet**: Adaptación intermedia

## 🔄 Estados del Componente

### Signals Utilizados
```typescript
images = signal<ImageFile[]>([]);           // Lista de imágenes
isDragOver = signal(false);                 // Estado drag & drop
isUploading = signal(false);                // Estado de subida general
uploadProgress = signal(0);                 // Progreso general (0-100)
```

### Computed Properties
```typescript
totalImages = computed(() => this.images().length);
successfulUploads = computed(() => /* exitosas */);
failedUploads = computed(() => /* fallidas */);
pendingUploads = computed(() => /* pendientes */);
```

## 🚀 Integración

### Routing
```typescript
// app.routes.ts
{
  path: 'images',
  loadComponent: () => import('./features/image-upload/image-upload.component')
}
```

### Footer Navigation
```html
<button class="re-btn flex flex--col" routerLink="./images">
  <span class="text-2xl re-icon-footer re-icon-photo"></span>
  <span class="text-sm">Fotos</span>
</button>
```

## 🔐 Seguridad

- **Autenticación**: Requiere JWT token válido
- **Validación**: Tipos de archivo y tamaño en frontend y backend
- **URLs Presignadas**: Acceso temporal y seguro a S3
- **Metadatos**: Información de tipo y nombre original en S3

## 📊 Métricas y Monitoreo

### Eventos Trackeable
- Número de imágenes subidas por usuario
- Tipos de archivo más utilizados
- Errores de subida más comunes
- Tiempo promedio de subida

### Logs Importantes
- Errores de generación de URL presignada
- Errores de subida a S3
- Validaciones fallidas
- Progreso de subidas

## 🐛 Troubleshooting

### Errores Comunes

#### "Tipo de archivo no válido"
- **Causa**: Archivo no es imagen o tipo no soportado
- **Solución**: Usar solo JPG, PNG, GIF, WEBP

#### "El archivo es demasiado grande"
- **Causa**: Imagen supera 10MB
- **Solución**: Comprimir imagen antes de subir

#### "Error al generar URL de subida"
- **Causa**: Problema con API o autenticación
- **Solución**: Verificar token JWT y conectividad

#### "Error al subir a S3"
- **Causa**: URL expirada o problema de red
- **Solución**: Reintentar subida (genera nueva URL)

## 🔄 Próximas Mejoras

- [ ] Compresión automática de imágenes
- [ ] Preview mejorado con zoom
- [ ] Subida en background con Service Worker
- [ ] Galería de imágenes subidas
- [ ] Filtros y efectos básicos
- [ ] Integración con AWS Rekognition para mostrar resultados
- [ ] Notificaciones push cuando termine el procesamiento

## 📚 Dependencias

```json
{
  "@angular/common": "^17.x",
  "@angular/core": "^17.x",
  "rxjs": "^7.x",
  "aws-amplify": "^6.x"
}
```

## 🧪 Testing

### Unit Tests
```bash
ng test --include="**/image-upload/**"
```

### E2E Tests
```bash
ng e2e --spec="image-upload.e2e-spec.ts"
```

### Manual Testing Checklist
- [ ] Drag & drop funciona correctamente
- [ ] Validación de tipos de archivo
- [ ] Validación de tamaño de archivo
- [ ] Progreso de subida se muestra
- [ ] Reintentos funcionan
- [ ] Eliminación de imágenes
- [ ] Responsive en móvil y desktop
- [ ] Estados visuales correctos