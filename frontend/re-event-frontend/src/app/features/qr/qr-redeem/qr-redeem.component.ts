import {AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, signal} from '@angular/core';
import {Html5Qrcode} from 'html5-qrcode';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import {catchError, filter, from, take, timer} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {TranslatePipe} from '@ngx-translate/core';
import {FooterService} from '../../../core/services/footer.service';
import {Router} from '@angular/router';
import {LoaderService} from '../../../core/services/loader.service';

interface CameraDevice {
  id: string;
  label: string;
}

@Component({
  selector: 'app-qr-redeem',
  imports: [TranslatePipe],
  templateUrl: './qr-redeem.component.html',
  styleUrl: './qr-redeem.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 're-general-padding re-flex re-flex-column re-gap-flex-1-2 re-align-items-center'
  }
})
/*TODO: Create a qr Generic component to abstract functionalities*/
export default class QrRedeemComponent implements AfterViewInit, OnDestroy {
  isQrScanSuccessful = signal(false);

  #html5QrCode: Html5Qrcode | null = null;
  #cameraId: string | null = null;
  #devices: CameraDevice[] = [];
  #currentDeviceIndex = 0;

  #destroyRef = inject(DestroyRef);
  #footerService = inject(FooterService);
  #loaderService = inject(LoaderService);
  #router = inject(Router);

  hasMultipleCameras = false;

  ngAfterViewInit() {
    this.#footerService.hide();
    this.#initializeQrPreview();
  }

  #initializeQrPreview() {
    this.#loaderService.show();
    fromPromise(Html5Qrcode.getCameras())
      .pipe(
        catchError(() => {
          this.#loaderService.hide();
          return from([]);
        }),
        filter(devices => devices && devices.length > 0),
        take(1),
        takeUntilDestroyed(this.#destroyRef)
      ).subscribe((devices: CameraDevice[]) => {
      this.#devices = devices;
      this.hasMultipleCameras = devices.length > 1;
      this.#currentDeviceIndex = this.#findPreferredCameraIndex(devices);
      this.#cameraId = devices[this.#currentDeviceIndex].id;
      this.#initializeHtml5QrCode();
    })
  }

  #findPreferredCameraIndex(devices: CameraDevice[]): number {
    const backRegex = /(back|rear|environment)/i;
    const idx = devices.findIndex(d => backRegex.test(d.label));
    return idx >= 0 ? idx : 0;
  }

  #initializeHtml5QrCode() {
    this.#html5QrCode = new Html5Qrcode('reader');
    from(this.#html5QrCode.start(
        this.#cameraId!,
        {
          fps: 10,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdge * 0.8);
            return {
              width: qrboxSize,
              height: qrboxSize,
            };
          },
          aspectRatio: this.#calculateAspectRatio(),
        },
        (decodedText) => this.#onSuccess(decodedText),
        (errorMessage) => this.#onError(errorMessage)
      )
    ).pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe({
        error: (err) => console.error('Error init html5QRCode', err),
        complete: () => this.#loaderService.hide()
      });
  }

  async switchCamera() {
    if (!this.hasMultipleCameras || this.#devices.length === 0) return;
    this.#currentDeviceIndex = (this.#currentDeviceIndex + 1) % this.#devices.length;
    this.#cameraId = this.#devices[this.#currentDeviceIndex].id;
    await this.#stopAndClear();
    this.#initializeHtml5QrCode();
  }

  #calculateAspectRatio(): number {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const reverseAspectRatio = height / width
    return reverseAspectRatio > 1.5
      ? reverseAspectRatio + (reverseAspectRatio * 12 / 100)
      : reverseAspectRatio
  }

  #onSuccess(decodedText: string): void {
    this.isQrScanSuccessful.set(true)
    timer(100).subscribe(() => void this.#stopAndClear());
    void this.#router.navigate([`/secure/redeem-points/${decodedText}`]);
  }

  #onError(errorMessage: string) {
    console.log(`Code scan error = ${errorMessage}`);
  }

  async #stopAndClear() {
    try {
      if (this.#html5QrCode) {
        await this.#html5QrCode.stop();
        this.#html5QrCode.clear();
      }
    } catch (e) {
      console.warn('Error stopping camera:', e);
    } finally {
      this.#html5QrCode = null;
    }
  }

  onClose() {
    this.#router.navigate(['/secure/points']);
  }

  onEnterCode(): void {
    void this.#router.navigate(['/secure/redeem-points/userId']);
  }

  ngOnDestroy(): void {
    this.#footerService.show();
    void this.#stopAndClear();
  }
}
