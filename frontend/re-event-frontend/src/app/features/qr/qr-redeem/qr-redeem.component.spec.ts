import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrRedeemComponent } from './qr-redeem.component';

describe('QrRedeemComponent', () => {
  let component: QrRedeemComponent;
  let fixture: ComponentFixture<QrRedeemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrRedeemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrRedeemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
