import { ClassDataService } from './../../servo-system-course/services/class-data.service';
import { Component, OnInit, Input, ElementRef, OnChanges, DoCheck, OnDestroy , HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'jquery.dotdotdot/src/js/jquery.dotdotdot';
import { AppDataService, THEME_COLORS, UserRole, UserType } from '../../services/app-data.service';
import { CoursesService } from '../services/courses.service';
import { CourseDataService } from '../../servo-system-course/services/course-data.service';
import { UtilsService } from './../../services/utils.service';
import { GoogleDriveClientService } from '../../file-store/services/google-drive-client.service';
import * as uuid from 'uuid';
import { ICourseStatus } from 'app/course-list/models/course-status.interface';
import { ClassesService } from '../services/classes-service';
import { environment } from '../../../environments/environment';
declare var jQuery: any;

@Component({
  selector: 'app-course-item',
  templateUrl: './course-item.component.html',
  styleUrls: ['./course-item.component.scss']
})
export class CourseItemComponent implements OnInit, DoCheck, OnDestroy {
  @Input() courseData: any;
  @Input() classData: any;


  courseId: string;
  courseTitle: string;
  courseLogoPath: string;
  coursePublicAccessPath: string;
  courseStartDate: any;
  courseTimeSpent: string;
  courseProgress: string | number;
  courseBadges: Object;
  // assessmentProgress:string | number;
  courseType: string;
  // courseBadges:any;
  description: string;
  el: ElementRef;
  user: any;
  userRole: any;
  userType = UserType;
  googlePickerConfig: any;
  classTitle : string;
  classStartDate :string;
  totalStudentsEnrolled: number
  classLastMonthTimeSpent:any
  UserRole = UserRole
  productTheme;

  // courseUserType: any;
  constructor(private router: Router,
    el: ElementRef,
    public appDataService: AppDataService,
    
    private coursesService: CoursesService,
    private activatedRoute: ActivatedRoute,
    private courseDataService: CourseDataService,
    private googleDriveClientService: GoogleDriveClientService,
    public utilsService: UtilsService,
    public classDataService: ClassDataService,
    private classesService: ClassesService) {
    this.el = el;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log(event);
    if ((event.ctrlKey && event.shiftKey) && event.keyCode == 90 && this.courseType === 'courseware' && this.userRole === 'teacher') {
      this.appDataService.getClassDummyData = true;
    }
  }
  ngOnInit() {
    this.appDataService.setPageTitle('Courses');
    this.googlePickerConfig = this.appDataService.googlePickerConfig;
    this.user = this.appDataService.getUser();
    this.courseType = this.courseData.meta.producttype;
    this.courseLogoPath = this.courseData.meta.thumbnaillarge;
    this.coursePublicAccessPath = this.courseData.meta.paths && this.courseData.meta.paths["public-assets"] ? this.courseData.meta.paths["public-assets"] : "";
    this.courseTitle = this.courseData.meta.title;
    this.userRole = this.appDataService.getUserRole();
    this.description = this.courseData.meta.description;
    if (this.courseData.meta.model && this.courseData.meta.model.theme) {
      this.productTheme = this.courseData.meta.model.theme;
    } else {
      this.productTheme = THEME_COLORS.DEFAULT;
    }

    if (this.userRole === UserRole.Teacher && this.courseType == "courseware") {
      this.classTitle = this.classData.title;
      this.classStartDate = this.classData.class.startdate;
      this.classesService.getClassStudents(this.classData.uuid).then(classUsers => {
        if (classUsers.length) {
          this.totalStudentsEnrolled = classUsers.length;
        } else {
          this.totalStudentsEnrolled = 0;
        }
      });
      const intervalStartDate = new Date();
      intervalStartDate.setMonth(intervalStartDate.getMonth() - 1);
      this.classesService.getLastMonthTimeSpent(
        this.courseData.uuid,
        this.appDataService.getUser()['userId'],
        this.classData.uuid,
        'stat'
        ).then( lastMonthTimeSpent =>{
          this.classDataService.setClassTotalTimeSpent = this.utilsService.convertMillisecondsToDyHrMin(lastMonthTimeSpent);
        this.classLastMonthTimeSpent = this.utilsService.convertMillisecondsToDyHrMin(lastMonthTimeSpent);
      });
    }

    
    

    if (this.courseType === 'courseware') {
      this.courseId = this.courseData.uuid;
      // this.courseStartDate = this.courseData.meta.startDate;
      // this.courseTimeSpent = this.courseData.meta.timeSpent || '0 Days';
      // this.courseUserType = this.user.userType;

      // this.courseProgress = this.courseData.meta.courseProgress || Math.floor(Math.random() * 100);
      // this.courseProgress = this.courseData.progress;
      this.courseBadges = this.courseData.meta.courseBadges;
      // this.courseTimeSpent = this.utilsService.convertMillisecondsToDyHrMin(this.courseData.meta.timespent);
      // this.courseTimeSpent = this.courseData.meta.timespent;
      // this.user.userType = this.courseData.meta.userType;

      // to be impplemented
      // if (this.user.userType === UserType.NewUser) {
      //   this.courseStartDate = 'Not Started';
      //   this.courseBadges['bronze'] = 0;
      //   this.courseBadges['silver'] = 0;
      //   this.courseBadges['gold'] = 0;
      //   this.courseProgress = 0;
      // } else if (this.user.userType === UserType.ExistingUser) {
      //   // this.courseUserType = 'old';
      //   if (this.courseStartDate) {
      //     let date = new Date(this.courseStartDate);
      //     this.courseStartDate = this.utilsService.convertDateUtcToDateString(this.courseStartDate);
      //   } else {
      //     this.courseStartDate = 'Not Started';
      //   }
      //   this.courseBadges['bronze'] = 0;
      //   this.courseBadges['silver'] = 0;
      //   this.courseBadges['gold'] = 0;
      // }
      // this.assessmentProgress = this.courseData.meta.assessmentProgress || Math.floor(Math.random() * 100);
      // this.courseBadges = this.courseData.meta.badges;
    }
  }

  ngDoCheck() {
    if (this.isMetaUpdated()) {
      this.courseProgress = this.appDataService.getCourseProgress();
      this.courseTimeSpent = this.courseData.meta.timespent;
      this.courseStartDate = this.courseData.meta.startDate;
      this.user.userType = this.courseData.meta.userType;
    }
    if (this.isClassMetaUpdated()) {
      this.classTitle = this.classData.title;
      this.classStartDate = this.classData.class.startdate;
    }
  }

  ngOnDestroy() {
    delete this.courseProgress;
    delete this.courseTimeSpent;
    delete this.courseStartDate;
    delete this.user.userType;
  }


  isClassMetaUpdated() {
    let classTitle:string;
    let classStartDate:string;
    if(this.classData){
      classTitle = this.classData.title;
      classStartDate = this.classData.class.startdate;
    }
    if (classTitle !== this.classTitle
      || classStartDate !== this.classStartDate) {
      return true;
    }
    return false;
  }

  isMetaUpdated() {
    const { timespent, startDate, progress } = this.courseData.meta;
    if (timespent !== this.courseTimeSpent
      || progress !== this.courseProgress
      || startDate !== this.courseStartDate) {
      return true;
    }
    return false;
  }

  ngAfterViewInit() {
    // jQuery(this.el.nativeElement).find('.course-title').dotdotdot();
    // jQuery(this.el.nativeElement).find('.application-description').dotdotdot();
  }

  courseSelectionButtonClicked(e, viewCourse) {
    console.log(`Course:- ${this.courseTitle} with ID:- ${this.courseId} is selected.`);
    this.courseDataService.setProductId(this.courseId);
    this.courseDataService.setProductName(this.courseTitle);
    this.courseDataService.setProductLogoPath(this.courseLogoPath);
    this.courseDataService.setPublicAssetsPath(this.coursePublicAccessPath);
    this.appDataService.screenLoader = true;
    this.courseDataService.applyProductTheme(this.courseId, this.productTheme);
    
    //this.coursesService.updateCourseStatuses(this.courseId, classId)
    //setting the activeClass if it exists 
    if (this.classData){
      this.classDataService.ActiveClass = this.classData.uuid;
      this.classDataService.ActiveClassData = this.classData;
    }
    let classId = this.classData ? this.classDataService.ActiveClass : undefined;
    this.coursesService.updateCourseStatuses(this.courseId, classId).then(()=>{
      // this.appDataService.screenLoader = true;
      //  Updated Route in case a user is enrolled to a certain class
      if (this.userRole === 'teacher' && !viewCourse) {
  
        this.router.navigate(
          ['./training/' + this.classData.uuid + '/' + this.courseId + '/classdashboard'],
          { relativeTo: this.activatedRoute }
        );
  
      }else {
        if (this.classData) {
          if (this.user.userType === UserType.NewUser) {
            // this.router.navigate(['app/courses/traiassdsning']);
            this.appDataService.gaEventTrack('SERVO_SYSTEM_LETS_BEGIN');
            this.router.navigate(['./training/' + this.classData.uuid + '/' + this.courseId], { relativeTo: this.activatedRoute });
          } else if (this.user.userType === UserType.ExistingUser) {
            this.appDataService.gaEventTrack('SERVO_SYSTEM_CONTINUE');
            this.courseDataService.getLastActivity(this.courseId)
              .then((res) => {
                console.log(res)
                this.appDataService.selectedChapter = res.section;
                this.appDataService.selectedModule = res.chapter;
                this.appDataService.screenLoader = false;
                this.router.navigate(['./training/' + this.classData.uuid + '/' + this.courseId + '/content', res.chapter, res.section], { relativeTo: this.activatedRoute });
                // this.router.navigate(['./training/' + this.courseId], { relativeTo: this.activatedRoute });
              });
                }
        } else {
          if (this.user.userType === UserType.NewUser) {
            // this.router.navigate(['app/courses/training']);
            this.appDataService.gaEventTrack('SERVO_SYSTEM_LETS_BEGIN');
            this.router.navigate(['./training/' + this.courseId], { relativeTo: this.activatedRoute });
          } else if (this.user.userType === UserType.ExistingUser) {
            this.appDataService.gaEventTrack('SERVO_SYSTEM_CONTINUE');
            this.courseDataService.getLastActivity(this.courseId)
              .then((res) => {
                console.log(res)
                this.appDataService.selectedChapter = res.section;
                this.appDataService.selectedModule = res.chapter;
               
                this.appDataService.screenLoader = false;
                this.router.navigate(['./training/' + this.courseId + '/content', res.chapter, res.section], { relativeTo: this.activatedRoute });
                // this.router.navigate(['./training/' + this.courseId], { relativeTo: this.activatedRoute });
              });
          }
        }
      }
    })
    
  }

  applicationSelectionButtonClicked(e) {
    console.log('application clicked');

    this.courseDataService.setProductId(this.courseId);
    this.courseDataService.setProductName(this.courseTitle);
    this.courseDataService.setProductLogoPath(this.courseLogoPath);
    this.courseDataService.setPublicAssetsPath(this.coursePublicAccessPath);
    this.appDataService.isNewSizingApplication = true;
    this.router.navigate(['./sizing-app/' + uuid.v4()], {});
  }

  navigateToDashboard() {
    this.appDataService.gaEventTrack('SERVO_SYSTEM_MY_PROGRESS');
    this.courseDataService.setProductId(this.courseId);
    this.courseDataService.setProductName(this.courseTitle);
    this.courseDataService.setProductLogoPath(this.courseLogoPath);
    this.courseDataService.setPublicAssetsPath(this.coursePublicAccessPath);
    this.appDataService.screenLoader = true;
    this.courseDataService.applyProductTheme(this.courseId, this.productTheme);
    if (this.classData){
      this.classDataService.ActiveClass = this.classData.uuid;
      this.classDataService.ActiveClassData = this.classData;
    }
      if (this.classData) {
        this.router.navigate(['./training/' + this.classData.uuid + '/' + this.courseId + '/dashboard'], { relativeTo: this.activatedRoute });
      } else {
    this.router.navigate(['./training/' + this.courseId + '/dashboard'], { relativeTo: this.activatedRoute });
  }



  }

  onGoogleDriveFileSelect(file) {
    this.appDataService.isNewSizingApplication = false;
    this.googleDriveClientService.getFile(file.id).then((data) => {
      this.router.navigate(['./sizing-app/' + uuid.v4()], {});
    }).catch((error) => {
      alert('error');
      console.error(error);
    });
  }

  onGoogleDriveFolderSelect(folder) {
    this.appDataService.isNewSizingApplication = true;
    this.router.navigate(['./sizing-app/' + uuid.v4()], {});
    // const filename = 'testApp1.csmt';
    // const data = {
    //   id: uuid.v4(),
    //   name: 'testApp1'
    // };
    // this.googleDriveClientService.createFile(filename, folder.id, data).then((file) => {
    //   this.router.navigate(['./sizing/axis/' + uuid.v4()], {});
    // }).catch((error) => {
    //   alert('error');
    //   console.error(error);
    // });
  }
  onDiskFileIconClick() {
    jQuery(this.el.nativeElement).find('#read-from-disk').click();
  }
  onDiskFileRead(json) {
    this.appDataService.isNewSizingApplication = false;
    this.appDataService.sizingApplicationJson = json;
    this.router.navigate(['./sizing-app/' + JSON.parse(this.appDataService.sizingApplicationJson).id], {});
  }

  onCourseDetailsFetched(courseDetails: ICourseStatus) {
    console.log(courseDetails);
  }

}
