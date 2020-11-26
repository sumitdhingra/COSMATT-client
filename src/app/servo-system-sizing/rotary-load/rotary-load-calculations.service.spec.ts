import { TestBed, inject } from '@angular/core/testing';

import { RotaryLoadCalculationsService } from './rotary-load-calculations.service';

describe('RotaryLoadCalculationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RotaryLoadCalculationsService]
    });
  });

  it('should be created', inject([RotaryLoadCalculationsService], (service: RotaryLoadCalculationsService) => {
    expect(service).toBeTruthy();
  }));
});
