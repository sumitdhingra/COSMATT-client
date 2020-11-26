import { ProductResolveService } from './../servo-system-course/services/product-resolve.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassDashboardRoutingModule } from './class-dashboard-routing.module';
import { ClassDashboardComponent } from './class-dashboard.component';
import { ClassAnalyticsResolveService } from './services/class-analytics-resolve.service';
import { AppCommonModule } from 'app/app-common/app-common.module';
import { ClassAnalyticsService } from './services/class-analytics.service';
import { ClassNavbarComponent } from './class-navbar/class-navbar.component';
import { StudentsEnrolledComponent } from './students-enrolled/students-enrolled.component';
import { ClassOverallAnalyticsComponent } from './class-overall-analytics/class-overall-analytics.component';
import { ClassTimeSpentComponent } from './class-time-spent/class-time-spent.component';
import { KeysPipe1 } from './class-time-spent/keys.pipe';
import { KeysPipe2 } from './class-students-logins/keys.pipe';
import { ClassStudentsLoginsComponent } from './class-students-logins/class-students-logins.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { StudentsSummaryComponent } from './students-summary/students-summary.component';
import { MillisecondsToDyHrMinPipe } from './students-summary/milliseconds-to-dy-hr-min.pipe';
import { ClassObjectiveProgressViewerComponent } from './class-objective-progress-viewer/class-objective-progress-viewer.component';
import { StudentDetailsComponent } from './student-details/student-details.component';
import { StudentProgressService } from './services/student-progress.service';
import { ServoSystemCourseModule } from 'app/servo-system-course/servo-system-course.module';
import { ClassCourseOutlineComponent } from './class-course-outline/class-course-outline.component';
import * as classDashboardOptions from './classDashboardOptions.json';

@NgModule({
  imports: [
    CommonModule,
    AppCommonModule,
    TooltipModule,
    ClassDashboardRoutingModule,
    ServoSystemCourseModule
  ],
  declarations: [ClassDashboardComponent, StudentsEnrolledComponent, ClassNavbarComponent,
     ClassOverallAnalyticsComponent, ClassTimeSpentComponent, KeysPipe1, KeysPipe2, ClassStudentsLoginsComponent, MillisecondsToDyHrMinPipe, StudentsSummaryComponent, ClassObjectiveProgressViewerComponent, StudentDetailsComponent, ClassCourseOutlineComponent],
  providers: [ClassAnalyticsResolveService,
    ClassAnalyticsService,
    ProductResolveService,
    StudentProgressService  
  ],
})
export class ClassDashboardModule { }
