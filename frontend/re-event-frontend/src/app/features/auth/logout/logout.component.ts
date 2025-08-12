import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logout-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
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
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }
    
    .subtitle {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
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
