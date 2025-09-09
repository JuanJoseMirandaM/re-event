import {Component, inject, signal} from '@angular/core';
import {TranslateModule, TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  imports: [TranslateModule],
  template: `
    <div class="language-selector">
      <button
        class="language-button"
        (click)="toggleLanguage()"
        [attr.aria-label]="'Cambiar idioma / Change language'"
      >
        <span class="material-symbols-outlined">language</span>
        <span class="language-text">{{ currentLanguage() }}</span>
      </button>
    </div>
  `,
  styles: [`
    .language-selector {
      display: flex;
      align-items: center;
    }

    .language-button {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      background: transparent;
      border: 1px solid var(--border-medium);
      border-radius: var(--border-radius-lg);
      padding: var(--space-2) var(--space-3);
      color: var(--text-secondary);
      font-size: var(--text-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-normal);

      &:hover {
        background: var(--bg-secondary);
        border-color: var(--primary-lilac);
        color: var(--primary-lilac);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }

      &:focus-visible {
        outline: 2px solid var(--primary-lilac);
        outline-offset: 2px;
      }
    }

    .language-icon {
      width: 18px;
      height: 18px;
    }

    .language-text {
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 480px) {
      .language-text {
        display: none;
      }

      .language-button {
        padding: var(--space-2);
      }
    }
  `]
})
export class LanguageSelectorComponent {
  #translateService = inject(TranslateService);
  currentLanguage = signal('ES');

  constructor() {
    // Initialize current language
    const currentLang = this.#translateService.currentLang || this.#translateService.getDefaultLang() || 'es';
    this.currentLanguage.set(currentLang.toUpperCase());
  }

  toggleLanguage(): void {
    const currentLang = this.#translateService.currentLang || 'es';
    const newLang = currentLang === 'es' ? 'en' : 'es';

    this.#translateService.use(newLang).subscribe(() => {
      this.currentLanguage.set(newLang.toUpperCase());
      // Store preference in localStorage
      localStorage.setItem('preferred-language', newLang);
    });
  }
}
