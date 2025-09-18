import {createSelector} from '@ngrx/store';
import {AppState} from '../../../app.state';

export const selectGallery = (state: AppState) => state.gallery;

export const selectPhotos = createSelector(
  selectGallery,
  (state) => state.photos
);

export const selectGalleryLoading = createSelector(
  selectGallery,
  (state) => state.loading
);

export const selectGalleryUploading = createSelector(
  selectGallery,
  (state) => state.uploading
);

export const selectGalleryError = createSelector(
  selectGallery,
  (state) => state.error
);

export const selectSelectedPhoto = createSelector(
  selectGallery,
  (state) => state.selectedPhoto
);

export const selectPhotoById = (photoId: string) => createSelector(
  selectPhotos,
  (photos) => photos.find(photo => photo.id === photoId)
);

export const selectPhotosByEventId = (eventId: string) => createSelector(
  selectPhotos,
  (photos) => photos.filter(photo => photo.eventId === eventId)
);

export const selectGalleryLastKey = createSelector(
  selectGallery,
  (state) => state.lastKey
);

export const selectGalleryTotalCount = createSelector(
  selectGallery,
  (state) => state.totalCount
);

export const selectHasMorePhotos = createSelector(
  selectGallery,
  (state) => state.lastKey !== null
);