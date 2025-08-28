import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadProxyService } from '../../core/services/image-upload-proxy.service';
import { FilePreviewPipe } from '../../pipes/file-preview.pipe';

interface FinalImageFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  s3Key?: string;
  progress?: number;
}

@Component({
  selector: 'app-image-upload-final',
  standalone: true,
  imports: [CommonModule, FilePreviewPipe],
  template: `
    <div class="flex flex--col gap-4 p-4">
      <!-- Header -->
      <div class="flex flex--col items-center gap-1 bg-primary rounded-md w-full p-4">
        <span class="text-2xl">📷</span>
        <span class="text-base font-medium">Subir Imágenes</span>
        <span class="text-sm text-gray-600">Arrastra imágenes o haz clic para seleccionar</span>
        <span class="text-xs text-green-600">✅ Proxy funcionando</span>
      </div>

      <!-- Drag & Drop Area -->
      <div 
        class="drag-drop-area"
        [class.drag-over]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        
        <div class="drag-drop-content">
          @if (isDragOver()) {
            <span class="text-4xl">📤</span>
            <span class="text-lg font-medium text-primary-lilac">Suelta las imágenes aquí</span>
          } @else {
            <span class="text-4xl">📷</span>
            <span class="text-lg font-medium">Arrastra imágenes aquí</span>
            <span class="text-sm text-gray-500">o haz clic para seleccionar archivos</span>
            <div class="flex gap-2 mt-2">
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">JPG</span>
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">PNG</span>
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">GIF</span>
              <span class="text-xs bg-gray-100 px-2 py-1 rounded">WEBP</span>
            </div>
          }
        </div>
      </div>

      <!-- Hidden File Input -->
      <input 
        #fileInput
        type="file" 
        multiple 
        accept="image/*"
        class="hidden"
        (change)="onFileSelect($event)">

      <!-- Images List -->
      @if (images().length > 0) {
        <div class="flex flex--col gap-2 bg-primary rounded w-full p-4">
          <div class="flex justify-between items-center">
            <span class="text-base font-medium">Imágenes ({{ images().length }})</span>
            <div class="flex gap-2">
              @if (pendingCount() > 0 && !isUploading()) {
                <button 
                  class="btn btn--primary btn--sm"
                  (click)="uploadAllImages()">
                  📤 Subir {{ pendingCount() }} imágenes
                </button>
              }
              @if (!isUploading()) {
                <button 
                  class="btn btn--secondary btn--sm"
                  (click)="clearAll()">
                  🗑️ Limpiar
                </button>
              }
            </div>
          </div>

          <!-- Progress Summary -->
          @if (isUploading()) {
            <div class="bg-blue-50 border border-blue-200 rounded p-2">
              <div class="text-sm text-blue-800">
                📤 Subiendo... {{ successCount() }}/{{ images().length }} completadas
              </div>
              @if (errorCount() > 0) {
                <div class="text-sm text-red-600">
                  ❌ {{ errorCount() }} errores
                </div>
              }
            </div>
          }

          <!-- Images Grid -->
          <div class="grid grid-cols-1 gap-2">
            @for (image of images(); track image.id) {
              <div class="flex items-center gap-3 p-3 bg-white rounded-lg border" 
                   [class]="getImageBorderClass(image.status)">
                
                <!-- Image Preview -->
                <div class="relative">
                  <img 
                    [src]="image.file | filePreview" 
                    [alt]="image.file.name"
                    class="w-16 h-16 object-cover rounded-md">
                  
                  <!-- Status Overlay -->
                  <div class="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-sm"
                       [class]="getStatusBadgeClass(image.status)">
                    {{ getStatusEmoji(image.status) }}
                  </div>
                </div>

                <!-- File Info -->
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-gray-900 truncate">
                    {{ image.file.name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ formatFileSize(image.file.size) }}
                  </div>
                  
                  <!-- Status Info -->
                  @if (image.status === 'pending') {
                    <div class="text-xs text-gray-600 mt-1">Listo para subir</div>
                  }
                  @if (image.status === 'uploading') {
                    <div class="text-xs text-blue-600 mt-1">Subiendo...</div>
                  }
                  @if (image.status === 'success' && image.s3Key) {
                    <div class="text-xs text-green-600 mt-1">✅ Subido exitosamente</div>
                    <div class="text-xs text-gray-400 truncate">{{ image.s3Key }}</div>
                  }
                  @if (image.status === 'error' && image.error) {
                    <div class="text-xs text-red-600 mt-1">❌ {{ image.error }}</div>
                  }
                </div>

                <!-- Actions -->
                <div class="flex gap-1">
                  @if (image.status === 'error') {
                    <button 
                      class="btn-icon btn-icon--sm bg-blue-100 text-blue-600 hover:bg-blue-200"
                      (click)="retryUpload(image.id)"
                      title="Reintentar">
                      🔄
                    </button>
                  }
                  @if (image.status !== 'uploading') {
                    <button 
                      class="btn-icon btn-icon--sm bg-red-100 text-red-600 hover:bg-red-200"
                      (click)="removeImage(image.id)"
                      title="Eliminar">
                      ❌
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Empty State -->
      @if (images().length === 0) {
        <div class="flex flex--col items-center gap-3 bg-primary rounded w-full p-8 text-center">
          <span class="text-4xl">📷</span>
          <span class="text-lg font-medium text-gray-700">No hay imágenes seleccionadas</span>
          <span class="text-sm text-gray-500">Arrastra imágenes aquí o haz clic en el área de arriba</span>
          <button 
            class="btn btn--primary btn--sm mt-2"
            (click)="fileInput.click()">
            📁 Seleccionar Archivos
          </button>
        </div>
      }

      <!-- Debug Panel (collapsible) -->
      <details class="bg-gray-50 border border-gray-200 rounded p-3">
        <summary class="cursor-pointer text-sm font-medium">🔧 Panel de Debug</summary>
        <div class="mt-2 space-y-2">
          <div class="flex gap-2">
            <button 
              class="btn btn--secondary btn--sm"
              (click)="testConnection()">
              🧪 Test Conexión
            </button>
            <button 
              class="btn btn--secondary btn--sm"
              (click)="testBinaryUpload()">
              📤 Test Binary
            </button>
          </div>
          
          @if (debugInfo()) {
            <div class="text-xs bg-white p-2 rounded border">
              <pre>{{ debugInfo() | json }}</pre>
            </div>
          }
        </div>
      </details>
    </div>
  `,
  styles: [`
    .drag-drop-area {
      @apply border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer transition-all duration-300;
      min-height: 200px;
    }
    
    .drag-drop-area:hover {
      @apply border-primary-lilac bg-gray-50;
    }
    
    .drag-drop-area.drag-over {
      @apply border-primary-lilac bg-primary-lilac bg-opacity-10;
      transform: scale(1.02);
    }
    
    .drag-drop-content {
      @apply flex flex-col items-center justify-center gap-2 text-center h-full;
    }

    .btn-icon {
      @apply w-8 h-8 flex items-center justify-center rounded-full border-none cursor-pointer transition-all duration-200;
      font-size: 12px;
    }

    .btn-icon--sm {
      @apply w-6 h-6;
      font-size: 10px;
    }

    .btn-icon:hover {
      transform: scale(1.1);
    }
  `]
})
export default class ImageUploadFinalComponent {
  private readonly imageUploadService = inject(ImageUploadProxyService);

