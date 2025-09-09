import {ChangeDetectionStrategy, Component, inject, input, output, signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {SlidePanelComponent} from "../slide-panel/slide-panel.component";
import {
  NotificationRequest,
  NotificationsService
} from "../../core/services/notifications.service";

export interface CreateNotificationData {
  title: string;
  description: string;
  author: string;
  targetRole: string;
  userId: string;
}

export interface NotificationTemplate {
  title: string;
  body: string;
  type: 'evento' | 'anuncio' | 'recompensa';
  description: string;
}

@Component({
  selector: 'app-create-notification',
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
  body = signal<string>('');
  image = signal<string>('');
  actionType = signal<'link' | 'screen'>('screen');
  actionValue = signal<string>('');
  type = signal<'evento' | 'anuncio' | 'recompensa'>('anuncio');
  audience = signal<'all' | 'segment' | 'user'>('all');
  userId = signal<string>('');
  segmentId = signal<string>('');
  isLoading = signal<boolean>(false); // Estado de loading

  // Templates predefinidos de notificaciones
  notificationTemplates: NotificationTemplate[] = [
    {
      title: '🚀 ¡Inscripciones Abiertas!',
      body: '¡No te pierdas la oportunidad de participar en el AWS Community Day Bolivia! Regístrate ahora y asegura tu lugar.',
      type: 'evento',
      description: 'Notificación atractiva para abrir inscripciones'
    },
    {
      title: '🎤 Charla Comenzando',
      body: '¡La charla "Serverless en AWS" está por comenzar! Dirígete al auditorio principal.',
      type: 'evento',
      description: 'Aviso de inicio de charla'
    },
    {
      title: '✅ Charla Finalizada',
      body: '¡Gracias por asistir a "Serverless en AWS"! Recuerda completar la evaluación.',
      type: 'evento',
      description: 'Aviso de finalización de charla'
    },
    {
      title: '⚠️ Aviso Importante',
      body: 'Cambio de horario: La keynote principal será a las 15:00 en lugar de las 14:00.',
      type: 'anuncio',
      description: 'Aviso general importante'
    },
    {
      title: '🚨 URGENTE - Cambio de Sala',
      body: 'La charla "Machine Learning" se realizará en el Auditorio B debido a problemas técnicos.',
      type: 'anuncio',
      description: 'Aviso urgente de cambio'
    },
    {
      title: '🎁 ¡Recompensa Disponible!',
      body: 'Completa 3 charlas y reclama tu badge especial de "AWS Explorer".',
      type: 'recompensa',
      description: 'Notificación de recompensa'
    },
    {
      title: '🍕 ¡Break de Networking!',
      body: 'Disfruta de un café y conoce a otros desarrolladores. ¡Networking en el lobby principal!',
      type: 'evento',
      description: 'Aviso de break y networking'
    },
    {
      title: '📱 App Actualizada',
      body: 'Nueva funcionalidad disponible: Ahora puedes ver tu historial de puntos en tiempo real.',
      type: 'anuncio',
      description: 'Aviso de actualización de app'
    }
  ];

  selectedTemplate = signal<NotificationTemplate | null>(null);

  onTitleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.title.set(target.value);
  }

  onBodyChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.body.set(target.value);
  }

  onImageChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.image.set(target.value);
  }

  onActionTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.actionType.set(target.value as 'link' | 'screen');
  }

  onActionValueChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.actionValue.set(target.value);
  }

  onTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.type.set(target.value as 'evento' | 'anuncio' | 'recompensa');
  }

  onAudienceChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.audience.set(target.value as 'all' | 'segment' | 'user');
  }

  onUserIdChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.userId.set(target.value);
  }

  onSegmentIdChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.segmentId.set(target.value);
  }

  onTemplateSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const templateId = target.value;

    if (templateId === 'custom') {
      this.selectedTemplate.set(null);
      this.resetForm();
      return;
    }

    const template = this.notificationTemplates.find(t => t.title === templateId);
    if (template) {
      this.selectedTemplate.set(template);
      this.title.set(template.title);
      this.body.set(template.body);
      this.type.set(template.type);
    }
  }

  async onSubmit() {
    if (this.title().trim() && this.body().trim()) {
      // Activar estado de loading
      this.isLoading.set(true);

      const notificationData: NotificationRequest = {
        title: this.title().trim(),
        body: this.body().trim(),
        type: this.type(),
        audience: this.audience(),
        ...(this.image() && { image: this.image() }),
        ...(this.actionType() && { actionType: this.actionType() }),
        ...(this.actionValue() && { actionValue: this.actionValue() }),
        ...(this.audience() === 'user' && this.userId() && { userId: this.userId() }),
        ...(this.audience() === 'segment' && this.segmentId() && { segmentId: this.segmentId() }),
        ...(this.audience() === 'all' && { segmentId: 'all', userId: 'none' }),
      };

      try {
        this.#notificationsService.createNotification(notificationData).subscribe({
          next: (response) => {
            console.log('Notificación creada:', response);
            this.resetForm();
            this.onClose();
          },
          error: (error) => {
            console.error('Error creando notificación:', error);
            // Desactivar loading en caso de error
            this.isLoading.set(false);
          },
          complete: () => {
            // Asegurar que el loading se desactive al completar
            this.isLoading.set(false);
          }
        });
      } catch (error) {
        console.error('Error creando notificación:', error);
        // Desactivar loading en caso de error
        this.isLoading.set(false);
      }
    }
  }

  onClose() {
    this.closePanel.emit();
  }

  private resetForm() {
    this.title.set('');
    this.body.set('');
    this.image.set('');
    this.actionType.set('screen');
    this.actionValue.set('');
    this.type.set('anuncio');
    this.audience.set('all');
    this.userId.set('');
    this.segmentId.set('');
    this.selectedTemplate.set(null);
    this.isLoading.set(false); // Resetear estado de loading
  }

  isFormValid(): boolean {
    return this.title().trim().length > 0 && this.body().trim().length > 0 && !this.isLoading();
  }
}
