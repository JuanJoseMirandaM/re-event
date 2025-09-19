import {createReducer, on} from '@ngrx/store';
import {galleryActions} from '../actions/gallery.action';
import {galleryInitialState} from '../store/gallery.state';

export const galleryReducer = createReducer(
  galleryInitialState,

  // Load Photos
  on(galleryActions.loadPhotos, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(galleryActions.loadPhotosSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    photos: response.photos,
    lastKey: response.lastKey,
    totalCount: response.totalCount,
    error: null,
  })),
  on(galleryActions.loadPhotosFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load More Photos
  on(galleryActions.loadMorePhotos, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  // Upload Photo
  on(galleryActions.uploadPhoto, (state) => ({
    ...state,
    uploading: true,
    error: null,
  })),
  on(galleryActions.uploadPhotoSuccess, (state, { photo }) => ({
    ...state,
    uploading: false,
    photos: [photo, ...state.photos],
    totalCount: state.totalCount + 1,
    error: null,
  })),
  on(galleryActions.uploadPhotoFailure, (state, { error }) => ({
    ...state,
    uploading: false,
    error,
  })),

  // Delete Photo
  on(galleryActions.deletePhoto, (state) => ({
    ...state,
    error: null,
  })),
  on(galleryActions.deletePhotoSuccess, (state, { photoId }) => ({
    ...state,
    photos: state.photos.filter(photo => photo.id !== photoId),
    totalCount: state.totalCount - 1,
    selectedPhoto: state.selectedPhoto?.id === photoId ? null : state.selectedPhoto,
    error: null,
  })),
  on(galleryActions.deletePhotoFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Select Photo
  on(galleryActions.selectPhoto, (state, { photo }) => ({
    ...state,
    selectedPhoto: photo,
  })),
  on(galleryActions.clearSelectedPhoto, (state) => ({
    ...state,
    selectedPhoto: null,
  })),

  // Clear Photos
  on(galleryActions.clearPhotos, (state) => ({
    ...state,
    photos: [],
    lastKey: null,
    totalCount: 0,
    selectedPhoto: null,
    error: null,
  }))
);