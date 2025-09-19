import {UserState} from './core/store/store/user.state';
import {EventsState} from './core/store/store/events.state';
import {GalleryState} from './core/store/store/gallery.state';

export interface AppState {
  user: UserState;
  events: EventsState;
  gallery: GalleryState;
}