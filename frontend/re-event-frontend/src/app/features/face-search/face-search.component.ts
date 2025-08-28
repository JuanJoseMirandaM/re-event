import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaceSearchService } from '../../core/services/face-search.service';
import { FilePreviewPipe } from '../../pipes/file-preview.pipe';

@Component({
  selector: 'app-face-search',
  standalone: true,
  imports: [CommonModule, FilePreviewPipe],
  template: `
    <div class="flex flex--col gap-4 p-4">
      <!-- Header -->
      <div class="flex flex--col items-center gap-1 bg-primary rounded-md w-full p-4">
        <span class="text-2xl">🔍</span>
        <span class="text-base font-medium">Búsqueda Facial</span>
        <span class="text-sm text-gray-600">Sube una foto para encontrar caras similares</span>
        <div class="flex gap-4 text-xs text-gray-500 mt-2">
          <span>📦 Bucket: {{ faceSearchService.bucketName }}</span>
          <span>🗂️ Collection: {{ faceSearchService.collectionId }}</span>
        </div>
      </div>

      <!-- Upload Area -->
      <div class="bg-primary rounded w-full p-4">
        <div class="text-base font-medium mb-3">1. Seleccionar Imagen</div>
        
        @if (!selectedImage()) {
          <!-- File Selection -->
          <div 
            class="upload-area"
            [class.drag-over]="isDragOver()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            (click)="fileInput.click()">
            
            <div class="upload-content">
              @if (isDragOver()) {
                <span class="text-3xl">📤</span>
                <span class="text-lg font-medium text-primary-lilac">Suelta la imagen aquí</span>
              } @else {
                <span class="text-3xl">🔍</span>
                <span class="text-lg font-medium">Selecciona una imagen</span>
                <span class="text-sm text-gray-500">Solo una imagen para búsqueda facial</span>
                <div class="flex gap-2 mt-2">
                  <span class="text-xs bg-gray-100 px-2 py-1 rounded">JPG</span>
                  <span class="text-xs bg-gray-100 px-2 py-1 rounded">PNG</span>
                </div>
              }
            </div>
          </div>

          <input 
            #fileInput
            type="file" 
            accept="image/jpeg,image/jpg,image/png"
            class="hidden"
            (change)="onFileSelect($event)">
        } @else {
          <!-- Selected Image Preview -->
          <div class="selected-image-container">
            <div class="selected-image-preview">
              <img 
                [src]="selectedImage()!.file | filePreview" 
                [alt]="selectedImage()!.file.name"
                class="preview-image">
              
              <div class="image-overlay">
                <button 
                  class="btn btn--sm bg-red-100 text-red-600"
                  (click)="clearSelection()"
                  title="Cambiar imagen">
                  🔄 Cambiar
                </button>
              </div>
            </div>
            
            <div class="image-info">
              <div class="text-sm font-medium">{{ selectedImage()!.file.name }}</div>
              <div class="text-xs text-gray-500">{{ formatFileSize(selectedImage()!.file.size) }}</div>
              <div class="text-xs text-gray-600 mt-1">✅ Listo para búsqueda facial</div>
            </div>
          </div>
        }
      </div>

      <!-- Search Button -->
      @if (selectedImage() && !isSearching()) {
        <button 
          class="btn btn--primary btn--lg w-full"
          (click)="startFaceSearch()">
          🔍 Buscar Caras Similares
        </button>
      }

      <!-- Loading State -->
      @if (isSearching()) {
        <div class="bg-blue-50 border border-blue-200 rounded p-4">
          <div class="flex items-center gap-3">
            <div class="spinner"></div>
            <div>
              <div class="text-sm font-medium text-blue-800">{{ searchStatus() }}</div>
              <div class="text-xs text-blue-600">{{ searchStep() }}</div>
            </div>
          </div>
        </div>
      }

      <!-- Search Results -->
      @if (searchResult()) {
        <div class="bg-primary rounded w-full p-4">
          <div class="text-base font-medium mb-3">🎯 Resultados de Búsqueda</div>
          
          @if (searchResult()?.success) {
            <div class="bg-green-50 border border-green-200 rounded p-3 mb-3">
              <div class="text-sm font-medium text-green-800">✅ Búsqueda completada exitosamente</div>
              @if (searchResult()?.s3Key) {
                <div class="text-xs text-green-600 mt-1">📁 Imagen guardada: {{ searchResult()?.s3Key }}</div>
              }
            </div>

            <!-- Search Results Data -->
            @if (searchResult()?.searchResult) {
              <div class="bg-white border rounded p-3">
                <div class="text-sm font-medium mb-2">📊 Datos de la búsqueda:</div>
                <pre class="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-64">{{ searchResult()?.searchResult | json }}</pre>
              </div>
            }

            <!-- Face Matches (if available) -->
            @if (getFaceMatches().length > 0) {
              <div class="mt-3">
                <div class="text-sm font-medium mb-2">👥 Caras encontradas ({{ getFaceMatches().length }}):</div>
                <div class="grid grid-cols-1 gap-2">
                  @for (match of getFaceMatches(); track $index) {
                    <div class="bg-white border rounded p-2">
                      <div class="flex justify-between items-center">
                        <span class="text-sm">Coincidencia {{ $index + 1 }}</span>
                        @if (match.Similarity) {
                          <span class="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                            {{ match.Similarity.toFixed(1) }}% similar
                          </span>
                        }
                      </div>
                      @if (match.Face?.ExternalImageId) {
                        <div class="text-xs text-gray-600 mt-1">ID: {{ match.Face.ExternalImageId }}</div>
                      }
                    </div>
                  }
                </div>
              </div>
            } @else {
              <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
                <div class="text-sm text-yellow-800">ℹ️ No se encontraron caras similares en la colección</div>
              </div>
            }
          } @else {
            <!-- Error State -->
            <div class="bg-red-50 border border-red-200 rounded p-3">
              <div class="text-sm font-medium text-red-800">❌ Error en la búsqueda</div>
              <div class="text-xs text-red-600 mt-1">{{ searchResult()?.error }}</div>
            </div>
          }

          <!-- Action Buttons -->
          <div class="flex gap-2 mt-3">
            <button 
              class="btn btn--secondary btn--sm"
              (click)="clearResults()">
              🗑️ Limpiar Resultados
            </button>
            <button 
              class="btn btn--primary btn--sm"
              (click)="searchAgain()">
              🔍 Nueva Búsqueda
            </button>
          </div>
        </div>
      }

      <!-- Debug Panel -->
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
              (click)="testSearchEndpoint()">
              🔍 Test Search API
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
    .upload-area {
      @apply border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer transition-all duration-300;
      min-height: 120px;
    }
    
    .upload-area:hover {
      @apply border-primary-lilac bg-gray-50;
    }
    
    .upload-area.drag-over {
      @apply border-primary-lilac bg-primary-lilac bg-opacity-10;
    }
    
    .upload-content {
      @apply flex flex-col items-center justify-center gap-2 text-center h-full;
    }

    .selected-image-container {
      @apply flex gap-4 p-3 bg-white rounded border;
    }

    .selected-image-preview {
      @apply relative;
    }

    .preview-image {
      @apply w-24 h-24 object-cover rounded;
    }

    .image-overlay {
      @apply absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded opacity-0 transition-opacity duration-200;
    }

    .selected-image-preview:hover .image-overlay {
      @apply opacity-100;
    }

    .image-info {
      @apply flex-1;
    }

    .spinner {
      @apply w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin;
    }
  `]
})
export default class FaceSearchComponent {
  readonly faceSearchService = inject(FaceSearchService);

