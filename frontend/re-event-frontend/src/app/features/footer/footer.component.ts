import {ChangeDetectionStrategy, Component, inject, signal, OnInit} from '@angular/core';
import {Router, RouterLink, NavigationEnd} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {filter} from 'rxjs';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent implements OnInit {
  private router = inject(Router);

  activeRoute = signal('');

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveRoute(event.url);
      });

    // Set initial active route
    this.updateActiveRoute(this.router.url);
  }

  private updateActiveRoute(url: string) {
    // Extract the main route segment from URL
    const segments = url.split('/').filter(segment => segment);
    const mainRoute = segments.length > 0 ? segments[segments.length - 1] : 'home';
    this.activeRoute.set(mainRoute);
  }

  isActiveRoute(route: string): boolean {
    return this.activeRoute() === route;
  }
}
