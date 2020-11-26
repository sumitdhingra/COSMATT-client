import { TestBed, inject } from '@angular/core/testing';

import { ClassAnalyticsService } from './class-analytics.service';

describe('ClassAnalyticsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClassAnalyticsService]
    });
  });

  it('should be created', inject([ClassAnalyticsService], (service: ClassAnalyticsService) => {
    expect(service).toBeTruthy();
  }));
});
