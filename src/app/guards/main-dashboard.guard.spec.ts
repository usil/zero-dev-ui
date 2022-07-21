import { TestBed } from '@angular/core/testing';

import { MainDashboardGuard } from './main-dashboard.guard';

describe('MainDashboardGuard', () => {
  let guard: MainDashboardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(MainDashboardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
