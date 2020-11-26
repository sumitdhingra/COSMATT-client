import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassDataService } from 'app/servo-system-course/services/class-data.service';
import { AppDataService, AppMode } from 'app/services/app-data.service';
import { ClassNavbarComponent } from './class-navbar/class-navbar.component';
import { CourseDataService } from 'app/servo-system-course/services/course-data.service';
import * as classDashboardOptions from './classDashboardOptions.json';
@Component({
  selector: 'app-class-dashboard',
  templateUrl: './class-dashboard.component.html',
  styleUrls: ['./class-dashboard.component.scss']
})
export class ClassDashboardComponent implements OnInit {
  courseAnalytics: any;
  activeClassData: any;
  clickedItemId: any;
  selectedStudent: string;
  //default classnavbar status when compnent is created.
  class_sidebarStatus = {
    selected: window.innerWidth > 1024 ? 'class-analytics' : 'none',
    clicked: window.innerWidth > 1024 ? true : false,
    clickedItem: window.innerWidth > 1024 ? 'class-analytics' : 'none',
    hovered: false,
    open: () => this.class_sidebarStatus.selected !== 'none'
  };
  courseTopics: any;
  chapterSectionAnalytics: any;
  totalStudents:Number;
  classDashboardOptions:any = classDashboardOptions;
  progressView = 'chapters';
  @ViewChild(ClassNavbarComponent) navbar: ClassNavbarComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    public classDataService: ClassDataService,
    private appDataService: AppDataService,
    public courseDataService: CourseDataService
  ) { }

  ngOnInit() {
    
    this.clickedItemId = 0;
    this.appDataService.setPageTitle('Class Analytics');
    this.appDataService.appMode = AppMode.Course;
    this.courseTopics = this.classDataService.ClassProductAnalytics;
    this.totalStudents = this.classDataService.NumberOfStudents;
    //this.sidebar = this.courseDataService.getSidebarStatus();
    
    //const currentClass = this.activatedRoute.snapshot.data['dashBoardData'][3];
    // this.courseAnalytics = {
    //   'title': currentClass.meta.title,
    //   'startDate': currentClass.meta.startDate,
    //   'timeSpent': this.currentClass.convertMillisecondsToDyHrMin(currentCourse.meta.timespent),
    //   'courseProgress': this.currentClass.getCourseProgress(),
    //   'lastActivity': this.currentClass.snapshot.data['dashBoardData'][0],
    //   'timeSpentLastDay': this.currentClass.convertMillisecondsToDyHrMin(this.activatedRoute.snapshot.data['dashBoardData'][1].total)
    // };
    
    
  }

  recieveSidebarStatus($event){
    this.class_sidebarStatus = $event;
  }

  recieveClickedItemId($event){
    this.clickedItemId = $event;
  }

  sideBarToggle(state) {
    // this.sidebar = state;
    // this.courseDataService.setSidebarStatus(state);
  }

  onProgressViewSelectionChange(selectedView) {
    this.progressView = selectedView;
  }

  onViewAnalytics($event: any) {
    this.clickedItemId = 2;
    this.selectedStudent = $event;
    this.navbar.selectedItemIndex = this.clickedItemId;
  }
  onStudentChange($event: any) {
    this.selectedStudent = $event;
  }
  onStudentDetailsClose() {
    this.clickedItemId = 1;
    this.selectedStudent = null;
    this.navbar.selectedItemIndex = this.clickedItemId;
  }
}
