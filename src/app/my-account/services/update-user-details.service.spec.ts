import { TestBed, inject } from '@angular/core/testing';

import { UpdateUserDetailsService } from './update-user-details.service';

describe('PushUserDetailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UpdateUserDetailsService]
    });
  });

  it('should be created', inject([UpdateUserDetailsService], (service: UpdateUserDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
