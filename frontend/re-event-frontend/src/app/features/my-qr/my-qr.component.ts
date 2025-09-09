import {ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild} from '@angular/core';
import {map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import QRCode from 'qrcode';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';
import {TranslatePipe} from '@ngx-translate/core';
import {UserStoreFacade} from '../../core/store/facades/user-store.facade';

@Component({
  selector: 'app-my-qr',
  imports: [
    CdkCopyToClipboard,
    TranslatePipe
  ],
  templateUrl: './my-qr.component.html',
  styleUrl: './my-qr.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex--col gap-4 p-2 items-center justify-center'
  }
})
export default class MyQrComponent {
  qrCanvas = viewChild<ElementRef<HTMLCanvasElement>>('myQrContentRef');

  #userStoreFacade = inject(UserStoreFacade);

  userId = toSignal(
    this.#userStoreFacade.userProfile$.pipe(map(user => user?.userId ?? '')),
    {initialValue: ''}
  );

  qrCanvasEffect = effect(() => {
    const canvasEl = this.qrCanvas();
    const userId = this.userId();

    if (!canvasEl || !userId) {
      return;
    }

    this.#generateQrCode(canvasEl.nativeElement, userId);
  });

  #generateQrCode(canvas: HTMLCanvasElement, userId: string) {
    QRCode.toCanvas(canvas, userId, {
      width: canvas.offsetWidth,
    }, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
      }
    });
  }
}
