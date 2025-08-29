import {ChangeDetectionStrategy, Component, inject, input, output, signal} from '@angular/core';
import {RouterLink} from "@angular/router";
import {VersionService} from "../../core/services/version.service";

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

  #versionService = inject(VersionService);
  versionInfo = signal(this.#versionService.getVersionInfo());

  navItems = [
    {label: 'Account', link: './account', icon: 're-icon-user'},
    {label: 'QR', link: './qr', icon: 're-icon-qr'},
  ];

  closeMenu() {
    this.menuClosed.emit(false);
  }
}
