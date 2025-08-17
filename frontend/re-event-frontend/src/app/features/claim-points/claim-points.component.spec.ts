import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimPointsComponent } from './claim-points.component';

describe('ClaimPointsComponent', () => {
  let component: ClaimPointsComponent;
  let fixture: ComponentFixture<ClaimPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
