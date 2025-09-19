import {ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, signal, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {GalleryService} from '../../core/services/gallery.service';
import {ToastService} from '../../core/services/toast.service';
import {IndexedDBService} from '../../core/services/indexeddb.service';
import {environment} from '../../../environments/environment';

interface PhotoResult {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  uploadedAt?: Date;
  confidence?: number;
  description?: string;
  tags?: string[];
  originalPath?: string;
}

@Component({
  selector: 'app-face-search',
  imports: [CommonModule, TranslatePipe, DatePipe, DecimalPipe],
  templateUrl: './face-search.component.html',
  styleUrl: './face-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class FaceSearchComponent implements OnDestroy {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  private router = inject(Router);
  private galleryService = inject(GalleryService);
  private indexedDBService = inject(IndexedDBService);

  showCamera = signal(false);
  capturedImage = signal<string | null>(null);
  searching = signal(false);
  error = signal<string | null>(null);
  searchResults = signal<PhotoResult[]>([]);
  showPhotoModal = signal(false);
  selectedPhoto = signal<PhotoResult | null>(null);
  hasSearched = signal(false);

  private mediaStream: MediaStream | null = null;
  private currentCameraIndex = 0;
  private availableCameras: MediaDeviceInfo[] = [];

  async ngOnInit() {
    await this.getCameraDevices();
    await this.loadSavedPhoto();
  }

  ngOnDestroy() {
    this.stopCamera();
  }

  goBack() {
    this.router.navigate(['/gallery']);
  }

  private async getCameraDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.availableCameras = devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting camera devices:', error);
    }
  }

  private async loadSavedPhoto() {
    try {
      const savedPhoto = await this.indexedDBService.getPhoto('face-search-photo');
      if (savedPhoto) {
        this.capturedImage.set(savedPhoto);
      }
    } catch (error) {
      console.error('Error loading saved photo:', error);
    }
  }

  async startCamera() {
    try {
      this.error.set(null);
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: this.availableCameras[this.currentCameraIndex]?.deviceId,
          facingMode: this.currentCameraIndex === 0 ? 'user' : 'environment'
        },
        audio: false
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.showCamera.set(true);

      setTimeout(() => {
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = this.mediaStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      this.error.set('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  }

  stopCamera() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.showCamera.set(false);
  }

  async switchCamera() {
    if (this.availableCameras.length <= 1) return;

    this.currentCameraIndex = (this.currentCameraIndex + 1) % this.availableCameras.length;
    this.stopCamera();
    await this.startCamera();
  }

  capturePhoto() {
    if (!this.videoElement?.nativeElement || !this.canvasElement?.nativeElement) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, {type: 'image/jpeg'});

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        this.capturedImage.set(imageDataUrl);
        this.searchResults.set([]);
        this.hasSearched.set(false);

        try {
          await this.indexedDBService.savePhoto('face-search-photo', imageDataUrl);
        } catch (error) {
          console.error('Error saving photo to IndexedDB:', error);
        }

        this.stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }

  async retakePhoto() {
    this.capturedImage.set(null);
    this.searchResults.set([]);
    this.hasSearched.set(false);

    try {
      await this.indexedDBService.deletePhoto('face-search-photo');
    } catch (error) {
      console.error('Error deleting photo from IndexedDB:', error);
    }
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result as string;
      this.capturedImage.set(result);
      this.searchResults.set([]);
      this.hasSearched.set(false);

      try {
        await this.indexedDBService.savePhoto('face-search-photo', result);
      } catch (error) {
        console.error('Error saving photo to IndexedDB:', error);
      }
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  async searchByFace() {
    if (!this.capturedImage()) return;

    this.searching.set(true);
    this.error.set(null);

    try {
      const blob = this.dataURLToBlob(this.capturedImage()!);
      const file = new File([blob], `face-search-${Date.now()}.jpg`, {type: 'image/jpeg'});

      this.galleryService.getFaces(file).subscribe({
        next: (faces) => {
          const photoResults: PhotoResult[] = faces.map(face => ({
            id: face.faceId,
            url: this.getCloudFrontUrl(face.share_path),
            thumbnailUrl: this.getCloudFrontUrl(face.share_path),
            title: face.imageName,
            uploadedAt: new Date(face.created_at),
            confidence: face.confidence,
            originalPath: face.share_path
          }));
          this.searchResults.set(photoResults);
          this.hasSearched.set(true);
          this.searching.set(false);
        },
        error: (error) => {
          console.error('Error during face search:', error);
          this.error.set('Error al buscar fotos. Inténtalo de nuevo.');
          this.searchResults.set([]);
          this.hasSearched.set(true);
          this.searching.set(false);
        }
      });
    } catch (error) {
      console.error('Error processing image for search:', error);
      this.error.set('Error al procesar la imagen. Inténtalo de nuevo.');
      this.searching.set(false);
    }
  }

  private dataURLToBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type: mime});
  }

  openPhoto(photo: PhotoResult) {
    this.selectedPhoto.set(photo);
    this.showPhotoModal.set(true);
  }

  closePhotoModal() {
    this.showPhotoModal.set(false);
    this.selectedPhoto.set(null);
  }

  private getCloudFrontUrl(imagePath: string): string {
    if (!imagePath) return '';

    const cleanPath = imagePath.startsWith('share/')
      ? imagePath.substring(6)
      : imagePath;
    return `${environment.cloudfrontUrl}/${cleanPath}`;
  }

  downloadPhoto(photo: PhotoResult): void {
    const downloadUrl = photo.originalPath
      ? this.getCloudFrontUrl(photo.originalPath)
      : photo.url;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = photo.title!;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
