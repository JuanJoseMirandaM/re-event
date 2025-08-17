import {Injectable, signal} from '@angular/core';
import {ToastOptions} from '../../interfaces/toast-options.interface';
import {ToastItem, ToastType} from '../../interfaces/toast-item.interface';

@Injectable({providedIn: 'root'})
export class ToastService {
  toasts = signal<ToastItem[]>([]);

  show(message: string, opts: ToastOptions = {}): string {
    const id = opts.id ?? crypto.randomUUID();
    const type: ToastType = opts.type ?? 'info';
    const durationMs = typeof opts.durationMs === 'number' ? opts.durationMs : 4000;
    const dismissible = opts.dismissible ?? true;

    const item: ToastItem = {
      id,
      message,
      type,
      createdAt: Date.now(),
      dismissible,
      durationMs,
      customClass: opts.customClass
    };

    this.toasts.update(list => [item, ...list]);

    if (durationMs > 0) {
      window.setTimeout(() => this.dismiss(id), durationMs);
    }

    return id;
  }

  success(message: string, opts: Omit<ToastOptions, 'type'> = {}) {
    return this.show(message, {...opts, type: 'success'});
  }

  error(message: string, opts: Omit<ToastOptions, 'type'> = {}) {
    return this.show(message, {...opts, type: 'error'});
  }

  warning(message: string, opts: Omit<ToastOptions, 'type'> = {}) {
    return this.show(message, {...opts, type: 'warning'});
  }

  info(message: string, opts: Omit<ToastOptions, 'type'> = {}) {
    return this.show(message, {...opts, type: 'info'});
  }

  dismiss(id: string) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }

  clearAll() {
    this.toasts.set([]);
  }
}
