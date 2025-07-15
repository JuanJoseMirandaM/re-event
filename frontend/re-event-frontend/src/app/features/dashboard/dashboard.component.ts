import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AuthService, User} from '../../core/services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `
    <div>DashboardSection</div>
  `
})
export default class DashboardComponent implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.user = user;
    });
  }

  goToVerification(): void {
    this.router.navigate(['/verify-code']);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
