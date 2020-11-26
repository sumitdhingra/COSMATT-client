import { ClassesResolve } from './services/classes-resolve.service';
import { CourseDataService } from './../servo-system-course/services/course-data.service';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CourseListComponent } from './course-list.component';
import { CoursesResolve } from './services/courses-resolve.service';

const courseListRoutes: Routes = [
  {
    path: '',
    component: CourseListComponent,
    resolve: {
      courses: CoursesResolve,
      classes: ClassesResolve
    },
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(courseListRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class CourseListRoutingModule { }
