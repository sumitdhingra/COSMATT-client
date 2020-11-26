import { ClassDataService } from 'app/servo-system-course/services/class-data.service';
import { ClassesService } from './../course-list/services/classes-service';
import { Injectable } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppDataService, UserType , UserRole } from './app-data.service';
import { CoursesService } from 'app/course-list/services/courses.service';
import { CourseDataService } from 'app/servo-system-course/services/course-data.service';
import { AuthService } from './auth.service';
@Injectable()
export class CourseRedirectService {

  constructor(private router: Router,
    private appDataService: AppDataService,
    private coursesService: CoursesService,
    private courseDataService: CourseDataService,
    private activatedRoute: ActivatedRoute,
    private classesService: ClassesService,
    private classDataService: ClassDataService,
    private authService: AuthService) { }
 
  redirectOnUserRoleBasis(){ 
    this.appDataService.screenLoader = true;
    return this.coursesService.getCourses().then((courses)=>{
      if (courses.length === 1) {
        this.appDataService.loginErrorMessage = 'You are are not authorized to any product!';
        this.appDataService.deleteUser();
        this.router.navigate(['auth/login']);
        this.appDataService.screenLoader = false;
      } else {
        let courseData = courses[0];
        this.courseDataService.setProductId(courseData.uuid);
        this.courseDataService.setProductName(courseData.meta.title);
        this.courseDataService.setProductLogoPath(courseData.meta.thumbnaillarge);
        this.courseDataService.setPublicAssetsPath(courseData.meta.paths["public-assets"]);
        return this.coursesService.updateCourseStatuses(courseData.uuid).then((courseData)=>{
          if(this.appDataService.getUserRole()===UserRole.Teacher){
            this.redirectToTeacherDashboard(courseData.uuid);
          }else{
            this.redirectToCourseContent(courseData.uuid);
          }
         
        });
      }
    });
  }
  redirectToTeacherDashboard(uuid){ 
    this.appDataService.screenLoader = true;
    return this.classesService.getUserEnrolledClasses(this.appDataService.getUser()['userId']).then((classes: any) => {
      //setting Classes
      this.classDataService.ActiveClass = classes.entities[0].uuid;
      this.router.navigate(
        ['./courses/training/' + this.classDataService.ActiveClass + '/' + uuid + '/classdashboard'],
        { relativeTo: this.activatedRoute }
      );
    }).catch((error) => {
      this.router.navigate(['auth/login']);
    });
    
  }
  redirectToCourseContent(uuid) {
    this.appDataService.screenLoader = true;
    let userType = this.appDataService.getUserType();
    return this.classesService.getUserEnrolledClasses(this.appDataService.getUser()['userId']).then((classes: any) => {
      //setting Classes
      if(classes.entities.length){
        this.classDataService.ActiveClass = classes.entities[0].uuid;
      }
      if (userType === UserType.NewUser) {
        this.appDataService.gaEventTrack('SERVO_SYSTEM_LETS_BEGIN');
        // Redirecting to course introduction page if it's a new user
        if (this.classDataService.ActiveClass){
          this.router.navigate(['./courses/training/' + this.classDataService.ActiveClass+ '/' +uuid + '/introduction'], { relativeTo: this.activatedRoute });
        }else{
          this.router.navigate(['./courses/training/' + uuid + '/introduction'], { relativeTo: this.activatedRoute });
        }
        
   
      } else if (userType === UserType.ExistingUser) {
        this.appDataService.gaEventTrack('SERVO_SYSTEM_CONTINUE');
        this.courseDataService.getLastActivity(uuid).then((res) => {
           console.log(res)
           this.appDataService.selectedChapter = res.section;
           this.appDataService.selectedModule = res.chapter;
           this.appDataService.screenLoader = false;
           if (this.classDataService.ActiveClass){
            this.router.navigate(['./courses/training/' + this.classDataService.ActiveClass+
            '/' + uuid + '/content',  res.chapter, res.section], { relativeTo: this.activatedRoute });
           }else{
            this.router.navigate(['./courses/training/' + uuid + 
            '/content',  res.chapter, res.section], { relativeTo: this.activatedRoute });
           }
         }); 
       }
    }).catch((error) => {
      this.authService.logout()
      .catch(() => {
        console.log("Error in logging out");
      })
    });
  }
}
