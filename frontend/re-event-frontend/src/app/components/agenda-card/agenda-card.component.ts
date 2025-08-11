import {ChangeDetectionStrategy, Component, input} from '@angular/core';
import {Event} from '../../core/services/events.service';
import {DurationPipe} from '../../pipes/duration.pipe';

@Component({
  selector: 'app-agenda-card',
  imports: [DurationPipe],
  templateUrl: './agenda-card.component.html',
  styleUrl: './agenda-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaCardComponent {
  event = input.required<Event>();

  isPastEvent(): boolean {
    const eventDate = new Date(this.event().startDate);
    return eventDate < new Date();
  }

  getSpeakerNames(): string {
    return this.event().speakers?.map(speaker => speaker.name).join(', ') || 'AWS UG';
  }

  getStartTime(): string {
    const startDate = new Date(this.event().startDate);
    return startDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });
  }
}
