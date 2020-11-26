import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ServoSystemCourseComponent } from './servo-system-course.component';
import { CourseIntroductionComponent } from './course-introduction/course-introduction.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { CourseIntroductionResolve } from './course-introduction/course-introduction-resolve.service';
import { ProductResolveService } from './services/product-resolve.service';
import { TocResolveService } from './services/toc-resolve.service';
import { MdContentResolveService } from './services/md-content-resolve.service';
import { CoursesResolve } from '../course-list/services/courses-resolve.service';
import { DashboardResolveService } from './services/dashboard-resolve.service';


const routes: Routes = [{
  path: '',
  component: ServoSystemCourseComponent,
  resolve: {
    product: ProductResolveService
  },
  children: [
    {
      path: '',
      redirectTo: 'content',
      pathMatch: 'full'
    },
    {
      path: 'introduction',
      component: CourseIntroductionComponent,
      resolve: {
        courseIntroduction: CourseIntroductionResolve
      }
    },
    {
      path: 'content',
      resolve: {
        tocArr: TocResolveService
      },
      children: [
        {
          path: '',
          redirectTo: '1/0',
          pathMatch: 'full'
        },
        {
          path: ':module/:chapter',
          component: ContentPageComponent,
          resolve: {
            mdData: MdContentResolveService
          }
        }
      ]
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
      resolve: {
        courses: CoursesResolve, 
        dashBoardData: DashboardResolveService
      }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class ServoSystemCourseRoutingModule { }
