// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCommonModule } from '../app-common/app-common.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// Module Routing
import { ServoSystemCourseRoutingModule } from './servo-system-course-routing.module';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';

// Components
import { ServoSystemCourseComponent } from './servo-system-course.component';
import { CourseIntroductionComponent } from './course-introduction/course-introduction.component';
import { ContentPageComponent } from './content-page/content-page.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TimeSpentComponent } from './time-spent/time-spent.component';

// Services
import { CourseIntroductionService } from './course-introduction/course-introduction.service';
import { CourseIntroductionResolve } from './course-introduction/course-introduction-resolve.service';
// import { CourseDataService } from './services/course-data.service';
import { EomTestComponent } from './eom-test/eom-test.component';
import { ProductResolveService } from './services/product-resolve.service';
import { ProductService } from './services/product.service';
import { TocResolveService } from './services/toc-resolve.service';
import { ActivityService } from './services/activity.service';
import { ProgressService } from './services/progress.service';
import { CoursesResolve } from '../course-list/services/courses-resolve.service';
import { CoursesService } from '../course-list/services/courses.service';
import { DashboardResolveService } from './services/dashboard-resolve.service';
import { MdContentResolveService } from './services/md-content-resolve.service';
import { MdContentService } from './services/md-content.service';
import { KeysPipe } from './time-spent/keys.pipe';


@NgModule({
  imports: [
    CommonModule,
    AppCommonModule,
    ServoSystemCourseRoutingModule,
    TooltipModule,
    Angulartics2Module
  ],
  exports: [
    DashboardComponent
  ],
  declarations: [
    ServoSystemCourseComponent,
    CourseIntroductionComponent,
    ContentPageComponent,
    DashboardComponent,
    EomTestComponent,
    TimeSpentComponent,
    KeysPipe
  ],
  providers: [
    TocResolveService,
    CourseIntroductionService,
    CourseIntroductionResolve,
    // CourseDataService,
    ProductResolveService,
    ProductService,
    ActivityService,
    ProgressService,
    CoursesService,
    CoursesResolve,
    DashboardResolveService,
    MdContentResolveService,
    MdContentService
  ]
})
export class ServoSystemCourseModule { }
