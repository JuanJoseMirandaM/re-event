import {ChangeDetectionStrategy, Component, ElementRef, inject, OnDestroy, signal, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {CommonModule, DatePipe, DecimalPipe} from '@angular/common';
import {TranslatePipe} from '@ngx-translate/core';
import {GalleryService} from '../../core/services/gallery.service';
import {ToastService} from '../../core/services/toast.service';

interface PhotoResult {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  uploadedAt?: Date;
  confidence?: number;
  description?: string;
  tags?: string[];
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
  private toastService = inject(ToastService);

  showCamera = signal(false);
  capturedImage = signal<string | null>(null);
  searching = signal(false);
  error = signal<string | null>(null);
  searchResults = signal<PhotoResult[]>([]);
  showPhotoModal = signal(false);
  selectedPhoto = signal<PhotoResult | null>(null);

  private mediaStream: MediaStream | null = null;
  private currentCameraIndex = 0;
  private availableCameras: MediaDeviceInfo[] = [];

  async ngOnInit() {
    await this.getCameraDevices();
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

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie-${Date.now()}.jpg`, {type: 'image/jpeg'});

        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        this.capturedImage.set(imageDataUrl);
        this.searching.set(true);

        this.galleryService.getFaces(file).subscribe(console.log)
        this.stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }

  retakePhoto() {
    this.capturedImage.set(null);
    this.searchResults.set([]);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error.set('Por favor selecciona un archivo de imagen válido.');
      return;
    }

    // Display the selected image
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      this.capturedImage.set(result);
      this.searchResults.set([]);
    };
    reader.readAsDataURL(file);

    // Use gallery service to process the face search
    this.searching.set(true);
    this.galleryService.getFaces(file).subscribe({
      next: (searchResults) => {
        this.searching.set(false);
      },
      error: (error) => {
        console.error('Error during face search:', error);
        this.error.set('Error al buscar fotos. Inténtalo de nuevo.');
        this.searching.set(false);
      }
    });

    input.value = '';
  }

  async searchByFace() {

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
}
