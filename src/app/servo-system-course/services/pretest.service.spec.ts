/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PretestService } from './pretest.service';

describe('PretestReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PretestService]
    });
  });

  it('should ...', inject([PretestService], (service: PretestService) => {
    expect(service).toBeTruthy();
  }));
});
