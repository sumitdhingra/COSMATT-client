import { TestBed, inject } from '@angular/core/testing';

import { ProfileCalculationService } from './profile-calculation.service';

describe('ProfileCalculationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProfileCalculationService]
    });
  });

  it('should be created', inject([ProfileCalculationService], (service: ProfileCalculationService) => {
    expect(service).toBeTruthy();
  }));
});
