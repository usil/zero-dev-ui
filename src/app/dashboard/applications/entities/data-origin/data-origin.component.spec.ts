import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataOriginComponent } from './data-origin.component';

describe('DataOriginComponent', () => {
  let component: DataOriginComponent;
  let fixture: ComponentFixture<DataOriginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataOriginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataOriginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
