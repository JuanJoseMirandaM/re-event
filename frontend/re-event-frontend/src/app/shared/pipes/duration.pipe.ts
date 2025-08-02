import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration',
  standalone: true
})
export class DurationPipe implements PipeTransform {
  transform(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else if (minutes < 1440) { // 24 * 60 = 1440 minutes in a day
      const hours = Math.floor(minutes / 60);
      return `${hours} hrs`;
    } else {
      const days = Math.floor(minutes / 1440);
      return `${days} días`;
    }
  }
}