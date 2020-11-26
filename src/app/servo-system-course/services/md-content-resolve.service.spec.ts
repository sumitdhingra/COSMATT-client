import { TestBed, inject } from '@angular/core/testing';

import { MdContentResolveService } from './md-content-resolve.service';

describe('MdContentResolveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MdContentResolveService]
    });
  });

  it('should ...', inject([MdContentResolveService], (service: MdContentResolveService) => {
    expect(service).toBeTruthy();
  }));
});
