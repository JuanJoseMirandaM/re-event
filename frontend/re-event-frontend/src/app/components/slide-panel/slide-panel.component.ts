import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-slide-panel',
  standalone: true,
  templateUrl: './slide-panel.component.html',
  styleUrl: './slide-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlidePanelComponent {
  isVisible = input.required<boolean>();

  closePanel = output<void>();

  onClose() {
    this.closePanel.emit();
  }
}
