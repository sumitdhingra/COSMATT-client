import { TestBed, inject } from '@angular/core/testing';

import { MyAccountResolverService } from './my-account-resolver.service';

describe('MyAccountResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MyAccountResolverService]
    });
  });

  it('should be created', inject([MyAccountResolverService], (service: MyAccountResolverService) => {
    expect(service).toBeTruthy();
  }));
});
