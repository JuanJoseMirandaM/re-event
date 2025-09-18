import {Injectable} from "@angular/core";
import {map, Observable, switchMap, of, catchError, tap} from "rxjs";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "./auth.service";
import {environment} from "../../../environments/environment";
import {Photo} from "../store/store/gallery.state";
import {GalleryParams, GalleryResponse, UploadPhotoParams} from "../store/actions/gallery.action";

export interface ApiResponse {
  success: boolean;
  data: GalleryResponse;
}

// Face-related interfaces from faceFinder-app
export interface BoundingBox {
  Height: number;
  Left: number;
  Top: number;
  Width: number;
}

export interface DetectedFace {
  faceId: string;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface ImageWithFaces {
  imageId: string;
  imageName: string;
  collectionId: string;
  share_path: string;
  created_at: string;
  faces: DetectedFace[];
  faceCount: number;
}

export interface Pagination {
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface GroupedFacesResponse {
  items: ImageWithFaces[];
  pagination: Pagination;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  s3Key: string;
  type: string;
  flowType: string;
}

export interface GeneratePresignedBatchRequest {
  fileName: string;
  type: 'to-rekognize';
}

const BASE_URL = `${environment.apiUrl}`;

@Injectable({
  providedIn: "root",
})
export class GalleryService {
  private readonly baseUrl = environment.apiUrl;
  private readonly facefinderApiUrl = BASE_URL;
  private readonly cloudfrontUrl = environment.cloudfrontUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): Observable<HttpHeaders> {
    return this.authService.getAuthToken().pipe(
      map((token) => new HttpHeaders({
        'Authorization': token,
        'Content-Type': 'application/json'
      }))
    );
  }

  getPhotos(params?: GalleryParams): Observable<GalleryResponse> {
    // For now, return mock data since the backend endpoint doesn't exist yet
    return this.getMockPhotos(params);
  }

  uploadPhoto(params: UploadPhotoParams): Observable<Photo> {
    // For now, return mock uploaded photo since the backend endpoint doesn't exist yet
    return this.getMockUploadedPhoto(params);
  }

  deletePhoto(photoId: string): Observable<void> {
    // For now, return mock success since the backend endpoint doesn't exist yet
    return of(void 0);
  }

