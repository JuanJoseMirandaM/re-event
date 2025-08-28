import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, forkJoin, of, catchError, map } from 'rxjs';
import { AuthService } from './auth.service';

export interface PresignedUrlRequest {
  fileName: string;
  type: 'to-rekognize';
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  s3Key: string;
  type: string;
}

export interface ImageUploadResult {
  fileName: string;
  success: boolean;
  error?: string;
  s3Key?: string;
}

export interface ImageFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  s3Key?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private readonly presignedUrlEndpoint = 'https://xn9xm38ind.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  /**
   * Genera una URL presignada para subir una imagen
   */
  generatePresignedUrl(fileName: string): Observable<PresignedUrlResponse> {
    console.log(`🔗 Generando URL presignada para: ${fileName}`);
    
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        console.log(`🔑 Token obtenido, longitud: ${token.length}`);
        
        const headers = new HttpHeaders({
          'Authorization': token,
          'Content-Type': 'application/json'
        });

        const request: PresignedUrlRequest = {
          fileName,
          type: 'to-rekognize'
        };

        console.log(`📡 Enviando petición a: ${this.presignedUrlEndpoint}`);
        console.log(`📋 Request body:`, request);
        console.log(`📋 Headers:`, headers.keys());

        return this.http.post<PresignedUrlResponse>(
          this.presignedUrlEndpoint,
          request,
          { headers }
        );
      })
    );
  }

  /**
   * Sube un archivo a S3 usando la URL presignada (con progreso)
   */
  uploadFileToS3(file: File, uploadUrl: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': file.type
    });

    return this.http.put(uploadUrl, file, {
      headers,
      reportProgress: true,
      observe: 'events'
    });
  }

  /**
   * Sube un archivo a S3 usando la URL presignada (simple)
   */
  uploadFileToS3Simple(file: File, uploadUrl: string): Observable<any> {
    console.log(`⬆️ Subiendo archivo a S3: ${file.name} (${file.size} bytes)`);
    console.log(`🔗 URL de subida: ${uploadUrl.substring(0, 100)}...`);
    
    const headers = new HttpHeaders({
      'Content-Type': file.type
    });

    console.log(`📋 Headers para S3:`, { 'Content-Type': file.type });

    return this.http.put(uploadUrl, file, { headers });
  }

  /**
   * Procesa la subida completa de un archivo (presigned URL + upload)
   */
  uploadSingleImage(file: File): Observable<ImageUploadResult> {
    return this.generatePresignedUrl(file.name).pipe(
      switchMap(presignedResponse => {
        return this.uploadFileToS3Simple(file, presignedResponse.uploadUrl).pipe(
          map(() => ({
            fileName: file.name,
            success: true,
            s3Key: presignedResponse.s3Key
          })),
          catchError(error => of({
            fileName: file.name,
            success: false,
            error: error.message || 'Error al subir archivo'
          }))
        );
      }),
      catchError(error => of({
        fileName: file.name,
        success: false,
        error: error.message || 'Error al generar URL presignada'
      }))
    );
  }

  /**
   * Sube múltiples imágenes en paralelo
   */
  uploadMultipleImages(files: File[]): Observable<ImageUploadResult[]> {
    const uploads = files.map(file => this.uploadSingleImage(file));
    return forkJoin(uploads);
  }

  /**
   * Valida si el archivo es una imagen válida
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WEBP'
      };
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'El archivo es demasiado grande. Máximo 10MB'
      };
    }

    return { valid: true };
  }

  /**
   * Genera un ID único para cada archivo
   */
  generateFileId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  /**
   * Formatea el tamaño del archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Obtiene el tipo de imagen basado en la extensión
   */
  getImageType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const typeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp'
    };
    return typeMap[extension || ''] || 'image/jpeg';
  }
}