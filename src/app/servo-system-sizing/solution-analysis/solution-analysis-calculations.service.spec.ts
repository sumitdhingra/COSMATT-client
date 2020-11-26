import { TestBed, inject } from '@angular/core/testing';

import { SolutionAnalysisCalculationsService } from './solution-analysis-calculations.service';

describe('SolutionAnalysisCalculationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolutionAnalysisCalculationsService]
    });
  });

  it('should be created', inject([SolutionAnalysisCalculationsService], (service: SolutionAnalysisCalculationsService) => {
    expect(service).toBeTruthy();
  }));
});
