import { ClassesService } from './services/classes-service';
import { ClassesResolve } from './services/classes-resolve.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseListRoutingModule } from './course-list-routing.module';
import { CourseListComponent } from './course-list.component';
import { CourseItemComponent } from './course-item/course-item.component';
import { CoursesService } from './services/courses.service';
import { CoursesResolve } from './services/courses-resolve.service';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FeatureNotAvailableDirective } from '../directive/feature-not-available.directive';
// import { CourseDataService } from '../servo-system-course/services/course-data.service';
import { AppCommonModule } from '../app-common/app-common.module';
import { FileStoreModule } from '../file-store/file-store.module';

@NgModule({
  imports: [
    CommonModule,
    CourseListRoutingModule,
    TooltipModule,
    AppCommonModule,
    FileStoreModule
  ],
  declarations: [
    CourseListComponent,
    CourseItemComponent
  ],
  providers: [
    CoursesService,
    CoursesResolve,
    TooltipModule,
    ClassesResolve,
    ClassesService
    // CourseDataService
  ]
})
export class CourseListModule { }
