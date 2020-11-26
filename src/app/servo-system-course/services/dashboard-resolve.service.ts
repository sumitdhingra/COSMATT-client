import { ClassDataService } from './class-data.service';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { CourseDataService } from './course-data.service';
import { AppDataService } from './../../services/app-data.service';
import { ProductService } from './product.service';
import { TocService } from 'app/servo-system-course/services/toc.service';
import { CoursesService } from 'app/course-list/services/courses.service';

@Injectable()
export class DashboardResolveService {

  constructor(
    private courseDataService: CourseDataService,
    private appDataService: AppDataService,
    private productService: ProductService,
    private tocService: TocService,
    private coursesService: CoursesService,
    private ClassDataService: ClassDataService
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Promise<any>{
    return Promise.all([
      this.courseDataService.getLastActivity(this.courseDataService.getProductId()),
      this.courseDataService.getCourseTimeSpent(
        this.courseDataService.getProductId(),
        'stat',
        this.getLastDateTime()
      ),
      this.productService.getProduct(),
      // this.tocService.fetchToc(true, true, true),
      this.coursesService.getCourses()
        .then(courses => {
          return this.coursesService.updateCourseStatuses(this.courseDataService.getProductId(),this.ClassDataService.ActiveClass);
        })
      // this.tocService.fetchToc(true, true, true)
    ]);
  }

  private getLastDateTime(): number {
    let lastDate = new Date();
    lastDate.setDate(lastDate.getDate() - 1);
    return lastDate.getTime();
  }

}
