import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  imports: [CommonModule],
  template: `
    <div class="logout-container">
      <div class="loading-spinner">
        <div class="spinner spinner--md"></div>
        <p>Cerrando sesión...</p>
        <p class="subtitle">Redirigiendo al login</p>
      </div>
    </div>
  `,
  styles: [`
    .logout-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 2rem;
    }

    .loading-spinner {
      text-align: center;
    }

    .subtitle {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class LogoutComponent implements OnInit {
  #router = inject(Router);
  #authService = inject(AuthService);

  ngOnInit() {
    this.#authService.clearError();

    setTimeout(() => {
      this.#router.navigate(['/login'], { replaceUrl: true });
    }, 1500);
  }
}
