import { TestBed, inject } from '@angular/core/testing';

import { CourseRedirectService } from './course-redirect.service';

describe('CourseRedirectService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CourseRedirectService]
    });
  });

  it('should be created', inject([CourseRedirectService], (service: CourseRedirectService) => {
    expect(service).toBeTruthy();
  }));
});
