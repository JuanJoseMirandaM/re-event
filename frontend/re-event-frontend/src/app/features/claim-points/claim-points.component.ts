import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {ToastService} from '../../core/services/toast.service';
import {PointsService} from '../../core/services/points.service';
import {first} from 'rxjs';
import {LoaderService} from '../../core/services/loader.service';
import {Router} from '@angular/router';
import {ConfettiModalComponent, ConfettiModalConfig} from '../../components/confetti-modal/confetti-modal.component';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'app-claim-points',
  imports: [ConfettiModalComponent, TranslatePipe],
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
  #router = inject(Router);

  showConfetti = signal<boolean>(false);
  confettiConfig = signal<ConfettiModalConfig>({
    title: '',
    description: '',
    buttonText: '¡Genial!',
    icon: 'celebration',
    points: 0
  });

  goToQRScanner(): void {
    this.#router.navigate(['/secure/qr']);
  }

  submit(rawCode: string) {
    if (rawCode.trim() === '') return;

    this.#loaderService.show();
    this.#pointsService.claimPoints(rawCode.trim().toUpperCase())
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.confettiConfig.set({
            title: '¡Puntos Canjeados!',
            description: `¡Felicidades! Has ganado ${response.pointsEarned} puntos.`,
            buttonText: '¡Genial!',
            icon: 'celebration',
            points: response.pointsEarned
          });
          this.showConfetti.set(true);
          this.#loaderService.hide();
        },
        error: () => {
          this.#toast.error('Error al canjear puntos');
          this.#loaderService.hide();
        }
      });
  }

  onConfettiClose(): void {
    this.showConfetti.set(false);
    this.#router.navigate(['/secure/points']);
  }
}
