export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  uploadedBy: string;
  uploadedAt: string;
  eventId?: string;
  tags?: string[];
  size?: number;
  mimeType?: string;
}

export interface GalleryState {
  photos: Photo[];
  loading: boolean;
  uploading: boolean;
  error: any;
  lastKey: string | null;
  totalCount: number;
  selectedPhoto: Photo | null;
}

export const galleryInitialState: GalleryState = {
  photos: [],
  loading: false,
  uploading: false,
  error: null,
  lastKey: null,
  totalCount: 0,
  selectedPhoto: null,
};