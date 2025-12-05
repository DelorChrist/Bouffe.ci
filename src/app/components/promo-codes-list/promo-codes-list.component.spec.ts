import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoCodesListComponent } from './promo-codes-list.component';

describe('PromoCodesListComponent', () => {
  let component: PromoCodesListComponent;
  let fixture: ComponentFixture<PromoCodesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PromoCodesListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PromoCodesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
