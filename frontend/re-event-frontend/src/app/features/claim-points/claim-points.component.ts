import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {ToastService} from '../../core/services/toast.service';
import {PointsService} from '../../core/services/points.service';
import {first} from 'rxjs';
import {LoaderService} from '../../core/services/loader.service';

@Component({
  selector: 'app-claim-points',
  imports: [],
  templateUrl: './claim-points.component.html',
  styleUrl: './claim-points.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex--col gap-4 p-2'
  }
})
export default class ClaimPointsComponent {
  #toast = inject(ToastService);
  #pointsService = inject(PointsService);
  #loaderService = inject(LoaderService);

  submit(rawCode: string) {
    if (rawCode.trim() === '') return;
    this.#loaderService.show();
    this.#pointsService.claimPoints(rawCode.trim().toUpperCase())
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.#toast.success(`Congratulations! You have earned ${response.pointsEarned} points.`);
        },
        error: () => {
          this.#toast.error('Error claiming points');
          this.#loaderService.hide()
        },
        complete: () => this.#loaderService.hide()
      })
  }
}
