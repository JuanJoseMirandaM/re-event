import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../core/services/image-upload.service';
import { FilePreviewPipe } from '../../pipes/file-preview.pipe';

interface SimpleImageFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

@Component({
  selector: 'app-image-upload-simple',
  standalone: true,
  imports: [CommonModule, FilePreviewPipe],
  template: `
    <div class="flex flex--col gap-4 p-4">
      <!-- Header -->
      <div class="flex flex--col items-center gap-1 bg-primary rounded-md w-full p-4">
        <span class="text-2xl">📷</span>
        <span class="text-base font-medium">Subir Imágenes</span>
        <span class="text-sm text-gray-600">Máximo 50 imágenes</span>
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
            <span class="text-sm text-gray-500">o haz clic para seleccionar</span>
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
            <button 
              class="btn btn--primary btn--sm"
              (click)="uploadAllImages()"
              [disabled]="isUploading()">
              📤 Subir Todo
            </button>
          </div>

          <div class="flex flex--col gap-2">
            @for (image of images(); track image.id) {
              <div class="flex items-center gap-3 p-2 bg-white rounded border">
                <img 
                  [src]="image.file | filePreview" 
                  [alt]="image.file.name"
                  class="w-12 h-12 object-cover rounded">
                
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ image.file.name }}</div>
                  <div class="text-xs text-gray-500">{{ formatFileSize(image.file.size) }}</div>
                  @if (image.error) {
                    <div class="text-xs text-red-500">{{ image.error }}</div>
                  }
                </div>

                <div class="flex items-center gap-2">
                  @if (image.status === 'pending') { <span>⏳</span> }
                  @if (image.status === 'uploading') { <span>📤</span> }
                  @if (image.status === 'success') { <span>✅</span> }
                  @if (image.status === 'error') { <span>❌</span> }
                  
                  <button 
                    class="text-red-500 hover:text-red-700"
                    (click)="removeImage(image.id)">
                    ❌
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Test Buttons -->
      <div class="flex gap-2 flex-wrap">
        <button 
          class="btn btn--secondary btn--sm"
          (click)="testPresignedUrl()">
          🧪 Test URL
        </button>
        <button 
          class="btn btn--secondary btn--sm"
          (click)="testFullUpload()">
          � Teist Upload
        </button>
        <button 
          class="btn btn--secondary btn--sm"
          (click)="clearAll()">
          🗑️ Limpiar
        </button>
      </div>

      <!-- Test Result -->
      @if (testResult()) {
        <div class="bg-green-50 border border-green-200 rounded p-3">
          <div class="text-sm font-medium text-green-800">Test Result:</div>
          <pre class="text-xs text-green-700 mt-1">{{ testResult() | json }}</pre>
        </div>
      }

      @if (testError()) {
        <div class="bg-red-50 border border-red-200 rounded p-3">
          <div class="text-sm font-medium text-red-800">Test Error:</div>
          <pre class="text-xs text-red-700 mt-1">{{ testError() }}</pre>
        </div>
      }
    </div>
  `,
  styles: [`
    .drag-drop-area {
      @apply border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer transition-all duration-300;
      min-height: 150px;
    }
    
    .drag-drop-area:hover {
      @apply border-primary-lilac bg-gray-50;
    }
    
    .drag-drop-area.drag-over {
      @apply border-primary-lilac bg-primary-lilac bg-opacity-10;
    }
    
    .drag-drop-content {
      @apply flex flex-col items-center justify-center gap-2 text-center h-full;
    }
  `]
})
export default class ImageUploadSimpleComponent {
  private readonly imageUploadService = inject(ImageUploadService);

