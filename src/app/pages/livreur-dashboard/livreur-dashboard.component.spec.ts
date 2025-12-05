import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LivreurDashboardComponent } from './livreur-dashboard.component';

describe('LivreurDashboardComponent', () => {
  let component: LivreurDashboardComponent;
  let fixture: ComponentFixture<LivreurDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LivreurDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LivreurDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
