# Reconocimiento Facial - re:Event

## 🎯 Objetivo

Implementar un sistema de reconocimiento facial que permita a los asistentes del AWS Community Day Bolivia encontrar automáticamente las fotos donde aparecen, mejorando la experiencia de compartir recuerdos del evento.

## 🔍 Funcionalidades

### Para Asistentes
- **Registro Facial**: Tomar una foto de perfil para indexación
- **Búsqueda Automática**: Encontrar todas las fotos donde aparecen
- **Galería Personal**: Ver solo sus fotos del evento
- **Notificaciones**: Recibir alertas cuando aparezcan en nuevas fotos
- **Privacidad**: Optar por no participar en el reconocimiento

### Para Organizadores
- **Análisis de Participación**: Ver qué asistentes aparecen más en fotos
- **Estadísticas del Evento**: Métricas de engagement visual
- **Moderación**: Revisar y aprobar fotos antes de publicar
- **Gestión de Privacidad**: Manejar solicitudes de exclusión

## 🏗️ Arquitectura Técnica

### Componentes AWS
- **AWS Rekognition**: Detección y reconocimiento facial
- **S3**: Almacenamiento de fotos originales y procesadas
- **DynamoDB**: Metadatos de fotos y índice de rostros
- **Lambda**: Procesamiento automático de imágenes
- **SQS**: Cola de procesamiento asíncrono
- **SNS**: Notificaciones a usuarios

### Flujo de Procesamiento

```
📱 Usuario sube foto
    ↓
🪣 S3 almacena imagen original
    ↓
⚡ Lambda trigger automático
    ↓
🔍 Rekognition detecta caras
    ↓
📊 DynamoDB guarda metadatos
    ↓
🔔 SNS notifica a usuarios encontrados
```

## 📋 Casos de Uso

### UC-001: Registro Facial Inicial
**Actor**: Asistente  
**Descripción**: Usuario registra su rostro para reconocimiento  
**Flujo Principal**:
1. Usuario accede a "Mi Perfil"
2. Selecciona "Configurar Reconocimiento Facial"
3. Toma foto con cámara frontal
4. Sistema procesa y crea índice facial
5. Confirma registro exitoso

**Postcondición**: Rostro indexado en Rekognition

### UC-002: Subida de Foto con Reconocimiento
**Actor**: Cualquier usuario verificado  
**Descripción**: Subir foto que se procesa automáticamente  
**Flujo Principal**:
1. Usuario selecciona foto desde galería/cámara
2. Sistema sube a S3
3. Lambda procesa imagen:
   - Agrega logo del evento
   - Detecta rostros con Rekognition
   - Busca coincidencias en índice
4. Guarda metadatos en DynamoDB
5. Notifica a usuarios identificados

**Postcondición**: Foto procesada y usuarios notificados

### UC-003: Búsqueda de Mis Fotos
**Actor**: Asistente  
**Descripción**: Ver todas las fotos donde aparece  
**Flujo Principal**:
1. Usuario accede a "Mis Fotos del Evento"
2. Sistema consulta DynamoDB por su face_id
3. Muestra galería personalizada
4. Usuario puede descargar o compartir fotos

**Postcondición**: Usuario ve sus fotos del evento

### UC-004: Gestión de Privacidad
**Actor**: Asistente  
**Descripción**: Controlar participación en reconocimiento  
**Flujo Principal**:
1. Usuario accede a configuración de privacidad
2. Puede optar por:
   - Desactivar reconocimiento facial
   - Eliminar rostro del índice
   - Bloquear notificaciones
3. Sistema actualiza preferencias

**Postcondición**: Preferencias de privacidad actualizadas

## 🔧 Implementación Técnica

### Modelo de Datos DynamoDB

#### Tabla: FaceIndex
```json
{
  "PK": "FACE#userId",
  "SK": "INDEX",
  "faceId": "rekognition-face-id",
  "userId": "user-email",
  "imageUrl": "s3://bucket/profile-photos/user.jpg",
  "confidence": 99.5,
  "createdAt": "2025-03-15T10:00:00Z",
  "active": true
}
```

#### Tabla: PhotoMetadata
```json
{
  "PK": "PHOTO#photoId",
  "SK": "METADATA",
  "photoId": "photo-uuid",
  "uploadedBy": "user-email",
  "s3Key": "photos/2025/03/15/photo.jpg",
  "processedUrl": "s3://bucket/processed/photo.jpg",
  "detectedFaces": [
    {
      "faceId": "rekognition-face-id",
      "userId": "user-email",
      "confidence": 95.2,
      "boundingBox": {
        "left": 0.1,
        "top": 0.2,
        "width": 0.3,
        "height": 0.4
      }
    }
  ],
  "tags": ["networking", "keynote"],
  "uploadedAt": "2025-03-15T14:30:00Z"
}
```

### Lambda Functions

