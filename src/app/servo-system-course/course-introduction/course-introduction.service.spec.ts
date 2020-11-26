/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { CourseIntroductionService } from './course-introduction.service';

describe('AboutService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CourseIntroductionService]
    });
  });

  it('should ...', inject([CourseIntroductionService], (service: CourseIntroductionService) => {
    expect(service).toBeTruthy();
  }));
});
