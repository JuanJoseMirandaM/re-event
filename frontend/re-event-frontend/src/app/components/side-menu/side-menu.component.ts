import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-side-menu',
  imports: [
    RouterLink
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {
  isMenuOpen = input(false);
  menuClosed = output<boolean>();

  navItems = [
    {label: 'Account', link: './account', icon: 're-icon-user'},
    {label: 'QR', link: './qr', icon: 're-icon-qr'},
    {label: 'Scan Your Role', link: './qr', icon: 're-icon-qr'},
    // {label: 'Cerrar sesión', link: '/auth/logout', icon: 're-icon-logout'},
  ];

  closeMenu() {
    this.menuClosed.emit(false);
  }
}
