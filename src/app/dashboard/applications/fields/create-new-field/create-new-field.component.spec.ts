import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateNewFieldComponent } from './create-new-field.component';

describe('CreateNewFieldComponent', () => {
  let component: CreateNewFieldComponent;
  let fixture: ComponentFixture<CreateNewFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateNewFieldComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNewFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
