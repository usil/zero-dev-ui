import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationResourceComponent } from './application-resource.component';

describe('ApplicationResourceComponent', () => {
  let component: ApplicationResourceComponent;
  let fixture: ComponentFixture<ApplicationResourceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApplicationResourceComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
