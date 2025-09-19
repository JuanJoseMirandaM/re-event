import {ChangeDetectionStrategy, Component, computed, inject, input, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SlidePanelComponent} from "../slide-panel/slide-panel.component";
import {EventsService} from "../../core/services/events.service";

export interface CreateEventData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  time: number; // Cambiado a number para duración en minutos
  location: string;
  locationLink: string;
  speakers: string;
  tags: string;
}

@Component({
  selector: 'app-create-event',
  imports: [FormsModule, SlidePanelComponent],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateEventComponent {
  isVisible = input.required<boolean>();

  closePanel = output<void>();

  #eventsService = inject(EventsService);

  title = signal<string>('');
  description = signal<string>('');
  startDate = signal<string>('');
  endDate = signal<string>('');
  time = signal<number>(0); // Ahora es duración en minutos
  location = signal<string>('');
  locationLink = signal<string>('');
  speakers = signal<string>('');
  tags = signal<string>('');

  isFormValid = computed(() => {
    if (!this.title().trim() || !this.description().trim() || !this.startDate() || !this.endDate() || !this.location().trim()) {
      return false;
    }

    if (this.startDate() && this.endDate()) {
      const start = new Date(this.startDate());
      const end = new Date(this.endDate());
      if (start >= end) {
        return false;
      }
    }

    return true;
  });

  dateError = computed(() => {
    if (this.startDate() && this.endDate()) {
      const start = new Date(this.startDate());
      const end = new Date(this.endDate());
      if (start >= end) {
        return 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    return '';
  });

  durationInMinutes = computed(() => {
    if (!this.startDate() || !this.endDate()) return 0;

    const start = new Date(this.startDate());
    const end = new Date(this.endDate());

    if (start >= end) return 0;

    const diffMs = end.getTime() - start.getTime();
    return Math.round(diffMs / (1000 * 60)); // Convertir a minutos
  });

  durationDisplay = computed(() => {
    const minutes = this.durationInMinutes();
    if (minutes === 0) return 'Selecciona fechas válidas';

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
      return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    } else if (remainingMinutes === 0) {
      return `${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  });

  onTitleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.title.set(target.value);
  }

  onDescriptionChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.description.set(target.value);
  }

  onStartDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.startDate.set(target.value);
  }

  onEndDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.endDate.set(target.value);
  }

  onLocationChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.location.set(target.value);
  }

  onLocationLinkChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.locationLink.set(target.value);
  }

  onSpeakersChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.speakers.set(target.value);
  }

  onTagsChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.tags.set(target.value);
  }

  onSubmit() {
    if (this.isFormValid()) {
      const eventData = {
        title: this.title().trim(),
        description: this.description().trim(),
        startDate: this.startDate(),
        endDate: this.endDate(),
        time: this.durationInMinutes(), // Usar la duración calculada automáticamente
        location: this.location().trim(),
        locationLink: this.locationLink().trim() || undefined,
        speakers: this.speakers().trim() ? this.speakers().trim().split(',').map(s => s.trim()) : [],
        tags: this.tags().trim() ? this.tags().trim().split(',').map(t => t.trim()) : []
      };

      this.#eventsService.createEvent(eventData).subscribe({
        next: event => {
          this.resetForm();
          this.onClose();
        }, error: (error) => {
          console.error('Error creando evento:', error);
        }
      });
    }
  }

  onClose() {
    this.closePanel.emit();
  }

  private resetForm() {
    this.title.set('');
    this.description.set('');
    this.startDate.set('');
    this.endDate.set('');
    this.time.set(0);
    this.location.set('');
    this.locationLink.set('');
    this.speakers.set('');
    this.tags.set('');
  }
}
