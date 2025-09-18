import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../app.state';
import { galleryActions, GalleryParams, UploadPhotoParams } from '../actions/gallery.action';
import {
  selectPhotos,
  selectGalleryLoading,
  selectGalleryUploading,
  selectGalleryError,
  selectSelectedPhoto,
  selectPhotoById,
  selectPhotosByEventId,
  selectGalleryLastKey,
  selectGalleryTotalCount,
  selectHasMorePhotos
} from '../selectors/gallery.selector';
import { Photo } from '../store/gallery.state';

@Injectable({
  providedIn: 'root',
})
export class GalleryStoreFacade {
  private readonly store = inject(Store<AppState>);

  // Selectors
  readonly photos$ = this.store.select(selectPhotos);
  readonly loading$ = this.store.select(selectGalleryLoading);
  readonly uploading$ = this.store.select(selectGalleryUploading);
  readonly error$ = this.store.select(selectGalleryError);
  readonly selectedPhoto$ = this.store.select(selectSelectedPhoto);
  readonly lastKey$ = this.store.select(selectGalleryLastKey);
  readonly totalCount$ = this.store.select(selectGalleryTotalCount);
  readonly hasMorePhotos$ = this.store.select(selectHasMorePhotos);

  // Actions
  loadPhotos(params?: GalleryParams): void {
    this.store.dispatch(galleryActions.loadPhotos({ params }));
  }

  loadMorePhotos(params?: GalleryParams): void {
    this.store.dispatch(galleryActions.loadMorePhotos({ params }));
  }

  uploadPhoto(params: UploadPhotoParams): void {
    this.store.dispatch(galleryActions.uploadPhoto({ params }));
  }

  deletePhoto(photoId: string): void {
    this.store.dispatch(galleryActions.deletePhoto({ photoId }));
  }

  selectPhoto(photo: Photo): void {
    this.store.dispatch(galleryActions.selectPhoto({ photo }));
  }

  clearSelectedPhoto(): void {
    this.store.dispatch(galleryActions.clearSelectedPhoto());
  }

  clearPhotos(): void {
    this.store.dispatch(galleryActions.clearPhotos());
  }

  // Utility selectors
  getPhotoById(photoId: string) {
    return this.store.select(selectPhotoById(photoId));
  }

  getPhotosByEventId(eventId: string) {
    return this.store.select(selectPhotosByEventId(eventId));
  }
}