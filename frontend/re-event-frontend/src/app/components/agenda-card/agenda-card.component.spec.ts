import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaCardComponent } from './agenda-card.component';

describe('AgendaCardComponent', () => {
  let component: AgendaCardComponent;
  let fixture: ComponentFixture<AgendaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
