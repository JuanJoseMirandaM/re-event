import {ChangeDetectionStrategy, Component, input, output, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {SlidePanelComponent} from "../slide-panel/slide-panel.component";
import {TranslatePipe} from '@ngx-translate/core';

export interface RatingData {
  eventId: string;
  title: string;
  speaker: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-rating-panel',
  imports: [FormsModule, SlidePanelComponent, TranslatePipe],
  templateUrl: './rating-panel.component.html',
  styleUrl: './rating-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingPanelComponent {
  eventId = input.required<string>();
  title = input.required<string>();
  speaker = input.required<string>();
  isVisible = input.required<boolean>();

  submitRating = output<RatingData>();
  closePanel = output<void>();

  rating = signal<number>(0);
  comment = signal<string>('');
  hoveredRating = signal<number>(0);

  setRating(value: number) {
    this.rating.set(value);
  }

  setHoveredRating(value: number) {
    this.hoveredRating.set(value);
  }

  clearHoveredRating() {
    this.hoveredRating.set(0);
  }

  onCommentChange(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    this.comment.set(target.value);
  }

  onSubmit() {
    if (this.rating() > 0) {
      this.submitRating.emit({
        eventId: this.eventId(),
        title: this.title(),
        speaker: this.speaker(),
        rating: this.rating(),
        comment: this.comment()
      });

      this.rating.set(0);
      this.comment.set('');
    }
  }

  onClose() {
    this.closePanel.emit();
  }

  getStarClass(starIndex: number): string {
    const currentRating = this.hoveredRating() || this.rating();
    if (starIndex <= currentRating) {
      return 'star star--filled';
    }
    return 'star star--empty';
  }
}