  images = signal<SimpleImageFile[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);
  testResult = signal<any>(null);
  testError = signal<string>('');

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
    this.handleFiles(files);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFiles(files);
    input.value = '';
  }

  private handleFiles(files: File[]): void {
    const validFiles: SimpleImageFile[] = [];

    for (const file of files) {
      if (file.type.startsWith('image/')) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substring(2),
          status: 'pending'
        });
      }
    }

    this.images.update(current => [...current, ...validFiles]);
  }

  uploadAllImages(): void {
    const pendingImages = this.images().filter(img => img.status === 'pending');

    if (pendingImages.length === 0) {
      alert('No hay imágenes pendientes');
      return;
    }

    console.log(`📤 Iniciando subida de ${pendingImages.length} imágenes...`);
    this.isUploading.set(true);

    pendingImages.forEach((image, index) => {
      console.log(`📁 Procesando imagen ${index + 1}/${pendingImages.length}: ${image.file.name}`);
      this.updateImageStatus(image.id, 'uploading');

      // Paso 1: Generar URL presignada
      console.log(`🔗 Generando URL presignada para: ${image.file.name}`);
      this.imageUploadService.generatePresignedUrl(image.file.name)
        .subscribe({
          next: (presignedResponse) => {
            console.log(`✅ URL presignada generada para ${image.file.name}:`, presignedResponse);

            // Paso 2: Subir archivo a S3 usando la URL presignada
            console.log(`⬆️ Subiendo ${image.file.name} a S3...`);
            this.imageUploadService.uploadFileToS3Simple(image.file, presignedResponse.uploadUrl)
              .subscribe({
                next: (uploadResponse) => {
                  console.log(`🎉 ${image.file.name} subido exitosamente a S3:`, uploadResponse);
                  this.updateImageStatus(image.id, 'success');
                  this.checkIfAllComplete();
                },
                error: (uploadError) => {
                  console.error(`❌ Error subiendo ${image.file.name} a S3:`, uploadError);
                  this.updateImageStatus(image.id, 'error', 'Error al subir a S3: ' + (uploadError.message || uploadError));
                  this.checkIfAllComplete();
                }
              });
          },
          error: (error) => {
            console.error(`❌ Error generando URL presignada para ${image.file.name}:`, error);
            this.updateImageStatus(image.id, 'error', 'Error al generar URL: ' + (error.message || error));
            this.checkIfAllComplete();
          }
        });
    });
  }

  private updateImageStatus(id: string, status: SimpleImageFile['status'], error?: string): void {
    this.images.update(current =>
      current.map(img =>
        img.id === id ? { ...img, status, error } : img
      )
    );
  }

  private checkIfAllComplete(): void {
    const hasUploading = this.images().some(img => img.status === 'uploading');
    if (!hasUploading) {
      this.isUploading.set(false);
    }
  }

  removeImage(id: string): void {
    this.images.update(current => current.filter(img => img.id !== id));
  }

  clearAll(): void {
    this.images.set([]);
    this.testResult.set(null);
    this.testError.set('');
  }

  testPresignedUrl(): void {
    this.testResult.set(null);
    this.testError.set('');

    console.log('🧪 Iniciando test de URL presignada...');

    this.imageUploadService.generatePresignedUrl('test-image.jpg')
      .subscribe({
        next: (response) => {
          console.log('✅ URL presignada generada exitosamente:', response);
          this.testResult.set(response);
        },
        error: (error) => {
          console.error('❌ Error al generar URL presignada:', error);
          this.testError.set(error.message || 'Error desconocido');
        }
      });
  }

  testFullUpload(): void {
    this.testResult.set(null);
    this.testError.set('');

    console.log('🚀 Iniciando test de subida completa...');

    // Crear un archivo de prueba (imagen de 1x1 pixel en base64)
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

    // Convertir base64 a File
    fetch(testImageData)
      .then(res => res.blob())
      .then(blob => {
        const testFile = new File([blob], 'test-image.png', { type: 'image/png' });

        console.log('📁 Archivo de prueba creado:', testFile);

        // Usar el método uploadSingleImage del servicio
        this.imageUploadService.uploadSingleImage(testFile)
          .subscribe({
            next: (result) => {
              console.log('✅ Subida completa exitosa:', result);
              this.testResult.set({
                message: 'Subida completa exitosa',
                result: result
              });
            },
            error: (error) => {
              console.error('❌ Error en subida completa:', error);
              this.testError.set('Error en subida completa: ' + error.message);
            }
          });
      })
      .catch(error => {
        console.error('❌ Error creando archivo de prueba:', error);
        this.testError.set('Error creando archivo de prueba: ' + error.message);
      });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}