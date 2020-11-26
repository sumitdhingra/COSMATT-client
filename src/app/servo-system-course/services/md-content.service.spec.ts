import { TestBed, inject } from '@angular/core/testing';

import { MdContentService } from './md-content.service';

describe('MdContentService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MdContentService]
    });
  });

  it('should ...', inject([MdContentService], (service: MdContentService) => {
    expect(service).toBeTruthy();
  }));
});
