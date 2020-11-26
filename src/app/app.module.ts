import { ClassesService } from './course-list/services/classes-service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler  } from '@angular/core';
import { HttpModule } from '@angular/http';
import { Http } from '@angular/http';
import { AlertModule } from 'ngx-bootstrap/alert';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { CookieModule } from 'ngx-cookie';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AppDataService } from './services/app-data.service';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';
import { ExtendedHttpService } from './services/extended-http.service';
import { AppCommonModule } from './app-common/app-common.module';
import { LayoutModule } from './layout/layout.module';
import { ModalService } from './app-common/modal/modal.service';

import { CourseDataService } from 'app/servo-system-course/services/course-data.service';
import { ProductService } from 'app/servo-system-course/services/product.service';
import { ActivityService } from 'app/servo-system-course/services/activity.service';
import { TocService } from 'app/servo-system-course/services/toc.service';

import { UtilsService } from './services/utils.service';

import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';

import { BugsnagErrorHandler } from '../error-handler';
import { PopupService } from 'app/app-common/popup/popup.service';
import { CoursesService } from './course-list/services/courses.service';
import { CourseRedirectService } from './services/course-redirect.service';
import { ClassDataService } from './servo-system-course/services/class-data.service';
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    AppCommonModule,
    LayoutModule,
    AlertModule.forRoot(),
    TooltipModule.forRoot(),
    CookieModule.forRoot(),
    ButtonsModule.forRoot(),
    Angulartics2Module.forRoot([ Angulartics2GoogleAnalytics ]),
    ReactiveFormsModule
  ],
  providers: [
    AppDataService,
    AuthService,
    AuthGuardService,
    ModalService,
    PopupService,
    { provide: Http, useClass: ExtendedHttpService },
    CourseDataService,
    UtilsService,
    { provide: ErrorHandler, useClass: BugsnagErrorHandler },
    ProductService,
    ActivityService,
    TocService,
    CoursesService,
    CourseRedirectService,
    ClassesService,
    ClassDataService

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
