import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map, catchError, of } from 'rxjs';
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
export class ImageUploadProxyService {
  // Usar siempre el proxy para desarrollo
  private readonly presignedUrlEndpoint = '/presigned-api/generate-presigned-url';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  /**
   * Genera una URL presignada usando HttpClient (mejor para proxy)
   */
  generatePresignedUrl(fileName: string): Observable<PresignedUrlResponse> {
    console.log(`🔗 Generando URL presignada con HttpClient para: ${fileName}`);
    console.log(`📡 Endpoint: ${this.presignedUrlEndpoint}`);
    
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        console.log(`🔑 Token obtenido, longitud: ${token?.length}`);
        
        const headers = new HttpHeaders({
          'Authorization': token || '',
          'Content-Type': 'application/json'
        });

        const request: PresignedUrlRequest = {
          fileName,
          type: 'to-rekognize'
        };

        console.log(`📋 Request body:`, request);
        console.log(`📋 Headers:`, headers.keys());

        return this.http.post<PresignedUrlResponse>(
          this.presignedUrlEndpoint,
          request,
          { headers }
        ).pipe(
          map(response => {
            console.log(`✅ URL presignada generada exitosamente:`, response);
            return response;
          }),
          catchError(error => {
            console.error(`❌ Error generando URL presignada:`, error);
            throw error;
          })
        );
      })
    );
  }

  /**
   * Sube archivo a S3 usando HttpClient con ArrayBuffer
   */
  uploadFileToS3(file: File, uploadUrl: string): Observable<any> {
    console.log(`⬆️ Subiendo archivo con HttpClient: ${file.name} (${file.size} bytes)`);
    console.log(`📄 Tipo de archivo: ${file.type}`);
    
    // Detectar si necesitamos usar proxy para S3
    let finalUploadUrl = uploadUrl;
    if (uploadUrl.includes('facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com')) {
      finalUploadUrl = uploadUrl.replace('https://facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com', '/s3-upload');
      console.log(`🔄 Usando proxy S3: ${finalUploadUrl.substring(0, 100)}...`);
    } else {
      console.log(`🔗 URL directa S3: ${finalUploadUrl.substring(0, 100)}...`);
    }

    // Convertir File a ArrayBuffer para asegurar binary data
    return new Observable(observer => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        console.log(`📦 Archivo convertido a ArrayBuffer: ${arrayBuffer.byteLength} bytes`);
        
        const headers = new HttpHeaders({
          'Content-Type': file.type
        });

        console.log(`📋 Headers para S3:`, { 'Content-Type': file.type });
        console.log(`📡 Enviando PUT a: ${finalUploadUrl.substring(0, 100)}...`);

        this.http.put(finalUploadUrl, arrayBuffer, { 
          headers,
          observe: 'response',
          responseType: 'text'
        }).pipe(
          map(response => {
            console.log(`🎉 Archivo subido exitosamente con HttpClient:`, response.status);
            return response;
          }),
          catchError(error => {
            console.error(`❌ Error subiendo archivo con HttpClient:`, error);
            console.error(`❌ Error details:`, {
              status: error.status,
              statusText: error.statusText,
              url: error.url,
              message: error.message
            });
            throw error;
          })
        ).subscribe({
          next: (response) => {
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            observer.error(error);
          }
        });
      };
      
      reader.onerror = () => {
        console.error(`❌ Error leyendo archivo: ${file.name}`);
        observer.error(new Error('Error leyendo archivo'));
      };
      
      console.log(`📖 Leyendo archivo como ArrayBuffer...`);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Sube archivo a S3 usando fetch API (alternativa más confiable para binary)
   */
  async uploadFileToS3WithFetch(file: File, uploadUrl: string): Promise<any> {
    console.log(`⬆️ Subiendo archivo con fetch: ${file.name} (${file.size} bytes)`);
    console.log(`📄 Tipo de archivo: ${file.type}`);
    
    // Detectar si necesitamos usar proxy para S3
    let finalUploadUrl = uploadUrl;
    if (uploadUrl.includes('facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com')) {
      finalUploadUrl = uploadUrl.replace('https://facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com', '/s3-upload');
      console.log(`🔄 Usando proxy S3: ${finalUploadUrl.substring(0, 100)}...`);
    } else {
      console.log(`🔗 URL directa S3: ${finalUploadUrl.substring(0, 100)}...`);
    }

    console.log(`📡 Enviando PUT con fetch a: ${finalUploadUrl.substring(0, 100)}...`);
    console.log(`📋 Headers: Content-Type: ${file.type}`);

    try {
      const response = await fetch(finalUploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type
        },
        body: file, // fetch maneja mejor el File object como binary
        mode: 'cors'
      });

      console.log(`📊 Respuesta S3: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Error S3: ${response.status} - ${errorText}`);
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
   * Proceso completo usando HttpClient
   */
  uploadImageComplete(file: File): Observable<{success: boolean, error?: string, s3Key?: string}> {
    return this.generatePresignedUrl(file.name).pipe(
      switchMap(presignedResponse => {
        return this.uploadFileToS3(file, presignedResponse.uploadUrl).pipe(
          map(() => ({
            success: true,
            s3Key: presignedResponse.s3Key
          })),
          catchError(error => of({
            success: false,
            error: error.message || 'Error al subir archivo'
          }))
        );
      }),
      catchError(error => of({
        success: false,
        error: error.message || 'Error al generar URL presignada'
      }))
    );
  }

  /**
   * Proceso completo usando fetch API (más confiable para binary)
   */
  uploadImageCompleteWithFetch(file: File): Observable<{success: boolean, error?: string, s3Key?: string}> {
    return this.generatePresignedUrl(file.name).pipe(
      switchMap(presignedResponse => {
        return new Observable<{success: boolean, error?: string, s3Key?: string}>(observer => {
          this.uploadFileToS3WithFetch(file, presignedResponse.uploadUrl)
            .then(() => {
              observer.next({
                success: true,
                s3Key: presignedResponse.s3Key
              });
              observer.complete();
            })
            .catch(error => {
              observer.next({
                success: false,
                error: error.message || 'Error al subir archivo'
              });
              observer.complete();
            });
        });
      }),
      catchError(error => of({
        success: false,
        error: error.message || 'Error al generar URL presignada'
      }))
    );
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

  /**
   * Test específico para proxy
   */
  testProxy(): Observable<any> {
    console.log('🧪 Probando proxy con HttpClient...');
    
    return this.http.get('/presigned-api/generate-presigned-url', {
      observe: 'response'
    }).pipe(
      map(response => {
        console.log('✅ Proxy funciona:', response.status);
        return response;
      }),
      catchError(error => {
        console.error('❌ Error en proxy:', error);
        throw error;
      })
    );
  }
}