import {ToastType} from './toast-item.interface';

/**
 * Interface defining options for displaying toast notifications
 */
export interface ToastOptions {
  /** Type of toast message (success, error, warning, info) */
  type?: ToastType;

  /** Duration in milliseconds before auto-dismissal. Set to 0 or negative to persist */
  durationMs?: number;

  /** Whether the toast can be manually dismissed by the user */
  dismissible?: boolean;

  /** Custom ID for deduplication if needed */
  id?: string;

  /** Custom CSS classes to apply (e.g. 'bg-success text-on-success') */
  customClass?: string;
}
