import { TestBed, inject } from '@angular/core/testing';

import { SideNavigatorService } from './side-navigator.service';

describe('SideNavigatorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SideNavigatorService]
    });
  });

  it('should be created', inject([SideNavigatorService], (service: SideNavigatorService) => {
    expect(service).toBeTruthy();
  }));
});