#### 1. Face Registration Handler
```typescript
export const registerFace = async (event: APIGatewayEvent) => {
  const { userId, imageBase64 } = JSON.parse(event.body);
  
  // Upload image to S3
  const s3Key = `profile-photos/${userId}.jpg`;
  await uploadToS3(imageBase64, s3Key);
  
  // Index face with Rekognition
  const indexResult = await rekognition.indexFaces({
    CollectionId: 'reevent-faces',
    Image: { S3Object: { Bucket: BUCKET_NAME, Name: s3Key } },
    ExternalImageId: userId,
    MaxFaces: 1,
    QualityFilter: 'AUTO'
  }).promise();
  
  if (indexResult.FaceRecords.length === 0) {
    throw new Error('No face detected in image');
  }
  
  // Save to DynamoDB
  const faceRecord = {
    PK: `FACE#${userId}`,
    SK: 'INDEX',
    faceId: indexResult.FaceRecords[0].Face.FaceId,
    userId,
    imageUrl: `s3://${BUCKET_NAME}/${s3Key}`,
    confidence: indexResult.FaceRecords[0].Face.Confidence,
    createdAt: new Date().toISOString(),
    active: true
  };
  
  await putItem(faceRecord);
  
  return successResponse({ faceId: faceRecord.faceId });
};
```

#### 2. Photo Processing Handler
```typescript
export const processPhoto = async (event: S3Event) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  
  // Search for faces in the uploaded photo
  const searchResult = await rekognition.searchFacesByImage({
    CollectionId: 'reevent-faces',
    Image: { S3Object: { Bucket: bucket, Name: key } },
    MaxFaces: 10,
    FaceMatchThreshold: 80
  }).promise();
  
  const detectedFaces = [];
  
  for (const match of searchResult.FaceMatches) {
    // Get user info from face ID
    const faceRecord = await queryItems('FACE#', match.Face.FaceId);
    if (faceRecord.length > 0) {
      detectedFaces.push({
        faceId: match.Face.FaceId,
        userId: faceRecord[0].userId,
        confidence: match.Similarity,
        boundingBox: match.Face.BoundingBox
      });
    }
  }
  
  // Save photo metadata
  const photoMetadata = {
    PK: `PHOTO#${generateUUID()}`,
    SK: 'METADATA',
    s3Key: key,
    detectedFaces,
    uploadedAt: new Date().toISOString()
  };
  
  await putItem(photoMetadata);
  
  // Notify detected users
  for (const face of detectedFaces) {
    await sendNotification(face.userId, {
      title: '📸 ¡Apareces en una nueva foto!',
      body: 'Se ha subido una foto del evento donde apareces',
      data: { photoId: photoMetadata.PK, action: 'VIEW_PHOTO' }
    });
  }
};
```

#### 3. My Photos Handler
```typescript
export const getMyPhotos = async (event: APIGatewayEvent) => {
  const userId = getUserFromToken(event);
  
  // Get user's face ID
  const faceRecord = await getItem(`FACE#${userId}`, 'INDEX');
  if (!faceRecord) {
    return successResponse({ photos: [] });
  }
  
  // Query photos where user appears
  const photos = await queryItems('PHOTO#', 'METADATA');
  const myPhotos = photos.filter(photo => 
    photo.detectedFaces.some(face => face.userId === userId)
  );
  
  // Generate signed URLs for photos
  const photosWithUrls = await Promise.all(
    myPhotos.map(async (photo) => ({
      ...photo,
      signedUrl: await getSignedUrl(photo.s3Key),
      myFace: photo.detectedFaces.find(face => face.userId === userId)
    }))
  );
  
  return successResponse({ photos: photosWithUrls });
};
```

## 🔒 Consideraciones de Privacidad

### Consentimiento
- **Opt-in explícito**: Los usuarios deben activar manualmente el reconocimiento
- **Información clara**: Explicar cómo se usa la tecnología
- **Fácil opt-out**: Permitir desactivar en cualquier momento

### Almacenamiento de Datos
- **Encriptación**: Todos los datos faciales encriptados en reposo
- **Retención limitada**: Eliminar datos después del evento
- **Acceso restringido**: Solo personal autorizado puede acceder

### Cumplimiento Legal
- **GDPR**: Cumplimiento con regulaciones europeas
- **Ley de Protección de Datos**: Adherencia a normativas locales
- **Transparencia**: Política de privacidad clara y accesible

## 📊 Métricas y Analytics

### Métricas de Uso
- Número de usuarios que activan reconocimiento facial
- Fotos procesadas por día
- Precisión promedio de reconocimiento
- Tiempo de procesamiento por foto

### Métricas de Engagement
- Usuarios que ven sus fotos personalizadas
- Fotos descargadas por usuario
- Interacciones con notificaciones de fotos

## 🚀 Roadmap de Implementación

### Fase 1: MVP (2 semanas)
- [x] Registro facial básico
- [x] Detección de caras en fotos
- [x] Galería personalizada simple

### Fase 2: Mejoras (1 semana)
- [ ] Notificaciones push
- [ ] Configuración de privacidad
- [ ] Métricas básicas

### Fase 3: Avanzado (1 semana)
- [ ] Análisis de emociones
- [ ] Agrupación inteligente de fotos
- [ ] Dashboard para organizadores

## 💰 Estimación de Costos

### AWS Rekognition
- **Indexación de caras**: $1.00 por 1,000 caras
- **Búsqueda facial**: $1.00 por 1,000 búsquedas
- **Detección de caras**: $1.00 por 1,000 imágenes

### Estimación para 500 asistentes
- Indexación: 500 caras × $0.001 = $0.50
- Procesamiento: 2,000 fotos × $0.001 = $2.00
- Búsquedas: 10,000 búsquedas × $0.001 = $10.00
- **Total estimado**: ~$12.50 USD

## 🛡️ Seguridad

### Protección de Datos
- Encriptación AES-256 en S3
- Tokens JWT con expiración corta
- Validación de entrada en todas las APIs
- Rate limiting para prevenir abuso

### Monitoreo
- CloudWatch logs para todas las operaciones
- Alertas por actividad sospechosa
- Auditoría de acceso a datos faciales

## 🧪 Testing

### Casos de Prueba
1. **Registro facial exitoso**
2. **Detección múltiple de caras**
3. **Falsos positivos/negativos**
4. **Rendimiento con alta carga**
5. **Privacidad y opt-out**

### Métricas de Calidad
- Precisión > 95%
- Tiempo de procesamiento < 30 segundos
- Disponibilidad > 99.9%