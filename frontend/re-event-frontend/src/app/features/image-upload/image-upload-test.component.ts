import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../core/services/image-upload.service';

@Component({
  selector: 'app-image-upload-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <h2>Test de Servicio de Subida de Imágenes</h2>
      
      <div class="mt-4">
        <button 
          class="btn btn--primary"
          (click)="testPresignedUrl()">
          Probar URL Presignada
        </button>
      </div>
      
      <div class="mt-4" *ngIf="result">
        <h3>Resultado:</h3>
        <pre>{{ result | json }}</pre>
      </div>
      
      <div class="mt-4" *ngIf="error">
        <h3 class="text-red-500">Error:</h3>
        <pre class="text-red-500">{{ error }}</pre>
      </div>
    </div>
  `
})
export class ImageUploadTestComponent {
  result: any = null;
  error: string = '';

  constructor(private imageUploadService: ImageUploadService) {}

  testPresignedUrl(): void {
    this.result = null;
    this.error = '';
    
    console.log('Probando generación de URL presignada...');
    
    this.imageUploadService.generatePresignedUrl('test-image.jpg')
      .subscribe({
        next: (response) => {
          console.log('Respuesta exitosa:', response);
          this.result = response;
        },
        error: (error) => {
          console.error('Error:', error);
          this.error = error.message || 'Error desconocido';
        }
      });
  }
}