import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {first} from 'rxjs';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:{
    'class': 'language-selector'
  }
})
export class LanguageSelectorComponent {
  #translateService = inject(TranslateService);
  currentLanguageCode = signal('es');

  constructor() {
    const currentLang = this.#translateService.getCurrentLang() || this.#translateService.getFallbackLang() || 'es';
    this.currentLanguageCode.set(currentLang);
  }

  /*TODO: transform to signals*/
  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newLang = select.value;

    this.#translateService.use(newLang).pipe(first()).subscribe(() => {
      this.currentLanguageCode.set(newLang);
      localStorage.setItem('preferred-language', newLang);
    });
  }
}
