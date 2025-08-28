import { 
  ChangeDetectionStrategy, 
  Component, 
  signal, 
  computed,
  inject,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  ImageUploadService, 
  ImageFile
} from '../../core/services/image-upload.service';
import { Subject, takeUntil, finalize } from 'rxjs';
import { HttpEventType } from '@angular/common/http';
import { FilePreviewPipe } from '../../pipes/file-preview.pipe';

@Component({
  selector: 'app-image-upload',
  imports: [CommonModule, FilePreviewPipe],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex--col gap-4 p-4'
  }
})
export default class ImageUploadComponent implements OnDestroy {
  private readonly imageUploadService = inject(ImageUploadService);
  private readonly destroy$ = new Subject<void>();

  // Signals para el estado del componente
  images = signal<ImageFile[]>([]);
  isDragOver = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);

  // Computed properties
  totalImages = computed(() => this.images().length);
  successfulUploads = computed(() => 
    this.images().filter(img => img.status === 'success').length
  );
  failedUploads = computed(() => 
    this.images().filter(img => img.status === 'error').length
  );
  pendingUploads = computed(() => 
    this.images().filter(img => img.status === 'pending').length
  );

  // Constantes
  readonly MAX_FILES = 50;
  readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Maneja el evento de drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  /**
   * Maneja el evento de drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  /**
   * Maneja el evento de drop
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);

    const files = Array.from(event.dataTransfer?.files || []);
    this.handleFiles(files);
  }

  /**
   * Maneja la selección de archivos desde el input
   */
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.handleFiles(files);
    
    // Limpiar el input para permitir seleccionar los mismos archivos
    input.value = '';
  }

  /**
   * Procesa los archivos seleccionados
   */
  private handleFiles(files: File[]): void {
    const currentImages = this.images();
    
    // Verificar límite máximo
    if (currentImages.length + files.length > this.MAX_FILES) {
      alert(`Solo puedes subir un máximo de ${this.MAX_FILES} imágenes. Actualmente tienes ${currentImages.length}.`);
      return;
    }

    // Validar y agregar archivos
    const validFiles: ImageFile[] = [];
    
    for (const file of files) {
      const validation = this.imageUploadService.validateImageFile(file);
      
      if (validation.valid) {
        const imageFile: ImageFile = {
          file,
          id: this.imageUploadService.generateFileId(),
          status: 'pending',
          progress: 0
        };
        validFiles.push(imageFile);
      } else {
        alert(`Error en ${file.name}: ${validation.error}`);
      }
    }

    // Agregar archivos válidos a la lista
    if (validFiles.length > 0) {
      this.images.update(current => [...current, ...validFiles]);
    }
  }

  /**
   * Inicia la subida de todas las imágenes pendientes
   */
  uploadAllImages(): void {
    const pendingImages = this.images().filter(img => img.status === 'pending');
    
    if (pendingImages.length === 0) {
      alert('No hay imágenes pendientes para subir');
      return;
    }

    this.isUploading.set(true);
    this.uploadProgress.set(0);

    // Subir imágenes una por una para mejor control
    this.uploadImagesSequentially(pendingImages, 0);
  }

  /**
   * Sube las imágenes secuencialmente
   */
  private uploadImagesSequentially(images: ImageFile[], index: number): void {
    if (index >= images.length) {
      this.isUploading.set(false);
      this.uploadProgress.set(100);
      return;
    }

    const imageFile = images[index];
    this.updateImageStatus(imageFile.id, 'uploading', 0);

    // Generar URL presignada
    this.imageUploadService.generatePresignedUrl(imageFile.file.name)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          // Continuar con la siguiente imagen
          setTimeout(() => {
            this.uploadImagesSequentially(images, index + 1);
          }, 500);
        })
      )
      .subscribe({
        next: (presignedResponse) => {
          // Subir archivo a S3
          this.imageUploadService.uploadFileToS3(imageFile.file, presignedResponse.uploadUrl)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (event) => {
                if (event.type === HttpEventType.UploadProgress && event.total) {
                  const progress = Math.round(100 * event.loaded / event.total);
                  this.updateImageStatus(imageFile.id, 'uploading', progress);
                } else if (event.type === HttpEventType.Response) {
                  this.updateImageStatus(imageFile.id, 'success', 100, undefined, presignedResponse.s3Key);
                }
              },
              error: (error) => {
                console.error('Error uploading to S3:', error);
                this.updateImageStatus(imageFile.id, 'error', 0, 'Error al subir a S3');
              }
            });
        },
        error: (error) => {
          console.error('Error generating presigned URL:', error);
          this.updateImageStatus(imageFile.id, 'error', 0, 'Error al generar URL de subida');
        }
      });

    // Actualizar progreso general
    const overallProgress = Math.round(((index + 1) / images.length) * 100);
    this.uploadProgress.set(overallProgress);
  }

  /**
   * Actualiza el estado de una imagen específica
   */
  private updateImageStatus(
    id: string, 
    status: ImageFile['status'], 
    progress: number, 
    error?: string,
    s3Key?: string
  ): void {
    this.images.update(current => 
      current.map(img => 
        img.id === id 
          ? { ...img, status, progress, error, s3Key }
          : img
      )
    );
  }

  /**
   * Elimina una imagen de la lista
   */
  removeImage(id: string): void {
    this.images.update(current => current.filter(img => img.id !== id));
  }

  /**
   * Limpia todas las imágenes
   */
  clearAllImages(): void {
    if (this.isUploading()) {
      alert('No puedes limpiar las imágenes mientras se están subiendo');
      return;
    }
    
    this.images.set([]);
    this.uploadProgress.set(0);
  }

  /**
   * Reintenta subir una imagen que falló
   */
  retryUpload(id: string): void {
    this.images.update(current => 
      current.map(img => 
        img.id === id 
          ? { ...img, status: 'pending', progress: 0, error: undefined }
          : img
      )
    );
  }



  /**
   * Formatea el tamaño del archivo
   */
  formatFileSize(bytes: number): string {
    return this.imageUploadService.formatFileSize(bytes);
  }
}