import {createAction, props} from '@ngrx/store';
import {Photo} from '../store/gallery.state';

export interface GalleryParams {
  limit?: number;
  lastKey?: string;
  eventId?: string;
  userId?: string;
}

export interface GalleryResponse {
  photos: Photo[];
  lastKey: string | null;
  totalCount: number;
}

export interface UploadPhotoParams {
  file: File;
  title?: string;
  description?: string;
  eventId?: string;
  tags?: string[];
}

export enum GalleryAction {
  LOAD_PHOTOS = '[Gallery] Load Photos',
  LOAD_PHOTOS_SUCCESS = '[Gallery API] Load Photos Success',
  LOAD_PHOTOS_FAILURE = '[Gallery API] Load Photos Failure',

  LOAD_MORE_PHOTOS = '[Gallery] Load More Photos',

  UPLOAD_PHOTO = '[Gallery] Upload Photo',
  UPLOAD_PHOTO_SUCCESS = '[Gallery API] Upload Photo Success',
  UPLOAD_PHOTO_FAILURE = '[Gallery API] Upload Photo Failure',

  DELETE_PHOTO = '[Gallery] Delete Photo',
  DELETE_PHOTO_SUCCESS = '[Gallery API] Delete Photo Success',
  DELETE_PHOTO_FAILURE = '[Gallery API] Delete Photo Failure',

  SELECT_PHOTO = '[Gallery] Select Photo',
  CLEAR_SELECTED_PHOTO = '[Gallery] Clear Selected Photo',

  CLEAR_PHOTOS = '[Gallery] Clear Photos',
}

export const galleryActions = {
  loadPhotos: createAction(
    GalleryAction.LOAD_PHOTOS,
    props<{ params?: GalleryParams }>()
  ),
  loadPhotosSuccess: createAction(
    GalleryAction.LOAD_PHOTOS_SUCCESS,
    props<{ response: GalleryResponse }>()
  ),
  loadPhotosFailure: createAction(
    GalleryAction.LOAD_PHOTOS_FAILURE,
    props<{ error: any }>()
  ),

  loadMorePhotos: createAction(
    GalleryAction.LOAD_MORE_PHOTOS,
    props<{ params?: GalleryParams }>()
  ),

  uploadPhoto: createAction(
    GalleryAction.UPLOAD_PHOTO,
    props<{ params: UploadPhotoParams }>()
  ),
  uploadPhotoSuccess: createAction(
    GalleryAction.UPLOAD_PHOTO_SUCCESS,
    props<{ photo: Photo }>()
  ),
  uploadPhotoFailure: createAction(
    GalleryAction.UPLOAD_PHOTO_FAILURE,
    props<{ error: any }>()
  ),

  deletePhoto: createAction(
    GalleryAction.DELETE_PHOTO,
    props<{ photoId: string }>()
  ),
  deletePhotoSuccess: createAction(
    GalleryAction.DELETE_PHOTO_SUCCESS,
    props<{ photoId: string }>()
  ),
  deletePhotoFailure: createAction(
    GalleryAction.DELETE_PHOTO_FAILURE,
    props<{ error: any }>()
  ),

  selectPhoto: createAction(
    GalleryAction.SELECT_PHOTO,
    props<{ photo: Photo }>()
  ),
  clearSelectedPhoto: createAction(GalleryAction.CLEAR_SELECTED_PHOTO),

  clearPhotos: createAction(GalleryAction.CLEAR_PHOTOS),
};