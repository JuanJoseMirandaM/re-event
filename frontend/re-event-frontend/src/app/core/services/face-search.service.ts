import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map, catchError, of } from 'rxjs';
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
  // Define según la respuesta real del API
  matches?: any[];
  similarity?: number;
  faceMatches?: any[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class FaceSearchService {
  // URLs y configuración
  private readonly presignedUrlEndpoint = '/presigned-api/generate-presigned-url';
  private readonly searchByFaceEndpoint = 'https://9mszstbuql.execute-api.us-east-1.amazonaws.com/dev/search-by-face';
  
  // Constantes de configuración
  private readonly BUCKET_NAME = 'facefinder-amazon-community-bolivia-2025-dev';
  private readonly COLLECTION_ID = 'facefinder-faces-dev';

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

        console.log(`📡 Enviando petición face-scan:`, request);

        return this.http.post<FaceScanResponse>(
          this.presignedUrlEndpoint,
          request,
          { headers }
        ).pipe(
          map(response => {
            console.log(`✅ URL presignada para face-scan generada:`, response);
            return response;
          }),
          catchError(error => {
            console.error(`❌ Error generando URL presignada para face-scan:`, error);
            throw error;
          })
        );
      })
    );
  }

  /**
   * Sube imagen para face scan usando fetch
   */
  async uploadFaceScanImage(file: File, uploadUrl: string): Promise<any> {
    console.log(`⬆️ Subiendo imagen para face scan: ${file.name} (${file.size} bytes)`);
    
    // Detectar si necesitamos usar proxy para S3
    let finalUploadUrl = uploadUrl;
    if (uploadUrl.includes('facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com')) {
      finalUploadUrl = uploadUrl.replace('https://facefinder-amazon-community-bolivia-2025-dev.s3.amazonaws.com', '/s3-upload');
      console.log(`🔄 Usando proxy S3 para face scan: ${finalUploadUrl.substring(0, 100)}...`);
    }

    try {
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

      console.log(`🎉 Imagen para face scan subida exitosamente`);
      return response;
    } catch (error) {
      console.error(`❌ Error subiendo imagen para face scan:`, error);
      throw error;
    }
  }

  /**
   * Busca caras similares usando el endpoint search-by-face
   */
  searchByFace(s3Key: string): Observable<SearchByFaceResponse> {
    console.log(`🔍 Buscando caras similares para: ${s3Key}`);
    
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

        console.log(`📡 Enviando petición search-by-face:`, request);
        console.log(`📡 Endpoint: ${this.searchByFaceEndpoint}`);

        return this.http.post<SearchByFaceResponse>(
          this.searchByFaceEndpoint,
          request,
          { headers }
        ).pipe(
          map(response => {
            console.log(`✅ Búsqueda facial completada:`, response);
            return response;
          }),
          catchError(error => {
            console.error(`❌ Error en búsqueda facial:`, error);
            throw error;
          })
        );
      })
    );
  }

  /**
   * Proceso completo: subir imagen y buscar caras
   */
  uploadAndSearchFace(file: File): Observable<{
    success: boolean;
    error?: string;
    uploadResult?: any;
    searchResult?: SearchByFaceResponse;
    s3Key?: string;
  }> {
    console.log(`🚀 Iniciando proceso completo de búsqueda facial para: ${file.name}`);
    
    return this.generateFaceScanUrl(file.name).pipe(
      switchMap(presignedResponse => {
        console.log(`📤 Paso 1/3: URL presignada obtenida`);
        
        return new Observable<{
          success: boolean;
          error?: string;
          uploadResult?: any;
          searchResult?: SearchByFaceResponse;
          s3Key?: string;
        }>(observer => {
          this.uploadFaceScanImage(file, presignedResponse.uploadUrl)
            .then(uploadResult => {
              console.log(`📤 Paso 2/3: Imagen subida exitosamente`);
              
              // Paso 3: Buscar caras
              console.log(`🔍 Paso 3/3: Iniciando búsqueda facial`);
              this.searchByFace(presignedResponse.s3Key)
                .subscribe({
                  next: (searchResult) => {
                    console.log(`🎉 Proceso completo exitoso`);
                    observer.next({
                      success: true,
                      uploadResult,
                      searchResult,
                      s3Key: presignedResponse.s3Key
                    });
                    observer.complete();
                  },
                  error: (searchError) => {
                    console.error(`❌ Error en búsqueda facial:`, searchError);
                    observer.next({
                      success: false,
                      error: `Error en búsqueda facial: ${searchError.message}`,
                      uploadResult,
                      s3Key: presignedResponse.s3Key
                    });
                    observer.complete();
                  }
                });
            })
            .catch(uploadError => {
              console.error(`❌ Error subiendo imagen:`, uploadError);
              observer.next({
                success: false,
                error: `Error subiendo imagen: ${uploadError.message}`
              });
              observer.complete();
            });
        });
      }),
      catchError(error => {
        console.error(`❌ Error generando URL presignada:`, error);
        return of({
          success: false,
          error: `Error generando URL presignada: ${error.message}`
        });
      })
    );
  }

  /**
   * Valida que el archivo sea una imagen válida
   */
  validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de archivo no válido. Solo se permiten: JPG, PNG'
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
   * Getters para las constantes de configuración
   */
  get bucketName(): string {
    return this.BUCKET_NAME;
  }

  get collectionId(): string {
    return this.COLLECTION_ID;
  }
}