  images = signal<FinalImageFile[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);
  debugInfo = signal<any>(null);

  // Computed properties
  pendingCount = signal(0);
  successCount = signal(0);
  errorCount = signal(0);

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = Array.from(event.dataTransfer?.files || []);
    console.log(`📁 Archivos arrastrados: ${files.length}`);
    this.handleFiles(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    console.log(`📁 Archivos seleccionados: ${files.length}`);
    this.handleFiles(files);
    input.value = '';
  }

  private handleFiles(files: File[]): void {
    console.log(`🔍 Procesando ${files.length} archivos...`);
    const validFiles: FinalImageFile[] = [];
    
    for (const file of files) {
      console.log(`📄 Validando: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      const validation = this.imageUploadService.validateImageFile(file);
      
      if (validation.valid) {
        const imageFile: FinalImageFile = {
          file,
          id: Math.random().toString(36).substring(2),
          status: 'pending'
        };
        validFiles.push(imageFile);
        console.log(`✅ Archivo válido: ${file.name}`);
      } else {
        console.log(`❌ Archivo inválido: ${file.name} - ${validation.error}`);
        alert(`Error en ${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length > 0) {
      this.images.update(current => [...current, ...validFiles]);
      this.updateCounts();
      console.log(`📋 Total de imágenes: ${this.images().length}`);
    }
  }

  uploadAllImages(): void {
    const pendingImages = this.images().filter(img => img.status === 'pending');
    
    if (pendingImages.length === 0) {
      alert('No hay imágenes pendientes para subir');
      return;
    }

    console.log(`📤 Iniciando subida de ${pendingImages.length} imágenes...`);
    this.isUploading.set(true);

    pendingImages.forEach((image, index) => {
      console.log(`📁 [${index + 1}/${pendingImages.length}] Procesando: ${image.file.name}`);
      this.updateImageStatus(image.id, 'uploading');
      
      this.imageUploadService.uploadImageCompleteWithFetch(image.file)
        .subscribe({
          next: (result) => {
            if (result.success) {
              console.log(`🎉 [${index + 1}/${pendingImages.length}] ${image.file.name} subido exitosamente`);
              this.updateImageStatus(image.id, 'success', undefined, result.s3Key);
            } else {
              console.error(`❌ [${index + 1}/${pendingImages.length}] Error subiendo ${image.file.name}:`, result.error);
              this.updateImageStatus(image.id, 'error', result.error);
            }
            this.checkIfAllComplete();
          },
          error: (error) => {
            console.error(`❌ [${index + 1}/${pendingImages.length}] Error inesperado subiendo ${image.file.name}:`, error);
            this.updateImageStatus(image.id, 'error', error.message || 'Error desconocido');
            this.checkIfAllComplete();
          }
        });
    });
  }

  private updateImageStatus(id: string, status: FinalImageFile['status'], error?: string, s3Key?: string): void {
    this.images.update(current => 
      current.map(img => 
        img.id === id ? { ...img, status, error, s3Key } : img
      )
    );
    this.updateCounts();
  }

  private updateCounts(): void {
    const images = this.images();
    this.pendingCount.set(images.filter(img => img.status === 'pending').length);
    this.successCount.set(images.filter(img => img.status === 'success').length);
    this.errorCount.set(images.filter(img => img.status === 'error').length);
  }

  private checkIfAllComplete(): void {
    const hasUploading = this.images().some(img => img.status === 'uploading');
    if (!hasUploading) {
      this.isUploading.set(false);
      console.log(`✅ Proceso de subida completado. Exitosas: ${this.successCount()}, Errores: ${this.errorCount()}`);
    }
  }

  retryUpload(id: string): void {
    console.log(`🔄 Reintentando subida para imagen: ${id}`);
    this.updateImageStatus(id, 'pending');
  }

  removeImage(id: string): void {
    const image = this.images().find(img => img.id === id);
    if (image) {
      console.log(`🗑️ Eliminando imagen: ${image.file.name}`);
    }
    this.images.update(current => current.filter(img => img.id !== id));
    this.updateCounts();
  }

  clearAll(): void {
    console.log(`🗑️ Limpiando todas las imágenes (${this.images().length})`);
    this.images.set([]);
    this.updateCounts();
    this.debugInfo.set(null);
  }

  testConnection(): void {
    console.log('🧪 Probando conexión...');
    this.imageUploadService.generatePresignedUrl('test-connection.jpg')
      .subscribe({
        next: (result) => {
          console.log('✅ Test de conexión exitoso:', result);
          this.debugInfo.set({
            status: 'success',
            message: 'Conexión exitosa',
            result: result
          });
        },
        error: (error) => {
          console.error('❌ Test de conexión falló:', error);
          this.debugInfo.set({
            status: 'error',
            message: 'Error de conexión',
            error: error.message
          });
        }
      });
  }

  testBinaryUpload(): void {
    console.log('📤 Probando subida binary...');
    
    // Crear archivo de prueba
    const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
    
    fetch(testImageData)
      .then(res => res.blob())
      .then(blob => {
        const testFile = new File([blob], 'test-binary.jpg', { type: 'image/jpeg' });
        console.log('📁 Archivo de prueba creado:', testFile);
        
        this.imageUploadService.uploadImageCompleteWithFetch(testFile)
          .subscribe({
            next: (result) => {
              console.log('✅ Test binary exitoso:', result);
              this.debugInfo.set({
                status: result.success ? 'success' : 'error',
                message: result.success ? 'Subida binary exitosa' : 'Error en subida binary',
                result: result
              });
            },
            error: (error) => {
              console.error('❌ Test binary falló:', error);
              this.debugInfo.set({
                status: 'error',
                message: 'Error en test binary',
                error: error.message
              });
            }
          });
      })
      .catch(error => {
        console.error('❌ Error creando archivo de prueba:', error);
        this.debugInfo.set({
          status: 'error',
          message: 'Error creando archivo de prueba',
          error: error.message
        });
      });
  }

  getImageBorderClass(status: string): string {
    const classes = {
      'pending': 'border-gray-200',
      'uploading': 'border-blue-300 bg-blue-50',
      'success': 'border-green-300 bg-green-50',
      'error': 'border-red-300 bg-red-50'
    };
    return classes[status as keyof typeof classes] || 'border-gray-200';
  }

  getStatusBadgeClass(status: string): string {
    const classes = {
      'pending': 'bg-gray-100 text-gray-600',
      'uploading': 'bg-blue-100 text-blue-600',
      'success': 'bg-green-100 text-green-600',
      'error': 'bg-red-100 text-red-600'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-600';
  }

  getStatusEmoji(status: string): string {
    const emojis = {
      'pending': '⏳',
      'uploading': '📤',
      'success': '✅',
      'error': '❌'
    };
    return emojis[status as keyof typeof emojis] || '❓';
  }

  formatFileSize(bytes: number): string {
    return this.imageUploadService.formatFileSize(bytes);
  }
}