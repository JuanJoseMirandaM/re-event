import {ChangeDetectionStrategy, Component, inject, input, output, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {SlidePanelComponent} from "../slide-panel/slide-panel.component";
import {NotificationsService, NotificationInput} from "../../core/services/notifications.service";

export interface CreateNotificationData {
  title: string;
  description: string;
  author: string;
  targetRole: string;
  userId: string;
}

@Component({
  selector: 'app-create-notification',
  standalone: true,
  imports: [FormsModule, SlidePanelComponent],
  templateUrl: './create-notification.component.html',
  styleUrl: './create-notification.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateNotificationComponent {
  isVisible = input.required<boolean>();

  closePanel = output<void>();

  #notificationsService = inject(NotificationsService);

  title = signal<string>('');
  description = signal<string>('');
  author = signal<string>('AWS Bolivia');
  targetRole = signal<string>('none');
  userId = signal<string>('none');

  targetRoleOptions = [
    { value: 'none', label: 'Sin rol específico' },
    { value: 'ALL', label: 'Todos los usuarios' },
    { value: 'ADMIN', label: 'Administradores' },
    { value: 'USER', label: 'Usuarios regulares' },
    { value: 'SPEAKER', label: 'Speakers' },
    { value: 'ORGANIZER', label: 'Organizadores' }
  ];

  userIdOptions = [
    { value: 'none', label: 'Sin usuario específico' },
    { value: '75624637-0cbc-4af0-9b18-a363569ffaf8', label: 'jhonrocker2012@gmail.com' },
    { value: 'Google_103603576539873905090', label: 'jjsmm97@gmail.com' },
    { value: 'Google_106829095484183017978', label: 'juanjosesmiranda@gmail.com' }
  ];

  onTitleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.title.set(target.value);
  }

  onDescriptionChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.description.set(target.value);
  }

  onAuthorChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.author.set(target.value);
  }

  onTargetRoleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.targetRole.set(target.value);
  }

  onUserIdChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.userId.set(target.value);
  }

  async onSubmit() {
    if (this.title().trim() && this.description().trim()) {
      const notificationData: NotificationInput = {
        title: this.title().trim(),
        description: this.description().trim(),
        author: this.author().trim() || 'AWS Bolivia',
        targetRole: this.targetRole() || 'none',
        userId: this.userId() || 'none'
      };

      try {
        // await this.#notificationsService.createNotification(notificationData);
        this.resetForm();
        this.onClose();
      } catch (error) {
        console.error('Error creando notificación:', error);
      }
    }
  }

  onClose() {
    this.closePanel.emit();
  }

  private resetForm() {
    this.title.set('');
    this.description.set('');
    this.author.set('AWS Bolivia');
    this.targetRole.set('none');
    this.userId.set('none');
  }

  isFormValid(): boolean {
    return this.title().trim().length > 0 && this.description().trim().length > 0;
  }
}
