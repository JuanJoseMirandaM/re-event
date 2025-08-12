import {AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, OnDestroy, signal} from '@angular/core';
import {Html5Qrcode} from 'html5-qrcode';
import {fromPromise} from 'rxjs/internal/observable/innerFrom';
import {filter, take, timer} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-qr-scanner',
  imports: [],
  templateUrl: './qr-scanner.component.html',
  styleUrl: './qr-scanner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 're-general-padding re-flex re-flex-column re-gap-flex-1-2 re-align-items-center'
  }
})
export default class QrScannerComponent implements AfterViewInit, OnDestroy {
  isQrScanSuccessful = signal(false);

  #html5QrCode: Html5Qrcode | null = null;
  #cameraId: string | null = null;
  #destroyRef = inject(DestroyRef);


  ngAfterViewInit() {
    this.#initializeQrPreview();
  }

  #initializeQrPreview() {
    fromPromise(Html5Qrcode.getCameras())
      .pipe(
        filter(devices => devices && devices.length > 0),
        take(1),
        takeUntilDestroyed(this.#destroyRef)
      ).subscribe(devices => {
      this.#cameraId = devices[0].id;
      this.#initializeHtml5QrCode();
    })
  }

  #initializeHtml5QrCode() {
    this.#html5QrCode = new Html5Qrcode("reader");
    this.#html5QrCode.start(
      this.#cameraId!,
      {
        fps: 5,
      },
      (decodedText) => this.#onSuccess(decodedText),
      (errorMessage) => this.#onError(errorMessage))
      .catch((err) => console.error('Error init html5QRCode', err))
  }

  #onSuccess(decodedText: string) {
    this.isQrScanSuccessful.set(true)
    timer(500).subscribe(() => this.#html5QrCode?.stop());
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

  ngOnDestroy(): void {
    void this.#stopAndClear();
  }
}
