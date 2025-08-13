import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-loader-overlay',
  imports: [CommonModule],
  templateUrl: './loader-overlay.component.html',
  styleUrl: './loader-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayComponent {
  loader = inject(LoaderService);
}
