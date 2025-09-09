import {ChangeDetectionStrategy, Component, inject, input, output, signal} from '@angular/core';
import {RouterLink} from "@angular/router";
import {TranslatePipe} from '@ngx-translate/core';
import {VersionService} from "../../core/services/version.service";
import {NavItemVisibleByRoleDirective} from '../../shared/directives/nav-item-visible-by-role.directive';
import {NavItems} from '../../interfaces/nav-items.interface';
import {UserRole} from '../../core/services/user.service';

@Component({
  selector: 'app-side-menu',
  imports: [
    RouterLink,
    NavItemVisibleByRoleDirective,
    TranslatePipe
  ],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SideMenuComponent {
  isMenuOpen = input(false);

  menuClosed = output<boolean>();

  #versionService = inject(VersionService);
  versionInfo = signal(this.#versionService.getVersionInfo());

  navItems: NavItems[] = [
    {label: 'Account', link: './account', icon: 're-icon-user', roleAllowed: []},
    {label: 'QR', link: './qr', icon: 're-icon-qr', roleAllowed: []},
    {label: 'My Qr', link: './my-qr', icon: 're-icon-qr', roleAllowed: []},
    {label: 'Redeem user points', link: './qr-redeem', icon: 're-icon-qr', roleAllowed: [UserRole.ORGANIZER]},
  ];

  closeMenu() {
    this.menuClosed.emit(false);
  }
}
