import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { CourseDataService } from '../services/course-data.service';
import { AppDataService ,UserRole} from '../../services/app-data.service';
import { ProductService } from '../services/product.service';
import { TocService } from '../services/toc.service';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilsService } from './../../services/utils.service';
import { ThrowStmt } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements  OnInit {
  @Input() courses: Array<any>;
  @Input() dashBoardData: Array<any>;
  @Input() studentClassProgress: boolean;
  courseObjectives: Object;
  courseEngagement: Object;
  currentStudentId:string;

  // Fix for tags progress until sub-tag progress is provided.
  courseEngagementTemp: any;
  chapterSectionAnalytics = {};
  // Fix end.

  courseData: any;
  courseTopics: Object;
  currentStatus: Object;
  courseBadges: Object;
  courseStatus: Object;
  progressView = 'chapters';
  lastActivity: any;
  lastActivityText: any;

  constructor(private courseDataService: CourseDataService,
    private appDataService: AppDataService,
    private productService: ProductService,
    private tocService: TocService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private utilsService: UtilsService
  ) {

    // console.log(this.courseObjectives);


    // Uncomment to use the tagsProgress when it is provided by DLS
    // let courseTags = this.productService.getTags();
    // let tagsProgress = [];

    // for (const tag in courseTags) {
    //   if (courseTags.hasOwnProperty(tag)) {
    //     if (tag === 'Reading') {
    //         tagsProgress.push({
    //           'title': 'Reading',
    //           'percentage': courseTags[tag].__analytics.completed * 100 / courseTags[tag].__analytics.total,
    //           'completed': courseTags[tag].__analytics.completed,
    //           'total': courseTags[tag].__analytics.total
    //         });
    //     } else if (tag === 'Test') {
    //         tagsProgress.push({
    //           'title': 'Assessments',
    //           'percentage': courseTags[tag].__analytics.completed * 100 / courseTags[tag].__analytics.total,
    //           'completed': courseTags[tag].__analytics.completed,
    //           'total': courseTags[tag].__analytics.total
    //         });
    //     } else if (tag === 'Practice') {
    //         tagsProgress.push({
    //           'title': 'Practice',
    //           'percentage': courseTags[tag].__analytics.completed * 100 / courseTags[tag].__analytics.total,
    //           'completed': courseTags[tag].__analytics.completed,
    //           'total': courseTags[tag].__analytics.total
    //         });
    //       this.courseEngagementTemp.practice.completed = courseTags[tag].__analytics.completed;
    //       this.courseEngagementTemp.practice.total = courseTags[tag].__analytics.total;
    //     }
    //   }
    // };

    // this.courseEngagement = {
    //   'title': 'Engagement',
    //   'data': tagsProgress
    // };

    this.courseBadges = {
      'bronze': 0,
      'silver': 0,
      'gold': 0
    };

    this.courseStatus = {
      'completed': 2,
      'pending': 6
    };
  }

  // ngOnChanges() {
  
  // }

  ngOnInit() {
    if(this.studentClassProgress){
      this.currentStudentId = this.dashBoardData[4];
    }else{
      this.currentStudentId = this.appDataService.getUser()['userId'];
    }
    
    this.getStudentDashboardData();
  }


  getStudentDashboardData() {
    const courseObjectivesJson = this.productService.getObjectives();
    const courseObjProgress = [];
    // tslint:disable-next-line:forin
    for (const key of Object.keys(courseObjectivesJson)) {
      // temp fix to be removed
      if (!courseObjectivesJson[key]['__analytics']) {
        courseObjProgress.push({ 'title': key, 'progress': 0 });
        continue;
      }
      // console.log(courseObjectivesJson[key]['__analytics']);
      // console.log(courseObjectivesJson[key]['__analytics'].completed, courseObjectivesJson[key]['__analytics'].total);
      courseObjProgress.push({
        'title': key,
        'progress': Math.ceil((courseObjectivesJson[key]['__analytics'].completed / courseObjectivesJson[key]['__analytics'].total) * 100)
      });
    }

    this.courseObjectives = {
      'title': 'Learning Objectives',
      'headerTitles': [
        'Objective',
        'Progess(%)'
      ],
      'data': courseObjProgress
    };
    this.courseEngagementTemp = {
      reading: {
        completed: 0,
        total: 0,
        title: 'Reading',
        labelText: 'Read'
      },
      assessments: {
        completed: 0,
        total: 0,
        title: 'Assessments',
        labelText: 'Submitted'
      },
      practice: {
        completed: 0,
        total: 0,
        title: 'Practice',
        labelText: 'Attempted'
      }
    }
    this.courses = this.courses ? this.courses: this.activatedRoute.snapshot.data['courses'];
    this.dashBoardData = this.dashBoardData ? this.dashBoardData : this.activatedRoute.snapshot.data['dashBoardData'];

    let chaptersTOC = this.dashBoardData[3].meta.toc;
    this.tocService.setToc(chaptersTOC);
    let chaptersProgress = [];

    chaptersTOC.forEach(function (value, index) {
      chaptersProgress.push({
         'title': value.name,
         'progress': value.__analytics.percentageCompletion,
         'items': value.items,
         'item-code': value['item-code']
        });
    });

    this.courseTopics = {
      'title': 'Chapters',
      'headerTitles': [
        'Objective',
        'Progess(%)'
      ],
      'data': chaptersProgress,
      'learningObjectivesProgress': courseObjectivesJson
    };
    this.setCourseData();

    // this.currentStatus = this.courseDataService.getCurrentChapter();
    if(this.appDataService.getUserRole() === UserRole.Student){
      this.appDataService.setPageTitle('My Progress');
    }
    if (!this.currentStatus) {
      this.currentStatus = {
        'module': 3,
        'chapter': 2,
        'title': 'Transmission - Screw',
        'pretestflag': 'true'
      };
    } else {
      this.currentStatus['pretestflag'] = this.appDataService.getPretestFlag();
    }

    // console.log(this.activatedRoute.snapshot);
    // this.lastActivity = this.activatedRoute.snapshot.data['dashBoardData'][0];

    // For loop to display data on Chapter Progress Accordion
    // Used for displaying information in Card header:
    // 1. Display time in: XX days YY hrs ZZ mins
    // 2. Display status in: XX of YY Completed
    for (const chapter of this.courseTopics['data']) {
      let totalTimeSpent: any = 0;
      let sectionsCompleted = 0;
      let sectionsTotal = 0;
      let totalTimeSpentOriginal: any = 0;

      // For loop to:
      // 1. Calculate timeSpent of a section
      // 2. Check how many sections are completed
      for (const section of chapter.items) {
        sectionsTotal++;
        totalTimeSpent = totalTimeSpent + +section['__analytics'].timespent;

        // For MD item
        if (section['sub-type'] === 'md') {
          this.courseEngagementTemp.reading.total++;
          if (section['__analytics'].status === 'completed') {
            this.courseEngagementTemp.reading.completed++;
            sectionsCompleted++;
          }

          // See if it contains embedded questions.
          // TODO - Add a better check here for detecting assessments with `IN_SECTION` mode as in Chapter 8
          if (section.embedded) {
            switch (section.embedded.length) {
              case 1:
                // It is old formative type `END_OF_SECTION` assessment
                const embeddedQuestions = section.embedded[0].questions;
                this.courseEngagementTemp.practice.total += embeddedQuestions.length;
                // Look for each question's correct status
                for (const question of embeddedQuestions) {
                  if (question.__analytics.statusEvaluation && question.__analytics.statusEvaluation === 'correct') {
                    this.courseEngagementTemp.practice.completed++;
                  }
                }
                break;

              //default:
                // It is new summative type `IN_SECTION` assessment
                // for (const embeddedItem of section.embedded) {
                  // Each embeddedItem can have multiple questions ( sub-embedded things )
                //   this.courseEngagementTemp.assessments.total += embeddedItem.questions.length;
                //   if ( embeddedItem.__analytics.activityStatus === 'completed' ) {
                //     this.courseEngagementTemp.assessments.completed++;
                //   }
                  // for (const question of embeddedItem.questions) {
                  //   // Question should only have some evaluation, don't care if it is correct or not
                  //   if ( question.__analytics.statusEvaluation ) {
                  //     this.courseEngagementTemp.assessments.completed++;
                  //   }
                  // }
                // }
            }
          }
        } else if (section['sub-type'] === 'test') {
          this.courseEngagementTemp.assessments.total++;
          if (section['__analytics'].status === 'completed') {
            this.courseEngagementTemp.assessments.completed++;
            sectionsCompleted++;
          }
        }
      }

      // If time is 0, status is "Not Started"
      if (totalTimeSpent === 0) {
        totalTimeSpent = totalTimeSpentOriginal = ['Not Started'];
      } else {
        // Get xx days yy hrs zz mins format from utilsService
        totalTimeSpent = totalTimeSpentOriginal = this.utilsService.convertMillisecondsToDyHrMin(totalTimeSpent);

        if (totalTimeSpent !== 'less than 1 min') {
          // If it is not less than 1 min, only update totalTimeSpent
          totalTimeSpent = this.splitTimeString(('' + totalTimeSpent));
        } else {
          // Else update both in an array
          totalTimeSpent = totalTimeSpentOriginal = ['less than 1 min'];
        }
      }

      // This Object is read by ngFor and displays information according to chapter title
      this.chapterSectionAnalytics[chapter.title] = {
        'totalTimeSpent': totalTimeSpent,
        'sectionsCompleted': sectionsCompleted,
        'sectionsTotal': sectionsTotal,
        'totalTimeSpentOriginal': totalTimeSpentOriginal
      };
    }
  }
  // Helper function to split:
  // XX days YY hrs ZZ mins ---> [XX, days, YY, hrs, ZZ, mins]
  splitTimeString(timeString: string) {
    return timeString.match(new RegExp('\\d+|\\w+', 'g'));
  }

  resumeBtnClicked() {
    this.courseDataService.getLastActivity(this.courses[0].uuid)
      .then((res) => {
        this.appDataService.selectedModule = res.chapter;
        this.appDataService.selectedChapter = res.section;
        this.router.navigate(['../content', res.chapter, res.section], { relativeTo: this.activatedRoute });
      });
  }

  private setCourseData() {
    // let currentCourse = this.activatedRoute.snapshot.data['courses'].filter(course => {
    //   return course.uuid === this.courseDataService.getProductId();
    // })[0];
    const currentCourse = this.dashBoardData[3];

    this.courseData = {
      'title': currentCourse.meta.title,
      'startDate': currentCourse.meta.startDate,
      'timeSpent': this.utilsService.convertMillisecondsToDyHrMin(currentCourse.meta.timespent),
      'courseProgress': this.appDataService.getCourseProgress(),
      'lastActivity': this.dashBoardData[0],
      'timeSpentLastDay': this.utilsService.convertMillisecondsToDyHrMin(this.dashBoardData[1].total)
    };
    let activity = {
      chapter: 0,
      section: 0
    }
    if (this.courseData.lastActivity) {
      activity = this.tocService.getChapterSectionName(this.courseData.lastActivity.chapter, this.courseData.lastActivity.section);
    }
    this.courseData.lastChapter = activity.chapter;
    this.courseData.lastSection = activity.section;
    if(this.studentClassProgress){
      this.currentStudentId = this.dashBoardData[4];
    }
  }

  onProgressViewSelectionChange(selectedView) {
    if (selectedView === 'chapters') {
      this.appDataService.gaEventTrack('SERVO_SYSTEM_PROGRESS_CHAPTERS');
    } else if (selectedView === 'objectives') {
      this.appDataService.gaEventTrack('SERVO_SYSTEM_PROGRESS_OBJECTIVES');
    }
    this.progressView = selectedView;
  }
}

