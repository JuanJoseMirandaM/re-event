import {Component, effect, ElementRef, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ToastService} from '../../../core/services/toast.service';
import {ToastItem} from '../../../interfaces/toast-item.interface';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss',
  host: {
    class: 'toast-container-host',
    role: 'region',
    'aria-label': 'Notifications'
  }
})
export class ToastContainerComponent {
  #toastService = inject(ToastService);
  toasts = this.#toastService.toasts;

  touchingId = signal<string | null>(null);
  startX = 0;
  currentX = 0;

  constructor(private el: ElementRef) {
    effect(() => {
      void this.toasts();
    });
  }

  onPointerDown(e: PointerEvent, id: string): void {
    this.touchingId.set(id);
    this.startX = e.clientX;
    this.currentX = e.clientX;
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.touchingId()) return;
    this.currentX = e.clientX;
    const dx = this.currentX - this.startX;
    const itemEl = this.#getItemEl(this.touchingId()!);
    if (itemEl) {
      itemEl.style.transform = `translateX(${dx}px)`;
      itemEl.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / 120));
    }
  }

  onPointerUp(e: PointerEvent): void {
    const id = this.touchingId();
    if (!id) return;
    const dx = this.currentX - this.startX;
    const threshold = 80;
    const itemEl = this.#getItemEl(id);

    if (Math.abs(dx) > threshold) {
      if (itemEl) {
        itemEl.style.transition = 'transform 160ms ease, opacity 160ms ease';
        itemEl.style.transform = `translateX(${dx > 0 ? 320 : -320}px)`;
        itemEl.style.opacity = '0';
        window.setTimeout(() => this.#toastService.dismiss(id), 160);
      } else {
        this.#toastService.dismiss(id);
      }
    } else if (itemEl) {
      itemEl.style.transition = 'transform 160ms ease, opacity 160ms ease';
      itemEl.style.transform = 'translateX(0)';
      itemEl.style.opacity = '1';
    }

    this.touchingId.set(null);
  }

  dismiss(id: string): void {
    this.#toastService.dismiss(id);
  }

  trackById(index: number, item: ToastItem) {
    return item.id;
  }

  #getItemEl(id: string): HTMLElement | null {
    return this.el.nativeElement.querySelector(`[data-toast-id="${id}"]`);
  }
}
