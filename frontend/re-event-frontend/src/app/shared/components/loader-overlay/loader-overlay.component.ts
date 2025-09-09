import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {LoaderService} from '../../../core/services/loader.service';

@Component({
  selector: 'app-loader-overlay',
  imports: [TranslatePipe],
  templateUrl: './loader-overlay.component.html',
  styleUrl: './loader-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoaderOverlayComponent {
  loader = inject(LoaderService);
}
