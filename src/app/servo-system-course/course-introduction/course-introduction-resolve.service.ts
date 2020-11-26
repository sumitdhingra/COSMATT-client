import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { CourseIntroductionService } from './course-introduction.service';

@Injectable()
export class CourseIntroductionResolve implements Resolve<any> {

  constructor(private courseIntroductionService: CourseIntroductionService) { }

  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
     let aboutCourseData = this.courseIntroductionService.getAboutCourseData();
     let authorsData = this.courseIntroductionService.getAuthorsData();
     let forewordData = this.courseIntroductionService.getForewordData();

     let PromiseResolve = Promise.all([aboutCourseData, authorsData, forewordData]);
     return Promise.all([aboutCourseData, authorsData, forewordData]);
  }
}
