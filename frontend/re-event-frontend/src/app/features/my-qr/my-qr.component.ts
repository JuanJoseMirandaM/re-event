import {ChangeDetectionStrategy, Component, effect, ElementRef, inject, viewChild} from '@angular/core';
import {UserService} from '../../core/services/user.service';
import {map} from 'rxjs';
import {toSignal} from '@angular/core/rxjs-interop';
import QRCode from 'qrcode';
import {CdkCopyToClipboard} from '@angular/cdk/clipboard';

@Component({
  selector: 'app-my-qr',
  imports: [
    CdkCopyToClipboard
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

  #userService = inject(UserService);

  userId = toSignal(this.#userService.getCurrentUser().pipe(map(user => user?.userId ?? '')), {initialValue: ''})

  qrCanvasEffect = effect(() => {
    if (!this.qrCanvas()) return;
    this.#generateQrCode();
  })

  #generateQrCode() {
    const canvas = this.qrCanvas()!.nativeElement;
    if (!canvas) return;
    QRCode.toCanvas(canvas, this.userId(), {
      width: canvas.offsetWidth,
    }, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
      }
    })
  }
}
