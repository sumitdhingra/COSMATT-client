import { CoursesService } from '../../course-list/services/courses.service'
import { CourseDataService } from '../../servo-system-course/services/course-data.service';
import { ClassDataService } from '../../servo-system-course/services/class-data.service';
import { ProductService } from '../../servo-system-course/services/product.service';
import { Injectable } from '@angular/core';

@Injectable()
export class StudentProgressService {

    constructor(
        private courseService: CoursesService,
        private courseDataService: CourseDataService,
        private ClassDataService: ClassDataService,
        private productService: ProductService,
    ) {}

    getStudentData(studentId: string) {
        return Promise.all([
            this.courseService.getCourses(undefined,studentId).then((course)=>{
              return this.courseService.updateCourseStatuses(this.courseDataService.getProductId(),this.ClassDataService.ActiveClass, studentId).then((data)=>{
                return {course:course,courseStatus:data}
              });
            }),
            this.courseDataService.getLastActivity(this.courseDataService.getProductId(), studentId),
            this.courseDataService.getCourseTimeSpent(
              this.courseDataService.getProductId(),
              'stat',
              this.getLastDateTime(),
              undefined,
              studentId
            ),
            //this.productService.getProduct(),
            Promise.resolve(),
            // this.tocService.fetchToc(true, true, true),
            // this.tocService.fetchToc(true, true, true)
          ])
    }

    private getLastDateTime(): number {
        let lastDate = new Date();
        lastDate.setDate(lastDate.getDate() - 1);
        return lastDate.getTime();
    }

}

