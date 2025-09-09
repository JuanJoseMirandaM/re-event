import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {TranslatePipe} from '@ngx-translate/core';
import {SideMenuComponent} from '../../components/side-menu/side-menu.component';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    SideMenuComponent,
    TranslatePipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }
}
