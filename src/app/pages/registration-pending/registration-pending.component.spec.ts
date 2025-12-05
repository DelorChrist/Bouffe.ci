import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationPendingComponent } from './registration-pending.component';

describe('RegistrationPendingComponent', () => {
  let component: RegistrationPendingComponent;
  let fixture: ComponentFixture<RegistrationPendingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistrationPendingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RegistrationPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
