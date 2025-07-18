import {ComponentFixture, TestBed} from '@angular/core/testing';

import PastEventComponent from './past-event.component';

describe('PastEventComponent', () => {
  let component: PastEventComponent;
  let fixture: ComponentFixture<PastEventComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PastEventComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(PastEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
