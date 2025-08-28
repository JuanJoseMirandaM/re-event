import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, catchError } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ImageUploadCorsService {
  private readonly presignedUrlEndpoint = 'https://9mszstbuql.execute-api.us-east-1.amazonaws.com/dev/generate-presigned-url';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) { }

  /**
   * Genera una URL presignada usando fetch API para evitar CORS
   */
  async generatePresignedUrlWithFetch(fileName: string): Promise<PresignedUrlResponse> {
    console.log(`🔗 Generando URL presignada con fetch para: ${fileName}`);

    try {
      // Obtener token
      // const token = await this.authService.getAuthToken().toPromise();
      // console.log(`🔑 Token obtenido, longitud: ${token?.length}`);

      const request: PresignedUrlRequest = {
        fileName,
        type: 'to-rekognize'
      };

      // Detectar si estamos en desarrollo para usar proxy
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const endpoint = isDevelopment ? '/presigned-api/generate-presigned-url' : this.presignedUrlEndpoint;

      console.log(`🔍 DEBUG INFO:`);
      console.log(`   - Hostname: ${window.location.hostname}`);
      console.log(`   - Port: ${window.location.port}`);
      console.log(`   - Is Development: ${isDevelopment}`);
      console.log(`   - Endpoint: ${endpoint}`);
      console.log(`   - Full URL: ${window.location.origin}${endpoint}`);
      console.log(`📡 Enviando petición fetch a: ${endpoint}`);
      console.log(`📋 Request body:`, request);
      console.log(`🏠 Modo: ${isDevelopment ? 'Desarrollo (Proxy)' : 'Producción (Directo)'}`);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': '',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        },
        body: JSON.stringify(request),
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log(`✅ URL presignada generada exitosamente:`, result);

      return result;
    } catch (error) {
      console.error(`❌ Error generando URL presignada:`, error);
      throw error;
    }
  }

  /**
   * Sube archivo a S3 usando fetch
   */
  async uploadFileToS3WithFetch(file: File, uploadUrl: string): Promise<any> {
    console.log(`⬆️ Subiendo archivo con fetch: ${file.name} (${file.size} bytes)`);
    console.log(`🔗 URL de subida: ${uploadUrl.substring(0, 100)}...`);

    try {
      // Detectar si estamos en desarrollo para usar proxy
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      let finalUploadUrl = uploadUrl;

      if (isDevelopment && uploadUrl.includes('facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com')) {
        // En desarrollo, usar el proxy
        finalUploadUrl = uploadUrl.replace('https://facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com', '/s3-upload');
        console.log(`🔄 Usando proxy para desarrollo: ${finalUploadUrl.substring(0, 100)}...`);
      }

      const response = await fetch(finalUploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file,
        mode: 'cors'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      console.log(`🎉 Archivo subido exitosamente con fetch`);
      return response;
    } catch (error) {
      console.error(`❌ Error subiendo archivo con fetch:`, error);
      throw error;
    }
  }

  /**
   * Proceso completo usando fetch
   */
  async uploadImageComplete(file: File): Promise<{ success: boolean, error?: string, s3Key?: string }> {
    try {
      // Paso 1: Generar URL presignada
      const presignedResponse = await this.generatePresignedUrlWithFetch(file.name);

      // Paso 2: Subir archivo
      await this.uploadFileToS3WithFetch(file, presignedResponse.uploadUrl);

      return {
        success: true,
        s3Key: presignedResponse.s3Key
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error desconocido'
      };
    }
  }

  /**
   * Versión Observable para compatibilidad
   */
  generatePresignedUrl(fileName: string): Observable<PresignedUrlResponse> {
    return new Observable(observer => {
      this.generatePresignedUrlWithFetch(fileName)
        .then(result => {
          observer.next(result);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Validación de archivos
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG, GIF, WEBP'
      };
    }

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
   * Formatea el tamaño del archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}