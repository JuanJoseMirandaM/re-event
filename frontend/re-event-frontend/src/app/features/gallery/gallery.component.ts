import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {Photo} from '../../core/store/store/gallery.state';
import {GalleryService, GroupedFacesResponse, ImageWithFaces} from '../../core/services/gallery.service';
import {debounceTime, delay, distinctUntilChanged, Subject} from 'rxjs';

@Component({
  selector: 'app-gallery',
  imports: [
    CommonModule,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex--col gap-4 p-4 h-full'
  }
})
export default class GalleryComponent implements OnInit {
  #galleryService = inject(GalleryService);
  #router = inject(Router);
  #searchSubject = new Subject<string>();

  photos = signal<Photo[]>([]);
  images = signal<ImageWithFaces[]>([]);
  loading = signal(false);
  uploading = signal(false);
  error = signal<any>(null);
  selectedPhoto = signal<Photo | null>(null);

  currentPage = signal(0);
  pageSize = signal(24);
  totalPhotos = signal(0);
  totalPages = signal(0);

  searchTerm = signal('');
  isFaceSearchMode = signal(false);

  showPhotoModal = signal(false);
  showUploadModal = signal(false);

  ngOnInit() {
    this.loadPhotos();

    this.#searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.searchTerm.set(term);
      this.currentPage.set(0);
      this.loadPhotos();
    });
  }

  loadPhotos() {
    this.loading.set(true);
    this.error.set(null);

    this.#galleryService.getFacesFromAPI(this.currentPage(), this.pageSize()).subscribe({
      next: (response: GroupedFacesResponse) => {
        let filteredImages = response.items;
        if (this.searchTerm()) {
          filteredImages = response.items.filter(image =>
            image.imageName.toLowerCase().includes(this.searchTerm().toLowerCase())
          );
        }

        this.images.set(filteredImages);

        const convertedPhotos = this.#galleryService.convertImageWithFacesToPhotos(filteredImages);
        this.photos.set(convertedPhotos);

        this.totalPhotos.set(response.pagination.totalItems);
        this.totalPages.set(response.pagination.totalPages);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error);
        console.error('Error loading gallery:', error);
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadPhotos();
  }

  refreshGallery() {
    this.loadPhotos();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadFile(file);
      input.value = '';
    }
  }

  uploadFile(file: File) {
    this.uploading.set(true);
    this.error.set(null);

    const request = {
      fileName: file.name,
      type: 'to-rekognize' as const
    };

    this.#galleryService.generatePresignedBatch(request).subscribe({
      next: (response) => {
        this.#galleryService.uploadFileToS3(response, file).pipe(delay(5000)).subscribe({
          next: () => {
            this.uploading.set(false);
            this.refreshGallery();
          },
          error: (error) => {
            console.error(`❌ Error uploading file:`, error);
            this.error.set(`Error uploading ${file.name}: ${error.message}`);
            this.uploading.set(false);
          }
        });
      },
      error: (error) => {
        console.error(`❌ Error getting presigned URL:`, error);
        this.error.set(`Error getting upload URL for ${file.name}: ${error.message}`);
        this.uploading.set(false);
      }
    });
  }

  openPhoto(photo: Photo): void {
    this.selectedPhoto.set(photo);
    this.showPhotoModal.set(true);
  }

  closePhotoModal(): void {
    this.showPhotoModal.set(false);
    this.selectedPhoto.set(null);
  }

  getPageNumbers(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const range = 5;

    let start = Math.max(0, current - Math.floor(range / 2));
    let end = Math.min(total, start + range);

    if (end - start < range && start > 0) {
      start = Math.max(0, end - range);
    }

    const pages: number[] = [];
    for (let i = start; i < end; i++) {
      pages.push(i);
    }

    return pages;
  }

  toggleFaceSearchMode() {
    this.isFaceSearchMode.update(current => !current);
    if (this.isFaceSearchMode()) {
      this.#router.navigate(['/secure/face-search']);
    }
  }

  downloadPhoto(photo: Photo): void {
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = photo.title || `photo-${photo.id}.jpg`;
    link.target = '_blank';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
