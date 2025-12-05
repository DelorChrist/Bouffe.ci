import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChefDashboardComponent } from './chef-dashboard.component';

describe('ChefDashboardComponent', () => {
  let component: ChefDashboardComponent;
  let fixture: ComponentFixture<ChefDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChefDashboardComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChefDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
