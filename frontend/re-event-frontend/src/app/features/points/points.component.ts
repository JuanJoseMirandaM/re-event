import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {PointsCardComponent} from '../../components/points-card/points-card.component';
import {PointsHistoryResponse, PointsService} from '../../core/services/points.service';
import {toSignal} from '@angular/core/rxjs-interop';
import {TranslatePipe} from '@ngx-translate/core';
import {first} from 'rxjs';

@Component({
  selector: 'app-points',
  imports: [
    PointsCardComponent,
    TranslatePipe
  ],
  templateUrl: './points.component.html',
  styleUrl: './points.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex--col gap-2 p-4'
  }
})
export default class PointsComponent implements OnInit {
  #pointsService = inject(PointsService);

  isLoading = signal(true);
  pointsHistory = signal<PointsHistoryResponse>(
    {
      count: 0,
      items: [],
      lastKey: null
    }
  );

  points = toSignal(this.#pointsService.getTotalPoints(), {initialValue: 0})
  itemPoints = computed(() => this.pointsHistory().items);
  canLoadMore = computed(() => !!this.pointsHistory().lastKey);

  ngOnInit() {
    this.loadPointsHistory();
  }

  loadMore(): void {
    if (!this.canLoadMore() || this.isLoading()) {
      return;
    }
    this.loadPointsHistory(this.pointsHistory().lastKey!);
  }

  private loadPointsHistory(lastKey?: string): void {
    this.isLoading.set(true);
    const limit = 10;

    this.#pointsService.getPointsHistory({limit, lastKey})
      .pipe(first())
      .subscribe({
        next: (response) => {
          this.pointsHistory.update(currentHistory => ({
            ...response,
            items: lastKey ? [...currentHistory.items, ...response.items] : response.items,
          }));
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Error loading points history:', error);
          this.isLoading.set(false);
        }
      })
  }
}
