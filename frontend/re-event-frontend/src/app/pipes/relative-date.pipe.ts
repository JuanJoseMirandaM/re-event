import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeDate',
  standalone: true
})
export class RelativeDatePipe implements PipeTransform {
  transform(value: string | Date, format: 'relative' | 'full' | 'short' = 'relative'): string {
    if (!value) return '';
    
    let date: Date;
    
    // Si es un string que parece ser solo fecha (YYYY-MM-DD), tratarlo como fecha local
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      date = new Date(year, month - 1, day); // month es 0-indexado
    } else {
      date = new Date(value);
    }
    
    const now = new Date();
    
    // Resetear horas para comparar solo fechas
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = dateOnly.getTime() - nowOnly.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (format === 'relative') {
      return this.getRelativeDate(diffDays, date);
    } else if (format === 'full') {
      return this.getFullDate(date);
    } else {
      return this.getShortDate(date);
    }
  }
  
  private getRelativeDate(diffDays: number, date: Date): string {
    switch (diffDays) {
      case 0:
        return 'Hoy';
      case 1:
        return 'Mañana';
      case -1:
        return 'Ayer';
      case 2:
        return 'Pasado mañana';
      case -2:
        return 'Anteayer';
      case 3:
        return 'En 3 días';
      case -3:
        return 'Hace 3 días';
      case 4:
        return 'En 4 días';
      case -4:
        return 'Hace 4 días';
      case 5:
        return 'En 5 días';
      case -5:
        return 'Hace 5 días';
      case 6:
        return 'En 6 días';
      case -6:
        return 'Hace 6 días';
      case 7:
        return 'En 1 semana';
      case -7:
        return 'Hace 1 semana';
      default:
        if (diffDays > 0) {
          if (diffDays < 30) {
            return `En ${diffDays} días`;
          } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `En ${months} ${months === 1 ? 'mes' : 'meses'}`;
          } else {
            const years = Math.floor(diffDays / 365);
            return `En ${years} ${years === 1 ? 'año' : 'años'}`;
          }
        } else {
          if (Math.abs(diffDays) < 30) {
            return `Hace ${Math.abs(diffDays)} días`;
          } else if (Math.abs(diffDays) < 365) {
            const months = Math.floor(Math.abs(diffDays) / 30);
            return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
          } else {
            const years = Math.floor(Math.abs(diffDays) / 365);
            return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
          }
        }
    }
  }
  
  private getFullDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('es-ES', options);
  }
  
  private getShortDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    };
    
    return date.toLocaleDateString('es-ES', options);
  }
}
