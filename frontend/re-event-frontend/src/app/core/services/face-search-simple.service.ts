import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map, catchError, of, from } from 'rxjs';
import { AuthService } from './auth.service';

export interface FaceScanRequest {
  fileName: string;
  type: 'face-scans';
}

export interface FaceScanResponse {
  uploadUrl: string;
  s3Key: string;
  type: string;
}

export interface SearchByFaceRequest {
  data: {
    bucket: string;
    key: string;
    collection_id: string;
  };
}

export interface SearchByFaceResponse {
  FaceMatches?: any[];
  faceMatches?: any[];
  matches?: any[];
  [key: string]: any;
}

export interface FaceSearchResult {
  success: boolean;
  error?: string;
  uploadResult?: any;
  searchResult?: SearchByFaceResponse;
  s3Key?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaceSearchSimpleService {
  // URLs y configuración
  private readonly presignedUrlEndpoint = '/presigned-api/generate-presigned-url';
  private readonly searchByFaceEndpoint = 'https://9mszstbuql.execute-api.us-east-1.amazonaws.com/dev/search-by-face';
  
  // Constantes de configuración
  readonly BUCKET_NAME = 'facefinder-amazon-community-bolivia-2025-dev';
  readonly COLLECTION_ID = 'facefinder-faces-dev';

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  /**
   * Genera URL presignada para face-scans
   */
  generateFaceScanUrl(fileName: string): Observable<FaceScanResponse> {
    console.log(`🔍 Generando URL presignada para face scan: ${fileName}`);
    
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': token || '',
          'Content-Type': 'application/json'
        });

        const request: FaceScanRequest = {
          fileName,
          type: 'face-scans'
        };

        console.log(`📡 Request face-scan:`, request);

        return this.http.post<FaceScanResponse>(
          this.presignedUrlEndpoint,
          request,
          { headers }
        ).pipe(
          map(response => {
            console.log(`✅ URL presignada generada:`, response);
            return response;
          }),
          catchError(error => {
            console.error(`❌ Error generando URL:`, error);
            throw error;
          })
        );
      })
    );
  }

  /**
   * Sube imagen para face scan
   */
  async uploadFaceScanImage(file: File, uploadUrl: string): Promise<Response> {
    console.log(`⬆️ Subiendo imagen: ${file.name} (${file.size} bytes)`);
    
    // Usar proxy si es necesario
    let finalUploadUrl = uploadUrl;
    if (uploadUrl.includes('facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com')) {
      finalUploadUrl = uploadUrl.replace('https://facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com', '/s3-upload');
      console.log(`🔄 Usando proxy S3`);
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

    console.log(`🎉 Imagen subida exitosamente`);
    return response;
  }

  /**
   * Busca caras similares
   */
  searchByFace(s3Key: string): Observable<SearchByFaceResponse> {
    console.log(`🔍 Buscando caras para: ${s3Key}`);
    
    return this.authService.getAuthToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': token || '',
          'Content-Type': 'application/json'
        });

        const request: SearchByFaceRequest = {
          data: {
            bucket: this.BUCKET_NAME,
            key: s3Key,
            collection_id: this.COLLECTION_ID
          }
        };

        console.log(`📡 Request search:`, request);

        return this.http.post<SearchByFaceResponse>(
          this.searchByFaceEndpoint,
          request,
          { headers }
        ).pipe(
          map(response => {
            console.log(`✅ Búsqueda completada:`, response);
            return response;
          }),
          catchError(error => {
            console.error(`❌ Error en búsqueda:`, error);
            throw error;
          })
        );
      })
    );
  }

  /**
   * Proceso completo simplificado
   */
  uploadAndSearchFace(file: File): Observable<FaceSearchResult> {
    console.log(`🚀 Iniciando búsqueda facial: ${file.name}`);
    
    return this.generateFaceScanUrl(file.name).pipe(
      switchMap(presignedResponse => {
        console.log(`📤 Paso 1/3: URL obtenida`);
        
        return from(this.uploadFaceScanImage(file, presignedResponse.uploadUrl)).pipe(
          switchMap(uploadResult => {
            console.log(`📤 Paso 2/3: Imagen subida`);
            
            return this.searchByFace(presignedResponse.s3Key).pipe(
              map(searchResult => {
                console.log(`🎉 Proceso completo`);
                return {
                  success: true,
                  uploadResult,
                  searchResult,
                  s3Key: presignedResponse.s3Key
                } as FaceSearchResult;
              }),
              catchError(searchError => {
                console.error(`❌ Error búsqueda:`, searchError);
                return of({
                  success: false,
                  error: `Error en búsqueda: ${searchError.message}`,
                  uploadResult,
                  s3Key: presignedResponse.s3Key
                } as FaceSearchResult);
              })
            );
          }),
          catchError(uploadError => {
            console.error(`❌ Error subida:`, uploadError);
            return of({
              success: false,
              error: `Error subiendo: ${uploadError.message}`
            } as FaceSearchResult);
          })
        );
      }),
      catchError(error => {
        console.error(`❌ Error URL:`, error);
        return of({
          success: false,
          error: `Error URL: ${error.message}`
        } as FaceSearchResult);
      })
    );
  }

  /**
   * Validación de archivos
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Solo se permiten archivos JPG y PNG'
      };
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Archivo demasiado grande. Máximo 10MB'
      };
    }

    return { valid: true };
  }

  /**
   * Formatea tamaño de archivo
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Getters para configuración
   */
  get bucketName(): string {
    return this.BUCKET_NAME;
  }

  get collectionId(): string {
    return this.COLLECTION_ID;
  }
}