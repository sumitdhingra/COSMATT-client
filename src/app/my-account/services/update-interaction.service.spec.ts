import { TestBed, inject } from '@angular/core/testing';

import { UpdateInteractionService } from './update-interaction.service';

describe('UpdateInteractionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateInteractionService]
    });
  });

  it('should be created', inject([UpdateInteractionService], (service: UpdateInteractionService) => {
    expect(service).toBeTruthy();
  }));
});
