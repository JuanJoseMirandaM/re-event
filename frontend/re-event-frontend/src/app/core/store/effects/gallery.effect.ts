import { inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, exhaustMap, map, of, switchMap, take } from 'rxjs';
import { galleryActions } from '../actions/gallery.action';
import { GalleryService } from '../../services/gallery.service';

const loadPhotos$ = createEffect(
  (actions$ = inject(Actions), galleryService = inject(GalleryService)) => {
    return actions$.pipe(
      ofType(galleryActions.loadPhotos),
      exhaustMap(({ params }) =>
        galleryService.getPhotos(params).pipe(
          take(1),
          map((response) => galleryActions.loadPhotosSuccess({ response })),
          catchError((error) => of(galleryActions.loadPhotosFailure({ error })))
        )
      )
    );
  },
  { functional: true }
);

const loadMorePhotos$ = createEffect(
  (actions$ = inject(Actions), galleryService = inject(GalleryService)) => {
    return actions$.pipe(
      ofType(galleryActions.loadMorePhotos),
      switchMap(({ params }) =>
        galleryService.getPhotos(params).pipe(
          take(1),
          map((response) => galleryActions.loadPhotosSuccess({ response })),
          catchError((error) => of(galleryActions.loadPhotosFailure({ error })))
        )
      )
    );
  },
  { functional: true }
);

const uploadPhoto$ = createEffect(
  (actions$ = inject(Actions), galleryService = inject(GalleryService)) => {
    return actions$.pipe(
      ofType(galleryActions.uploadPhoto),
      exhaustMap(({ params }) =>
        galleryService.uploadPhoto(params).pipe(
          take(1),
          map((photo) => galleryActions.uploadPhotoSuccess({ photo })),
          catchError((error) => of(galleryActions.uploadPhotoFailure({ error })))
        )
      )
    );
  },
  { functional: true }
);

const deletePhoto$ = createEffect(
  (actions$ = inject(Actions), galleryService = inject(GalleryService)) => {
    return actions$.pipe(
      ofType(galleryActions.deletePhoto),
      exhaustMap(({ photoId }) =>
        galleryService.deletePhoto(photoId).pipe(
          take(1),
          map(() => galleryActions.deletePhotoSuccess({ photoId })),
          catchError((error) => of(galleryActions.deletePhotoFailure({ error })))
        )
      )
    );
  },
  { functional: true }
);

export const GalleryEffects = {
  loadPhotos$,
  loadMorePhotos$,
  uploadPhoto$,
  deletePhoto$,
};