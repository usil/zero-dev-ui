import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationPartComponent } from './application-part.component';

describe('ApplicationPartComponent', () => {
  let component: ApplicationPartComponent;
  let fixture: ComponentFixture<ApplicationPartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApplicationPartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationPartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
