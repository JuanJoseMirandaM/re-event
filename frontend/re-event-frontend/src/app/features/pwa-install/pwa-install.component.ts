import {ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {LanguageSelectorComponent} from '../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-pwa-install',
  imports: [TranslatePipe, LanguageSelectorComponent],
  templateUrl: "./pwa-install.component.html",
  styleUrls: ['./pwa-install.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class PWAInstallComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private deferredPrompt: any = null;
  canInstall = signal(false);
  isInstalling = signal(false);
  showIOSInstructions = signal(false);
  isAlreadyInstalled = signal(false);

  ngOnInit() {
    this.checkPWAStatus();
    this.setupInstallPrompt();

    // Fallback: Show install button after a delay if no beforeinstallprompt event fires
    setTimeout(() => {
      if (!this.canInstall() && !this.isAlreadyInstalled() && !this.showIOSInstructions()) {
        // Check if we're on Android Chrome and PWA criteria might be met
        const isAndroid = /Android/.test(navigator.userAgent);
        const isChrome = /Chrome/.test(navigator.userAgent);

        if (isAndroid && isChrome) {
          this.canInstall.set(true);
          this.cdr.detectChanges();
        }
      }
    }, 3000);
  }

  private checkPWAStatus() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isAlreadyInstalled.set(true);
      this.cdr.detectChanges();
      return;
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      this.showIOSInstructions.set(true);
      this.cdr.detectChanges();
    }
  }

  private setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstall.set(true);
      this.cdr.detectChanges();
    });

    window.addEventListener('appinstalled', () => {
      this.isAlreadyInstalled.set(true);
      this.canInstall.set(false);
      this.deferredPrompt = null;
      this.cdr.detectChanges();
    });
  }

  async installApp() {
    if (!this.deferredPrompt) return;

    this.isInstalling.set(true);
    this.cdr.detectChanges();

    try {
      const result = await this.deferredPrompt.prompt();

      if (result.outcome === 'accepted') {
        this.canInstall.set(false);
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error during installation:', error);
    } finally {
      this.isInstalling.set(false);
      this.deferredPrompt = null;
      this.cdr.detectChanges();
    }
  }
}
