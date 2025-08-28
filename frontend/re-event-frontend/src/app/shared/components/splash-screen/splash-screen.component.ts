import { ChangeDetectionStrategy, Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';
import { SplashScreenService } from '../../../core/services/splash-screen.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SplashScreenComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  private loaderService = inject(LoaderService);
  private splashService = inject(SplashScreenService);
  private destroy$ = new Subject<void>();

  // Computed properties from service
  showLogo = this.splashService.showLogo;
  showText = this.splashService.showText;
  showProgress = this.splashService.showProgress;
  progressValue = this.splashService.progressValue;
  isComplete = this.splashService.isComplete;
  isVisible = this.splashService.isVisible;
  
  // Debug properties
  isAuthReady = false;

  ngOnInit() {
    // Configurar callback para cuando el progreso esté completo
    this.splashService.setProgressCompleteCallback(() => {
      this.handleProgressComplete();
    });

    this.splashService.startAnimation();
    this.waitForAuthReady();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private waitForAuthReady() {
    this.authService.authState$
      .pipe(
        filter(state => !state.loading),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (authState) => {
          this.isAuthReady = true;
          
          // Si la animación ya terminó, completar el splash
          if (this.progressValue() >= 100) {
            this.handleProgressComplete();
          } else {
            console.log('SplashScreen: Progress not at 100% yet, waiting...');
          }
        },
        error: (error) => {
          console.error('SplashScreen: Error waiting for auth:', error);
          this.isAuthReady = true;
          if (this.progressValue() >= 100) {
            this.handleProgressComplete();
          }
        }
      });
  }

  private handleProgressComplete() {
    
    // Completar el splash
    this.splashService.complete();
    
    // Esperar un poco y luego navegar
    setTimeout(() => {
      this.splashService.hide();
      this.loaderService.hide();
      
      // Intentar navegar
      try {
        this.router.navigate(['/']).then(() => {
        }).catch((error) => {
          console.error('SplashScreen: Navigation failed:', error);
        });
      } catch (error) {
        console.error('SplashScreen: Navigation error:', error);
      }
    }, 800);
  }
}
