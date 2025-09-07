import {ChangeDetectionStrategy, Component, inject, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {PointsService} from '../../core/services/points.service';
import {ActivatedRoute} from "@angular/router";
import {ToastService} from '../../core/services/toast.service';
import {first} from "rxjs";

const REDEEM_DATA_KEY = 're_event_redeem_data';

@Component({
  selector: 'app-redeem-points',
  imports: [FormsModule],
  templateUrl: './redeem-points.component.html',
  styleUrl: './redeem-points.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex--col gap-2 p-4'
  }
})
export default class RedeemPointsComponent implements OnInit {
  #toast = inject(ToastService);
  #pointsService = inject(PointsService);
  #route = inject(ActivatedRoute);

  userId: string = '';
  points: number | null = null;
  description: string = '';

  ngOnInit() {
    /*TODO refactor to signals*/
    this.#route.params.pipe(first()).subscribe(params => {
      if (params['userId']) {
        this.userId = params['userId'];
      }
    });
    this.#loadDataFromStorage();
  }

  #loadDataFromStorage(): void {
    const storedData = localStorage.getItem(REDEEM_DATA_KEY);
    if (storedData) {
      const data = JSON.parse(storedData);
      this.points = data.points ?? null;
      this.description = data.description ?? '';
    }
  }

  #saveDataToStorage(): void {
    const data = {points: this.points, description: this.description};
    localStorage.setItem(REDEEM_DATA_KEY, JSON.stringify(data));
  }

  setPoints(points: number) {
    this.points = points;
    this.#saveDataToStorage();
  }

  onFieldChange(): void {
    this.#saveDataToStorage();
  }

  deductPoints() {
    if (!this.userId || !this.points || this.points <= 0 || !this.description) {
      this.#toast.error('Por favor, complete todos los campos.');
      return;
    }

    this.#pointsService.deductPoints(this.userId, this.points, this.description).subscribe({
      next: (response) => {
        this.#toast.success(`${response.pointsDeducted} Puntos deducidos con éxito.`);
      },
      error: (err) => {
        console.error(err);
        this.#toast.error('Error al deducir los puntos. Inténtelo de nuevo.');
      }
    });
  }
}
