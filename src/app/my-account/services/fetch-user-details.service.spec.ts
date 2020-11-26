import { TestBed, inject } from '@angular/core/testing';

import { FetchUserDetailsService } from './fetch-user-details.service';

describe('FetchUserDetailsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FetchUserDetailsService]
    });
  });

  it('should be created', inject([FetchUserDetailsService], (service: FetchUserDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
