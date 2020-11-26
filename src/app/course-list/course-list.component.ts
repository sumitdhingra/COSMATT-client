import { Component, OnInit, HostBinding, AfterViewInit, EventEmitter, Output} from '@angular/core';
import { CoursesService } from './services/courses.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Angulartics2, Angulartics2GoogleAnalytics } from 'angulartics2';
import { AppDataService, UserRole, AppMode } from '../services/app-data.service';
import { CourseDataService } from '../servo-system-course/services/course-data.service';
import { ICourseStatus } from 'app/course-list/models/course-status.interface';

@Component({
  selector: 'app-course-list',
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss']
})

export class CourseListComponent implements OnInit, AfterViewInit {
  coursesArr: Array<any>;
  classes: Array<any>;
  userRole: any;
  UserRole = UserRole;

  constructor(
    private _coursesService: CoursesService,
    private router: Router,
    private appDataService: AppDataService,
    private activatedRoute: ActivatedRoute,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,) {
  }

  
  ngOnInit() {
    this.appDataService.appMode = AppMode.None;
    this.coursesArr = this.activatedRoute.snapshot.data['courses'];

    this.classes = this.activatedRoute.snapshot.data['classes'].entities;
    this.appDataService.gaPage = '/COURSES';
    // this.coursesLength = 1; //To Be Corrected
    this.angulartics2GoogleAnalytics.pageTrack(this.appDataService.gaPage);
    this.userRole = this.appDataService.getUserRole();
  }

  ngAfterViewInit() {
    this.coursesArr.forEach(course => {
      if ( course.meta.producttype === 'application' ) {
        return;
      }
      let classId: string;
      if ( this.classes[0]){
        classId = this.classes[0].uuid;
      }

      this._coursesService.updateCourseStatuses(course.uuid, classId)
        .then((updatedCourse: any) => {
          const targetCourse = this.coursesArr.find(c => c.uuid === course.uuid);
          targetCourse.meta = updatedCourse.meta;
        })
        .catch(err => {
          console.log('Error fetching course details.', err);
        });
    });
  }
}
