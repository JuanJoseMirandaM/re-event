export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  createdAt: number;
  dismissible: boolean;
  durationMs: number;
  customClass?: string;
}
