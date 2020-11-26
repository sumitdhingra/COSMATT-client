import { TestBed, inject } from '@angular/core/testing';

import { TransmissionCalculationService } from './transmission-calculation.service';

describe('TransmissionCalculationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransmissionCalculationService]
    });
  });

  it('should be created', inject([TransmissionCalculationService], (service: TransmissionCalculationService) => {
    expect(service).toBeTruthy();
  }));
});
