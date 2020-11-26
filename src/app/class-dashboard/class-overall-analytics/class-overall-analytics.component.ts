
import { Component, OnInit, ElementRef } from '@angular/core';
import { ClassDataService } from 'app/servo-system-course/services/class-data.service';
import { UtilsService } from 'app/services/utils.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ClassAnalyticsService } from '../services/class-analytics.service';
import { CourseDataService } from 'app/servo-system-course/services/course-data.service';
import { AppDataService} from 'app/services/app-data.service';
@Component({
  selector: 'app-class-overall-analytics',
  templateUrl: './class-overall-analytics.component.html',
  styleUrls: ['./class-overall-analytics.component.scss']
})
export class ClassOverallAnalyticsComponent implements OnInit {
  classData : any;
  classAverageCompletion: number;
  studentsEnrolledStats: any;
  totalTimeSpent: any;
  SENotStartedString:string
  SEInProgressString:string
  SEFinishedString:string
  SEDetailedTitleString:string
  $el: any;
  constructor(public classDataService: ClassDataService,
    public utilsService: UtilsService,
    private router : Router,
    private activatedRoute : ActivatedRoute,
    private classAnalyticsService: ClassAnalyticsService,
    private courseDataService: CourseDataService,
    private appDataService: AppDataService,
    private el: ElementRef) {
      this.$el = jQuery(el.nativeElement);
     }

  ngOnInit() {
    let activeClassId= this.classDataService.ActiveClass;
    this.classData = this.getClassData(activeClassId);
    this.classAverageCompletion = Math.round(this.classDataService.ClassAverageCompletion);
    if(this.classDataService.getClassTotalTimeSpent){
      this.totalTimeSpent=this.classDataService.getClassTotalTimeSpent;
    }else{
      this.totalTimeSpent = this.utilsService.convertMillisecondsToDyHrMin(this.classDataService.TotalClassTimespentAllStudents);
    }
    

    //Hard coded this.totalTimeSpent
    
    // this.classAnalyticsService.getClassTotalTimeSpent(
    //   this.courseDataService.getProductId(),
    //   'stat', undefined, undefined, 'timespent'
    // ).then((timeseries) => {
    //   this.totalTimeSpent = this.utilsService.convertMillisecondsToDyHrMin((timeseries.total -11794673709));
    // });

    this.studentsEnrolledStats = this.classDataService.StudentsEnrolledStats;
    this.SENotStartedString = (this.studentsEnrolledStats['students-not-started'] ? this.studentsEnrolledStats['students-not-started'] : '0') +' Not Started';
    this.SEInProgressString = (this.studentsEnrolledStats['students-in-progress'] ? this.studentsEnrolledStats['students-in-progress'] : '0') +' In Progress';
    this.SEFinishedString = (this.studentsEnrolledStats['students-completed'] ? this.studentsEnrolledStats['students-completed']  : '0') +' Finished';

    this.SEDetailedTitleString = this.SENotStartedString+" | " + this.SEInProgressString+" | " +this.SEFinishedString;
          
  }

  getClassData(activeClassId :string) : any{

    let activeClassData = this.classDataService.ActiveClassData;
    let classStats = {
      "startdate" : "0"
    }
    if(activeClassData){
      classStats = activeClassData.class;
    }
    var daysElapsed = this.getDaysElapsed(classStats.startdate)
    return {
      'startDate': classStats.startdate,
      'daysElapsed': daysElapsed,
      'totaltimeSpent': "0",
      'classProgress': undefined
    };
  }

  getSplitTime(totaltimeSpent) {
    if (this.classData.startDate) {
      if ( totaltimeSpent === '0' ) {
        return ['&lt; 1 min'];
      } else {
          return totaltimeSpent.match(new RegExp('\\d+ days|\\d+ day|\\d+ hrs|\\d+ hr|\\d+ mins|\\d+ min', 'g'));
      }
    } else {
      return ['0 min'];
    }
  }
  getDaysElapsed(time){
    var epoctime = new Date(time).getTime();
    var daysElapsed = this.utilsService.getDaysElapsed(epoctime);
    return daysElapsed;
  }
  getOriginalTime() {
    if ( this.classData.startDate ) {
      if (this.classData.totaltimeSpent === '0' ) {
        return '&lt; 1 min';
      } else {
        return this.classData.totaltimeSpent;
      }
    } else {
      return '0 min';
    }
  }
  lastActivityLinkClicked() {
    const courseId = this.courseDataService.getProductId();
    this.courseDataService.getLastActivity(courseId)
      .then((lastVisited) => {
        if (!lastVisited) {
          lastVisited = {
            chapter: 0,
            section: 0
          }
        }
        this.appDataService.selectedModule = lastVisited.chapter;
        this.appDataService.selectedChapter = lastVisited.section;
        this.router.navigate(['../content', lastVisited.chapter, lastVisited.section], { relativeTo: this.activatedRoute });
      })
  }

  ngAfterViewInit() {
    this.$el.find('.chart-icon').easyPieChart({
      barColor: '#F2BE35',
      trackColor: '#9E9E9E',
      scaleColor: false,
      lineWidth: 3,
      size: 32,
      lineCap: 'butt'
    });
  }

}