  // faceFinder API methods
  getFacesFromAPI(page: number, size: number): Observable<GroupedFacesResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<GroupedFacesResponse>(`${this.facefinderApiUrl}/faces/get-faces/${page}/${size}`, { headers })
      )
    );
  }

  generatePresignedBatch(request: GeneratePresignedBatchRequest): Observable<PresignedUrlResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<PresignedUrlResponse>(`${this.facefinderApiUrl}/faces/generate-presigned-batch`, request, { headers })
      )
    );
  }

  uploadFileToS3(presignedUrl: PresignedUrlResponse, file: File): Observable<any> {
    console.log(presignedUrl,file)
    return this.http.put(presignedUrl.uploadUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    }).pipe(
      tap(() => {
        console.log(`✅ Upload completed for ${file.name}`);
      }),
      catchError(error => {
        console.error(`❌ Upload failed for ${file.name}:`, error);
        throw error;
      })
    );
  }

  // Helper functions
  convertImageWithFacesToPhotos(images: ImageWithFaces[]): Photo[] {
    return images.map(image => ({
      id: image.imageId,
      url: this.getImageUrl(image),
      thumbnailUrl: this.getImageUrl(image),
      title: image.imageName,
      description: `${image.faceCount} face${image.faceCount !== 1 ? 's' : ''} detected`,
      uploadedBy: 'system',
      uploadedAt: image.created_at,
      eventId: undefined,
      tags: ['face-recognition'],
      size: undefined,
      mimeType: 'image/jpeg'
    }));
  }

  private getImageUrl(image: ImageWithFaces): string {
    if (!image.share_path) return '';

    const cleanPath = image.share_path.startsWith('share/')
      ? image.share_path.substring(6)
      : image.share_path;
    return `${this.cloudfrontUrl}/${cleanPath}`;
  }

  // Mock data methods for development
  private getMockPhotos(params?: GalleryParams): Observable<GalleryResponse> {
    const mockPhotos: Photo[] = [
      {
        id: '1',
        url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop',
        title: 'Conference Opening',
        description: 'Opening ceremony of the annual tech conference',
        uploadedBy: 'user123',
        uploadedAt: new Date().toISOString(),
        eventId: 'event1',
        tags: ['conference', 'opening'],
        size: 245000,
        mimeType: 'image/jpeg'
      },
      {
        id: '2',
        url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop',
        title: 'Keynote Speaker',
        description: 'Main keynote presentation',
        uploadedBy: 'user456',
        uploadedAt: new Date().toISOString(),
        eventId: 'event1',
        tags: ['keynote', 'speaker'],
        size: 320000,
        mimeType: 'image/jpeg'
      },
      {
        id: '3',
        url: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?w=300&h=200&fit=crop',
        title: 'Team Discussion',
        description: 'Collaborative session during workshop',
        uploadedBy: 'user789',
        uploadedAt: new Date().toISOString(),
        eventId: 'event2',
        tags: ['workshop', 'collaboration'],
        size: 180000,
        mimeType: 'image/jpeg'
      },
      {
        id: '4',
        url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=300&h=200&fit=crop',
        title: 'Networking Session',
        description: 'Evening networking event',
        uploadedBy: 'user101',
        uploadedAt: new Date().toISOString(),
        eventId: 'event1',
        tags: ['networking', 'social'],
        size: 290000,
        mimeType: 'image/jpeg'
      },
      {
        id: '5',
        url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300&h=200&fit=crop',
        title: 'Innovation Lab',
        description: 'Hands-on tech demonstration',
        uploadedBy: 'user202',
        uploadedAt: new Date().toISOString(),
        eventId: 'event2',
        tags: ['technology', 'demo'],
        size: 410000,
        mimeType: 'image/jpeg'
      },
      {
        id: '6',
        url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&h=600&fit=crop',
        thumbnailUrl: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=300&h=200&fit=crop',
        title: 'Panel Discussion',
        description: 'Expert panel on future trends',
        uploadedBy: 'user303',
        uploadedAt: new Date().toISOString(),
        eventId: 'event1',
        tags: ['panel', 'discussion'],
        size: 275000,
        mimeType: 'image/jpeg'
      }
    ];

    return of({
      photos: mockPhotos,
      lastKey: null,
      totalCount: mockPhotos.length
    });
  }

  private getMockUploadedPhoto(params: UploadPhotoParams): Observable<Photo> {
    const mockPhoto: Photo = {
      id: Date.now().toString(),
      url: URL.createObjectURL(params.file),
      thumbnailUrl: URL.createObjectURL(params.file),
      title: params.title || 'New Photo',
      description: params.description || '',
      uploadedBy: 'current-user',
      uploadedAt: new Date().toISOString(),
      eventId: params.eventId,
      tags: params.tags || [],
      size: params.file.size,
      mimeType: params.file.type
    };

    return of(mockPhoto);
  }

  // Future implementation for real API calls
  /*
  getPhotos(params?: GalleryParams): Observable<GalleryResponse> {
    return this.getHeaders().pipe(
      switchMap(headers => {
        let url = `${this.baseUrl}/gallery`;
        const queryParams = new URLSearchParams();

        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.lastKey) queryParams.append('lastKey', params.lastKey);
        if (params?.eventId) queryParams.append('eventId', params.eventId);
        if (params?.userId) queryParams.append('userId', params.userId);

        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }

        return this.http.get<ApiResponse>(url, { headers }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  uploadPhoto(params: UploadPhotoParams): Observable<Photo> {
    return this.getHeaders().pipe(
      switchMap(headers => {
        const formData = new FormData();
        formData.append('file', params.file);
        if (params.title) formData.append('title', params.title);
        if (params.description) formData.append('description', params.description);
        if (params.eventId) formData.append('eventId', params.eventId);
        if (params.tags) formData.append('tags', JSON.stringify(params.tags));

        const uploadHeaders = new HttpHeaders({
          'Authorization': headers.get('Authorization')!
        });

        return this.http.post<{success: boolean; data: Photo}>(`${this.baseUrl}/gallery/upload`, formData, { headers: uploadHeaders }).pipe(
          map(response => response.data)
        );
      })
    );
  }

  deletePhoto(photoId: string): Observable<void> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.delete<void>(`${this.baseUrl}/gallery/${photoId}`, { headers })
      )
    );
  }
  */
}
