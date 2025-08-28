import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadProxyService } from '../../core/services/image-upload-proxy.service';
import { FilePreviewPipe } from '../../pipes/file-preview.pipe';

interface ProxyImageFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  s3Key?: string;
}

@Component({
  selector: 'app-image-upload-proxy',
  standalone: true,
  imports: [CommonModule, FilePreviewPipe],
  template: `
    <div class="flex flex--col gap-4 p-4">
      <!-- Header -->
      <div class="flex flex--col items-center gap-1 bg-primary rounded-md w-full p-4">
        <span class="text-2xl">📷</span>
        <span class="text-base font-medium">Subir Imágenes (HttpClient + Proxy)</span>
        <span class="text-sm text-gray-600">Usando Angular HttpClient con proxy.conf.json</span>
        <span class="text-xs text-blue-600">Endpoint: /presigned-api/generate-presigned-url</span>
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
                  @if (image.s3Key) {
                    <div class="text-xs text-green-600">S3: {{ image.s3Key }}</div>
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
          (click)="testProxy()">
          🔧 Test Proxy
        </button>
        <button 
          class="btn btn--secondary btn--sm"
          (click)="testPresignedUrl()">
          🧪 Test URL
        </button>
        <button 
          class="btn btn--secondary btn--sm"
          (click)="testFullUpload()">
          🚀 Test Upload
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
          <div class="text-sm font-medium text-green-800">✅ Test Result:</div>
          <pre class="text-xs text-green-700 mt-1 whitespace-pre-wrap">{{ testResult() | json }}</pre>
        </div>
      }

      @if (testError()) {
        <div class="bg-red-50 border border-red-200 rounded p-3">
          <div class="text-sm font-medium text-red-800">❌ Test Error:</div>
          <pre class="text-xs text-red-700 mt-1 whitespace-pre-wrap">{{ testError() }}</pre>
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
export default class ImageUploadProxyComponent {
  private readonly imageUploadService = inject(ImageUploadProxyService);

  images = signal<ProxyImageFile[]>([]);
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
    const validFiles: ProxyImageFile[] = [];
    
    for (const file of files) {
      const validation = this.imageUploadService.validateImageFile(file);
      
      if (validation.valid) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substring(2),
          status: 'pending'
        });
      } else {
        alert(`Error en ${file.name}: ${validation.error}`);
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

    console.log(`📤 Iniciando subida de ${pendingImages.length} imágenes con HttpClient...`);
    this.isUploading.set(true);

    pendingImages.forEach(image => {
      console.log(`📁 Procesando imagen: ${image.file.name}`);
      this.updateImageStatus(image.id, 'uploading');
      
      this.imageUploadService.uploadImageComplete(image.file)
        .subscribe({
          next: (result) => {
            if (result.success) {
              console.log(`🎉 ${image.file.name} subido exitosamente`);
              this.updateImageStatus(image.id, 'success', undefined, result.s3Key);
            } else {
              console.error(`❌ Error subiendo ${image.file.name}:`, result.error);
              this.updateImageStatus(image.id, 'error', result.error);
            }
            this.checkIfAllComplete();
          },
          error: (error) => {
            console.error(`❌ Error inesperado subiendo ${image.file.name}:`, error);
            this.updateImageStatus(image.id, 'error', error.message || 'Error desconocido');
            this.checkIfAllComplete();
          }
        });
    });
  }

  private updateImageStatus(id: string, status: ProxyImageFile['status'], error?: string, s3Key?: string): void {
    this.images.update(current => 
      current.map(img => 
        img.id === id ? { ...img, status, error, s3Key } : img
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

  testProxy(): void {
    this.testResult.set(null);
    this.testError.set('');
    
    console.log('🔧 Probando proxy...');
    
    this.imageUploadService.testProxy()
      .subscribe({
        next: (response) => {
          this.testResult.set({
            message: 'Proxy test exitoso',
            status: response.status,
            url: response.url
          });
        },
        error: (error) => {
          this.testError.set('Error en proxy: ' + error.message);
        }
      });
  }

  testPresignedUrl(): void {
    this.testResult.set(null);
    this.testError.set('');
    
    console.log('🧪 Iniciando test de URL presignada con HttpClient...');
    
    this.imageUploadService.generatePresignedUrl('test-image.jpg')
      .subscribe({
        next: (result) => {
          this.testResult.set(result);
        },
        error: (error) => {
          this.testError.set(error.message || 'Error desconocido');
        }
      });
  }

  testFullUpload(): void {
    this.testResult.set(null);
    this.testError.set('');
    
    console.log('🚀 Iniciando test de subida completa con HttpClient...');
    
    // Crear archivo de prueba
    const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    fetch(testImageData)
      .then(res => res.blob())
      .then(blob => {
        const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
        
        this.imageUploadService.uploadImageComplete(testFile)
          .subscribe({
            next: (result) => {
              this.testResult.set({
                message: 'Test de subida completa con HttpClient',
                result: result
              });
            },
            error: (error) => {
              this.testError.set('Error en test completo: ' + error.message);
            }
          });
      })
      .catch(error => {
        this.testError.set('Error creando archivo de prueba: ' + error.message);
      });
  }

  formatFileSize(bytes: number): string {
    return this.imageUploadService.formatFileSize(bytes);
  }
}