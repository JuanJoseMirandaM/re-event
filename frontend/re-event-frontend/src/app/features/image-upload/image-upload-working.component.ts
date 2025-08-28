import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadProxyService } from '../../core/services/image-upload-proxy.service';
import { FilePreviewPipe } from '../../pipes/file-preview.pipe';

interface WorkingImageFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  s3Key?: string;
}

@Component({
  selector: 'app-image-upload-working',
  standalone: true,
  imports: [CommonModule, FilePreviewPipe],
  template: `
    <div class="flex flex--col gap-4 p-4">
      <!-- Header -->
      <div class="flex flex--col items-center gap-1 bg-primary rounded-md w-full p-4">
        <span class="text-2xl">📷</span>
        <span class="text-base font-medium">Subir Imágenes</span>
        <span class="text-sm text-gray-600">Drag & Drop o selecciona archivos</span>
        <span class="text-xs text-green-600">✅ Proxy funcionando - Fetch API</span>
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
            <div class="flex gap-2">
              @if (pendingImages().length > 0 && !isUploading()) {
                <button 
                  class="btn btn--primary btn--sm"
                  (click)="uploadAllImages()">
                  📤 Subir {{ pendingImages().length }}
                </button>
              }
              <button 
                class="btn btn--secondary btn--sm"
                (click)="clearAll()">
                🗑️ Limpiar
              </button>
            </div>
          </div>

          <!-- Images -->
          <div class="flex flex--col gap-2">
            @for (image of images(); track image.id) {
              <div class="flex items-center gap-3 p-3 bg-white rounded border" 
                   [class]="getImageClass(image.status)">
                
                <!-- Preview -->
                <img 
                  [src]="image.file | filePreview" 
                  [alt]="image.file.name"
                  class="w-12 h-12 object-cover rounded">

                <!-- Info -->
                <div class="flex-1">
                  <div class="text-sm font-medium">{{ image.file.name }}</div>
                  <div class="text-xs text-gray-500">{{ formatFileSize(image.file.size) }}</div>
                  @if (image.status === 'success' && image.s3Key) {
                    <div class="text-xs text-green-600">✅ Subido: {{ image.s3Key.split('/').pop() }}</div>
                  }
                  @if (image.status === 'error' && image.error) {
                    <div class="text-xs text-red-600">❌ {{ image.error }}</div>
                  }
                </div>

                <!-- Status -->
                <div class="text-lg">
                  @if (image.status === 'pending') { ⏳ }
                  @if (image.status === 'uploading') { 📤 }
                  @if (image.status === 'success') { ✅ }
                  @if (image.status === 'error') { ❌ }
                </div>

                <!-- Actions -->
                @if (image.status === 'error') {
                  <button 
                    class="btn btn--sm bg-blue-100 text-blue-600"
                    (click)="retryImage(image.id)">
                    🔄
                  </button>
                }
                @if (image.status !== 'uploading') {
                  <button 
                    class="btn btn--sm bg-red-100 text-red-600"
                    (click)="removeImage(image.id)">
                    ❌
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Test Section -->
      <div class="bg-gray-50 border border-gray-200 rounded p-3">
        <div class="text-sm font-medium mb-2">🧪 Pruebas</div>
        <div class="flex gap-2">
          <button 
            class="btn btn--secondary btn--sm"
            (click)="testConnection()">
            🔗 Test API
          </button>
          <button 
            class="btn btn--secondary btn--sm"
            (click)="testUpload()">
            📤 Test Upload
          </button>
        </div>
        
        @if (testResult()) {
          <div class="mt-2 p-2 bg-white rounded border text-xs">
            <div class="font-medium" [class]="testResult()?.success ? 'text-green-600' : 'text-red-600'">
              {{ testResult()?.success ? '✅' : '❌' }} {{ testResult()?.message }}
            </div>
            @if (testResult()?.details) {
              <pre class="mt-1 text-gray-600">{{ testResult()?.details | json }}</pre>
            }
          </div>
        }
      </div>
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
export default class ImageUploadWorkingComponent {
  private readonly imageUploadService = inject(ImageUploadProxyService);

  images = signal<WorkingImageFile[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);
  testResult = signal<any>(null);

  pendingImages = signal<WorkingImageFile[]>([]);

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
    const validFiles: WorkingImageFile[] = [];
    
    for (const file of files) {
      const validation = this.imageUploadService.validateImageFile(file);
      
      if (validation.valid) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substring(2),
          status: 'pending'
        });
        console.log(`✅ Archivo válido: ${file.name}`);
      } else {
        console.log(`❌ Archivo inválido: ${file.name} - ${validation.error}`);
        alert(`Error en ${file.name}: ${validation.error}`);
      }
    }

    if (validFiles.length > 0) {
      this.images.update(current => [...current, ...validFiles]);
      this.updatePendingImages();
    }
  }

  uploadAllImages(): void {
    const pending = this.images().filter(img => img.status === 'pending');
    
    if (pending.length === 0) {
      alert('No hay imágenes pendientes');
      return;
    }

    console.log(`📤 Subiendo ${pending.length} imágenes...`);
    this.isUploading.set(true);

    pending.forEach((image, index) => {
      this.updateImageStatus(image.id, 'uploading');
      
      this.imageUploadService.uploadImageCompleteWithFetch(image.file)
        .subscribe({
          next: (result) => {
            if (result.success) {
              console.log(`🎉 [${index + 1}/${pending.length}] ${image.file.name} subido`);
              this.updateImageStatus(image.id, 'success', undefined, result.s3Key);
            } else {
              console.error(`❌ [${index + 1}/${pending.length}] Error: ${result.error}`);
              this.updateImageStatus(image.id, 'error', result.error);
            }
            this.checkComplete();
          },
          error: (error) => {
            console.error(`❌ [${index + 1}/${pending.length}] Error: ${error.message}`);
            this.updateImageStatus(image.id, 'error', error.message);
            this.checkComplete();
          }
        });
    });
  }

  private updateImageStatus(id: string, status: WorkingImageFile['status'], error?: string, s3Key?: string): void {
    this.images.update(current => 
      current.map(img => 
        img.id === id ? { ...img, status, error, s3Key } : img
      )
    );
    this.updatePendingImages();
  }

  private updatePendingImages(): void {
    this.pendingImages.set(this.images().filter(img => img.status === 'pending'));
  }

  private checkComplete(): void {
    const hasUploading = this.images().some(img => img.status === 'uploading');
    if (!hasUploading) {
      this.isUploading.set(false);
      const success = this.images().filter(img => img.status === 'success').length;
      const errors = this.images().filter(img => img.status === 'error').length;
      console.log(`✅ Completado. Exitosas: ${success}, Errores: ${errors}`);
    }
  }

  retryImage(id: string): void {
    console.log(`🔄 Reintentando imagen: ${id}`);
    this.updateImageStatus(id, 'pending');
  }

  removeImage(id: string): void {
    this.images.update(current => current.filter(img => img.id !== id));
    this.updatePendingImages();
  }

  clearAll(): void {
    this.images.set([]);
    this.updatePendingImages();
    this.testResult.set(null);
  }

  testConnection(): void {
    console.log('🧪 Test conexión...');
    this.testResult.set(null);
    
    this.imageUploadService.generatePresignedUrl('test.jpg')
      .subscribe({
        next: (result) => {
          console.log('✅ Test exitoso:', result);
          this.testResult.set({
            success: true,
            message: 'Conexión exitosa',
            details: result
          });
        },
        error: (error) => {
          console.error('❌ Test falló:', error);
          this.testResult.set({
            success: false,
            message: 'Error de conexión',
            details: error.message
          });
        }
      });
  }

  testUpload(): void {
    console.log('📤 Test upload...');
    this.testResult.set(null);
    
    // Crear archivo de prueba
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(0, 0, 1, 1);
    }
    
    canvas.toBlob((blob) => {
      if (blob) {
        const testFile = new File([blob], 'test.jpg', { type: 'image/jpeg' });
        console.log('📁 Archivo de prueba creado:', testFile);
        
        this.imageUploadService.uploadImageCompleteWithFetch(testFile)
          .subscribe({
            next: (result) => {
              console.log('✅ Test upload exitoso:', result);
              this.testResult.set({
                success: result.success,
                message: result.success ? 'Upload exitoso' : 'Upload falló',
                details: result
              });
            },
            error: (error) => {
              console.error('❌ Test upload falló:', error);
              this.testResult.set({
                success: false,
                message: 'Error en upload',
                details: error.message
              });
            }
          });
      }
    }, 'image/jpeg');
  }

  getImageClass(status: string): string {
    const classes = {
      'pending': 'border-gray-200',
      'uploading': 'border-blue-300 bg-blue-50',
      'success': 'border-green-300 bg-green-50',
      'error': 'border-red-300 bg-red-50'
    };
    return classes[status as keyof typeof classes] || 'border-gray-200';
  }

  formatFileSize(bytes: number): string {
    return this.imageUploadService.formatFileSize(bytes);
  }
}