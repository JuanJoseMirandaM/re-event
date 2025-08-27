
import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-scanner',
  templateUrl: './qr-scanner.component.html',
  styleUrls: ['./qr-scanner.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class QrScannerComponent {
  @Output() closePanel = new EventEmitter<void>();

  close() {
    this.closePanel.emit();
  }
}
