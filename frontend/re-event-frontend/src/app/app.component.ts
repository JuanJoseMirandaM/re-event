import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {AuthService} from './core/services/auth.service';
import {CommonModule} from '@angular/common';
import {LoaderOverlayComponent} from './shared/components/loader-overlay/loader-overlay.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, LoaderOverlayComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  constructor(public authService: AuthService) {
  }
}