  selectedImage = signal<{ file: File; id: string } | null>(null);
  isDragOver = signal(false);
  isSearching = signal(false);
  searchStatus = signal('');
  searchStep = signal('');
  searchResult = signal<any>(null);
  debugInfo = signal<any>(null);

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
    if (files.length > 0) {
      this.handleFile(files[0]); // Solo tomar el primer archivo
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    if (files.length > 0) {
      this.handleFile(files[0]);
    }
    input.value = '';
  }

  private handleFile(file: File): void {
    console.log(`📁 Archivo seleccionado: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    const validation = this.faceSearchService.validateImageFile(file);
    
    if (validation.valid) {
      this.selectedImage.set({
        file,
        id: Math.random().toString(36).substring(2)
      });
      console.log(`✅ Imagen válida seleccionada: ${file.name}`);
      this.clearResults(); // Limpiar resultados anteriores
    } else {
      console.log(`❌ Imagen inválida: ${file.name} - ${validation.error}`);
      alert(`Error: ${validation.error}`);
    }
  }

  startFaceSearch(): void {
    const image = this.selectedImage();
    if (!image) {
      alert('Por favor selecciona una imagen primero');
      return;
    }

    console.log(`🚀 Iniciando búsqueda facial para: ${image.file.name}`);
    this.isSearching.set(true);
    this.searchStatus.set('Procesando búsqueda facial...');
    this.searchStep.set('Paso 1/3: Generando URL presignada');

    this.faceSearchService.uploadAndSearchFace(image.file)
      .subscribe({
        next: (result) => {
          console.log(`🎉 Búsqueda facial completada:`, result);
          this.isSearching.set(false);
          this.searchResult.set(result);
          
          if (result.success) {
            this.searchStatus.set('✅ Búsqueda completada exitosamente');
          } else {
            this.searchStatus.set('❌ Error en la búsqueda');
          }
        },
        error: (error) => {
          console.error(`❌ Error en búsqueda facial:`, error);
          this.isSearching.set(false);
          this.searchResult.set({
            success: false,
            error: error.message || 'Error desconocido'
          });
          this.searchStatus.set('❌ Error en la búsqueda');
        }
      });

    // Simular progreso de pasos
    setTimeout(() => {
      if (this.isSearching()) {
        this.searchStep.set('Paso 2/3: Subiendo imagen');
      }
    }, 1000);

    setTimeout(() => {
      if (this.isSearching()) {
        this.searchStep.set('Paso 3/3: Buscando caras similares');
      }
    }, 3000);
  }

  getFaceMatches(): any[] {
    const result = this.searchResult();
    if (!result?.success || !result?.searchResult) {
      return [];
    }

    // Intentar extraer matches de diferentes posibles estructuras de respuesta
    const searchData = result.searchResult;
    return searchData.FaceMatches || searchData.faceMatches || searchData.matches || [];
  }

  clearSelection(): void {
    this.selectedImage.set(null);
    this.clearResults();
    console.log(`🗑️ Selección de imagen limpiada`);
  }

  clearResults(): void {
    this.searchResult.set(null);
    this.searchStatus.set('');
    this.searchStep.set('');
    this.debugInfo.set(null);
  }

  searchAgain(): void {
    this.clearSelection();
  }

  testConnection(): void {
    console.log('🧪 Probando conexión...');
    this.debugInfo.set(null);
    
    this.faceSearchService.generateFaceScanUrl('test-connection.jpg')
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

  testSearchEndpoint(): void {
    console.log('🔍 Probando endpoint de búsqueda...');
    this.debugInfo.set(null);
    
    // Usar una key de prueba
    const testKey = 'face-scans/test/test-image.jpg';
    
    this.faceSearchService.searchByFace(testKey)
      .subscribe({
        next: (result) => {
          console.log('✅ Test de búsqueda exitoso:', result);
          this.debugInfo.set({
            status: 'success',
            message: 'Endpoint de búsqueda funcional',
            result: result
          });
        },
        error: (error) => {
          console.error('❌ Test de búsqueda falló:', error);
          this.debugInfo.set({
            status: 'error',
            message: 'Error en endpoint de búsqueda',
            error: error.message
          });
        }
      });
  }

  formatFileSize(bytes: number): string {
    return this.faceSearchService.formatFileSize(bytes);
  }
}