import {ChangeDetectionStrategy, Component, effect, ElementRef, signal, viewChild} from '@angular/core';
import QRCode from 'qrcode';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-qr-generator',
  imports: [
    FormsModule
  ],
  templateUrl: './qr-generator.component.html',
  styleUrl: './qr-generator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'qr-generator-page'
  }
})
export default class QrGeneratorComponent {
  qrCanvas = viewChild<ElementRef<HTMLCanvasElement>>('qrCanvasRef');

  inputText = signal('');
  showCode = signal(false);
  qrGenerated = signal(false);

  qrCanvasEffect = effect(() => {
    if (this.qrCanvas()) {
      this.#generateQrCode(this.qrCanvas()!.nativeElement, this.inputText());
      this.qrGenerated.set(true);
    }
  })

  generateQr() {
    const text = this.inputText().trim();
    if (!text) return;
    this.qrGenerated.set(true);
  }

  toggleCodeVisibility() {
    this.showCode.update(show => !show);
  }

  #generateQrCode(canvas: HTMLCanvasElement, text: string) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const containerSize = Math.min(viewportWidth * 0.8, viewportHeight * 0.6, 600);
    const qrSize = Math.max(containerSize, 300);

    QRCode.toCanvas(canvas, text, {
      width: qrSize,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    }, (error) => {
      if (error) {
        console.error('Error generating QR code:', error);
      }
    });
  }
}
