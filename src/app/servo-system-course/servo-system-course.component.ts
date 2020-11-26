import { Component, OnInit } from '@angular/core';
import { Angulartics2, Angulartics2GoogleAnalytics } from 'angulartics2';
import { Router, NavigationEnd } from '@angular/router';
import { AppDataService, AppMode } from '../services/app-data.service';
import { TocService } from './services/toc.service';
import { CourseDataService } from './services/course-data.service';

@Component({
  selector: 'app-servo-system-course',
  templateUrl: './servo-system-course.component.html',
  styleUrls: ['./servo-system-course.component.scss']
})
export class ServoSystemCourseComponent implements OnInit {
  baseCourseUrl: string;
  constructor(
    private router: Router,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private angulartics2: Angulartics2,
    private appDataService: AppDataService,
    private tocService: TocService,
    private courseDataService: CourseDataService
  ) {
    this.baseCourseUrl = `/courses/training/${this.courseDataService.getProductId()}`;
    // to prevent auto page track
    angulartics2.developerMode(true);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.urlAfterRedirects.startsWith(`${this.baseCourseUrl}/dashboard`)) {
          this.appDataService.gaPage = `/COURSES/SERVO_SYSTEM_TRAINING/DASHBOARD`;
          this.angulartics2GoogleAnalytics.pageTrack(this.appDataService.gaPage);
        } else if (event.urlAfterRedirects.startsWith(`${this.baseCourseUrl}/introduction`)) {
          this.appDataService.gaPage = `/COURSES/SERVO_SYSTEM_TRAINING/INTRODUCTION`;
          this.angulartics2GoogleAnalytics.pageTrack(this.appDataService.gaPage);
        } else if(event.urlAfterRedirects.startsWith(`${this.baseCourseUrl}/content`)){
          if(this.appDataService.selectedChapter != undefined && this.appDataService.selectedChapter != "-1"){
            let { chapter, section } = this.tocService.getChapterSectionName(
              this.appDataService.selectedModule,
              this.appDataService.selectedChapter
            );
            chapter = chapter.split(' ').join('_').toUpperCase();
            chapter = `CHAPTER_${this.appDataService.selectedModule}_${chapter}`;
            section = section.split(' ').join('_').toUpperCase();
            section = `SECTION_${this.appDataService.selectedChapter}_${section}`;
            this.appDataService.gaPage = `/COURSES/SERVO_SYSTEM_TRAINING/${chapter}/${section}`;
            this.angulartics2GoogleAnalytics.pageTrack(this.appDataService.gaPage);
          }
          else if(this.appDataService.selectedChapter == undefined || this.appDataService.selectedChapter == "-1"){
            let { chapter } = this.tocService.getChapterSectionName(
              this.appDataService.selectedModule,-1);
            chapter = chapter.split(' ').join('_').toUpperCase();
            chapter = `CHAPTER_${this.appDataService.selectedModule}_${chapter}`;
            this.appDataService.gaPage = `/COURSES/SERVO_SYSTEM_TRAINING/${chapter}`;
            this.angulartics2GoogleAnalytics.pageTrack(this.appDataService.gaPage);
          }
        }
      }
    });
  }

  ngOnInit() {
    this.appDataService.appMode = AppMode.Course;

  }

}
