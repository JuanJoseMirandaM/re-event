import {Injectable} from "@angular/core";
import {catchError, map, Observable, of, switchMap, tap} from "rxjs";
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

export interface SearchByFaceRequest {
  data: {
    bucket: string;
    key: string;
    collection_id: string;
  };
}

export interface GeneratePresignedBatchRequest {
  fileName: string;
  type: 'to-rekognize' | 'face-scans';
}

export interface SearchResponse extends Array<Face> {
}

export interface Face {
  faceId: string;
  created_at: string;
  imageId: string;
  share_path: string;
  confidence: number;
  imageName: string;
  collectionId: string;
  boundingBox: BoundingBox;
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
  ) {
  }

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
    return this.getMockUploadedPhoto(params);
  }

  deletePhoto(photoId: string): Observable<void> {
    // For now, return mock success since the backend endpoint doesn't exist yet
    return of(void 0);
  }

  getFacesFromAPI(page: number, size: number): Observable<GroupedFacesResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.get<GroupedFacesResponse>(`${this.facefinderApiUrl}/faces/get-faces/${page}/${size}`, {headers})
      )
    );
  }

  generatePresignedBatch(request: GeneratePresignedBatchRequest): Observable<PresignedUrlResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<PresignedUrlResponse>(`${this.facefinderApiUrl}/faces/generate-presigned-batch`, request, {headers})
      )
    );
  }

  generatePresignedBatchFace(request: GeneratePresignedBatchRequest): Observable<PresignedUrlResponse> {
    return this.getHeaders().pipe(
      switchMap(headers =>
        this.http.post<PresignedUrlResponse>(`${this.facefinderApiUrl}/faces/generate-presigned-search`, request, {headers})
      )
    );
  }

  searchByFace(request: SearchByFaceRequest): Observable<SearchResponse> {
    return this.getHeaders().pipe(
      switchMap(headers => this.http.post<SearchResponse>(`${this.baseUrl}/faces/search-by-face`, request, {headers}))
    )
  }

  getFaces(file: File): Observable<SearchResponse> {
    return this.generatePresignedBatchFace({fileName: file.name, type: 'face-scans'}).pipe(
      switchMap(resp =>
        this.uploadFileToS3(resp, file).pipe(
          switchMap(() => {
            const searchRequest = {
              data: {
                bucket: environment.bucketNameAws,
                key: resp.s3Key,
                collection_id: environment.collection_id
              }
            };
            return this.searchByFace(searchRequest);
          })
        )
      )
    );
  }

  uploadFileToS3(presignedUrl: PresignedUrlResponse, file: File): Observable<any> {
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


  private getImageUrlFromPath(imagePath: string): string {
    if (!imagePath) return '';

    const cleanPath = imagePath.startsWith('share/')
      ? imagePath.substring(6)
      : imagePath;
    return `${this.cloudfrontUrl}/${cleanPath}`;
  }

  convertImageWithFacesToPhotos(images: ImageWithFaces[]): Photo[] {
    console.log(images)
    return images.map(image => ({
      id: image.imageId,
      url: this.getImageUrl(image),
      thumbnailUrl: this.#convertToThumbnail(this.getImageUrl(image)),
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

    console.log(cleanPath)
    return `${this.cloudfrontUrl}/${cleanPath}`;
  }

  #convertToThumbnail(url: string): string {
    return url.replace(/\/[^\/]+\.(png|jpg|jpeg|gif|webp)$/i, "/thumbnail.webp");
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
}
