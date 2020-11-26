import { TestBed, inject } from '@angular/core/testing';

import { TocResolveService } from './toc-resolve.service';

describe('TocResolveService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TocResolveService]
    });
  });

  it('should ...', inject([TocResolveService], (service: TocResolveService) => {
    expect(service).toBeTruthy();
  }));
});
