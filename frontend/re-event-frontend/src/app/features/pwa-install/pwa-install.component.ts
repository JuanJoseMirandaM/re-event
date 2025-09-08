import {ChangeDetectionStrategy, Component, OnInit, signal} from '@angular/core';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  templateUrl: "./pwa-install.component.html",
  styleUrls: ['./pwa-install.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PWAInstallComponent implements OnInit {
  private deferredPrompt: any = null;
  canInstall = signal(false);
  isInstalling = signal(false);
  showIOSInstructions = signal(false);
  isAlreadyInstalled = signal(false);

  ngOnInit() {
    this.checkPWAStatus();
    this.setupInstallPrompt();
  }

  private checkPWAStatus() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isAlreadyInstalled.set(true);
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      this.showIOSInstructions.set(true);
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall.set(true);
    });

    window.addEventListener('appinstalled', () => {
      this.isAlreadyInstalled.set(true);
      this.canInstall.set(false);
      this.deferredPrompt = null;
    });
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.isInstalling.set(true);

    try {
      const result = await this.deferredPrompt.prompt();

      if (result.outcome === 'accepted') {
        this.canInstall.set(false);
      }
    } catch (error) {
      console.error('Error during installation:', error);
    } finally {
      this.isInstalling.set(false);
      this.deferredPrompt = null;
    }
  }
}
