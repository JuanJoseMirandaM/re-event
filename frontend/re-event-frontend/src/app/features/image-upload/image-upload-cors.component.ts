import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadCorsService } from '../../core/services/image-upload-cors.service';
import { FilePreviewPipe } from '../../pipes/file-preview.pipe';

interface CorsImageFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  s3Key?: string;
}

@Component({
  selector: 'app-image-upload-cors',
  standalone: true,
  imports: [CommonModule, FilePreviewPipe],
  template: `
    <div class="flex flex--col gap-4 p-4">
      <!-- Header -->
      <div class="flex flex--col items-center gap-1 bg-primary rounded-md w-full p-4">
        <span class="text-2xl">📷</span>
        <span class="text-base font-medium">Subir Imágenes</span>
        <span class="text-sm text-gray-600">Gateway: b0xg6szjbc.execute-api.us-east-1.amazonaws.com</span>
        <span class="text-xs text-blue-600">S3: facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com</span>
        <span class="text-xs" [class]="isDevelopment() ? 'text-green-600' : 'text-orange-600'">
          Modo: {{ isDevelopment() ? '🏠 Desarrollo (Proxy)' : '🌐 Producción (Directo)' }}
        </span>
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
          (click)="testS3Upload()">
          📤 Test S3
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
export default class ImageUploadCorsComponent {
  private readonly imageUploadService = inject(ImageUploadCorsService);

  images = signal<CorsImageFile[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);
  testResult = signal<any>(null);
  testError = signal<string>('');

  // Detectar si estamos en modo desarrollo
  isDevelopment = signal(
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1'
  );

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
    const validFiles: CorsImageFile[] = [];
    
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

  async uploadAllImages(): Promise<void> {
    const pendingImages = this.images().filter(img => img.status === 'pending');
    
    if (pendingImages.length === 0) {
      alert('No hay imágenes pendientes');
      return;
    }

    console.log(`📤 Iniciando subida de ${pendingImages.length} imágenes...`);
    this.isUploading.set(true);

    for (const image of pendingImages) {
      console.log(`📁 Procesando imagen: ${image.file.name}`);
      this.updateImageStatus(image.id, 'uploading');
      
      try {
        const result = await this.imageUploadService.uploadImageComplete(image.file);
        
        if (result.success) {
          console.log(`🎉 ${image.file.name} subido exitosamente`);
          this.updateImageStatus(image.id, 'success', undefined, result.s3Key);
        } else {
          console.error(`❌ Error subiendo ${image.file.name}:`, result.error);
          this.updateImageStatus(image.id, 'error', result.error);
        }
      } catch (error: any) {
        console.error(`❌ Error inesperado subiendo ${image.file.name}:`, error);
        this.updateImageStatus(image.id, 'error', error.message || 'Error desconocido');
      }
    }

    this.isUploading.set(false);
    console.log(`✅ Proceso de subida completado`);
  }

  private updateImageStatus(id: string, status: CorsImageFile['status'], error?: string, s3Key?: string): void {
    this.images.update(current => 
      current.map(img => 
        img.id === id ? { ...img, status, error, s3Key } : img
      )
    );
  }

  removeImage(id: string): void {
    this.images.update(current => current.filter(img => img.id !== id));
  }

  clearAll(): void {
    this.images.set([]);
    this.testResult.set(null);
    this.testError.set('');
  }

  async testPresignedUrl(): Promise<void> {
    this.testResult.set(null);
    this.testError.set('');
    
    console.log('🧪 Iniciando test de URL presignada...');
    
    try {
      const result = await this.imageUploadService.generatePresignedUrlWithFetch('test-image.jpg');
      this.testResult.set(result);
    } catch (error: any) {
      this.testError.set(error.message || 'Error desconocido');
    }
  }

  async testFullUpload(): Promise<void> {
    this.testResult.set(null);
    this.testError.set('');
    
    console.log('🚀 Iniciando test de subida completa...');
    
    try {
      // Crear archivo de prueba
      const testImageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      const response = await fetch(testImageData);
      const blob = await response.blob();
      const testFile = new File([blob], 'test-image.png', { type: 'image/png' });
      
      const result = await this.imageUploadService.uploadImageComplete(testFile);
      this.testResult.set({
        message: 'Test de subida completa',
        result: result
      });
    } catch (error: any) {
      this.testError.set('Error en test completo: ' + error.message);
    }
  }

  async testS3Upload(): Promise<void> {
    this.testResult.set(null);
    this.testError.set('');
    
    console.log('📤 Iniciando test específico de S3...');
    
    try {
      // Paso 1: Generar URL presignada
      const presignedResponse = await this.imageUploadService.generatePresignedUrlWithFetch('test-s3-upload.jpg');
      console.log('✅ URL presignada obtenida:', presignedResponse);
      
      // Paso 2: Crear archivo de prueba
      const testImageData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A8A';
      const response = await fetch(testImageData);
      const blob = await response.blob();
      const testFile = new File([blob], 'test-s3-upload.jpg', { type: 'image/jpeg' });
      
      console.log('📁 Archivo de prueba creado:', testFile);
      
      // Paso 3: Subir a S3
      const uploadResponse = await this.imageUploadService.uploadFileToS3WithFetch(testFile, presignedResponse.uploadUrl);
      
      this.testResult.set({
        message: 'Test específico de S3 exitoso',
        presignedUrl: presignedResponse.uploadUrl.substring(0, 100) + '...',
        s3Key: presignedResponse.s3Key,
        uploadStatus: uploadResponse.status,
        mode: this.isDevelopment() ? 'Desarrollo (Proxy)' : 'Producción (Directo)'
      });
    } catch (error: any) {
      this.testError.set('Error en test S3: ' + error.message);
    }
  }

  formatFileSize(bytes: number): string {
    return this.imageUploadService.formatFileSize(bytes);
  }
}