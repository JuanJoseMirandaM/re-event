import {ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {AuthService} from '../../../core/services/auth.service';
import {LoaderService} from '../../../core/services/loader.service';
import {SplashScreenService} from '../../../core/services/splash-screen.service';
import {filter, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-splash-screen',
  imports: [TranslatePipe],
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

  showLogo = this.splashService.showLogo;
  showText = this.splashService.showText;
  showProgress = this.splashService.showProgress;
  progressValue = this.splashService.progressValue;
  isComplete = this.splashService.isComplete;
  isVisible = this.splashService.isVisible;

  isAuthReady = false;

  ngOnInit() {
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
    this.splashService.complete();

    setTimeout(() => {
      this.splashService.hide();
      this.loaderService.hide();

      try {
        // Preserve the current URL with query parameters
        const currentUrl = window.location.pathname + window.location.search;
        
        // Store the current URL in localStorage for other guards to use
        localStorage.setItem('lastVisitedUrl', currentUrl);
        
        // Check if we're already on the correct path
        if (currentUrl !== '/' && currentUrl !== '/login' && currentUrl.startsWith('/secure')) {
          // Don't navigate if we're already on the correct path
          return;
        }
        
        // Only navigate if we're not already on the correct path
        if (currentUrl !== '/' && currentUrl !== '/login') {
          this.router.navigateByUrl(currentUrl).then((success) => {
            // Navigation successful
          }).catch((error) => {
            console.error('SplashScreen: Navigation failed:', error);
            // Fallback to home if navigation fails
            this.router.navigate(['/secure/home']);
          });
        } else {
          // Default navigation for root path
          this.router.navigate(['/secure/home']);
        }
      } catch (error) {
        console.error('SplashScreen: Navigation error:', error);
        // Fallback to home if there's an error
        this.router.navigate(['/secure/home']);
      }
    }, 1000); // Increased timeout to give more time for guards to execute
  }
}
