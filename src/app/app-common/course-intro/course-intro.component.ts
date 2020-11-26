import { Component, OnInit, Input, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilsService } from './../../services/utils.service';
import {AppDataService, UserType} from './../../services/app-data.service'

@Component({
  selector: 'app-course-intro',
  templateUrl: './course-intro.component.html',
  styleUrls: ['./course-intro.component.scss']
})
export class CourseIntroComponent implements OnInit, AfterViewInit {
  @Input() courseData: any;
  lastActivityChapterNo: number;
  lastActivitySectionNo: number;
  $el: any;
  userType = UserType;

  constructor(el: ElementRef, private router: Router, private activatedRoute: ActivatedRoute, public utilsService: UtilsService, public appDataService:AppDataService) {
    this.$el = jQuery(el.nativeElement);
  }

  ngOnInit() {
    // console.log(this.userType.ExistingUser, this.appDataService.getUserType());
    if(this.courseData.lastActivity) {
      if(this.courseData.lastActivity.section != undefined && this.courseData.lastActivity.section != -1){
        this.lastActivityChapterNo = parseInt(this.courseData.lastActivity.chapter) + 1;
        this.lastActivitySectionNo = parseInt(this.courseData.lastActivity.section) + 1;
      }else{
        this.lastActivityChapterNo = parseInt(this.courseData.lastActivity.chapter) + 1;
        this.lastActivitySectionNo = -1;
      }
    }
  }

  lastActivityLinkClicked(){
    this.appDataService.gaEventTrack('SERVO_SYSTEM_CONTINUE');
    if(this.courseData.lastActivity) {
      this.router.navigate(['../content', this.courseData.lastActivity.chapter, this.courseData.lastActivity.section], { relativeTo: this.activatedRoute });
    } else {
      this.router.navigate(['../content', 0, 0], { relativeTo: this.activatedRoute });
    }
  }

  getSplitTime() {
    if (this.courseData.startDate) {
      if ( this.courseData.timeSpent === '0' ) {
        return ['&lt; 1 min'];
      } else {
          return this.courseData.timeSpent.match(new RegExp('\\d+ days|\\d+ day|\\d+ hrs|\\d+ hr|\\d+ mins|\\d+ min', 'g'));
      }
    } else {
      return ['0 min'];
    }
  }

  getOriginalTime() {
    if ( this.courseData.startDate ) {
      if (this.courseData.timeSpent === '0' ) {
        return '&lt; 1 min';
      } else {
        return this.courseData.timeSpent;
      }
    } else {
      return '0 min';
    }
  }

  ngAfterViewInit() {
    this.$el.find('.chart').easyPieChart({
      barColor: '#F2BE35',
      trackColor: '#9E9E9E',
      scaleColor: false,
      lineWidth: 3,
      size: 32,
      lineCap: 'butt'
    });
  }
}
