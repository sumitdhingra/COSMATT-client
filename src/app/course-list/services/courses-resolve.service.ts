import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { CoursesService } from './courses.service';
import { AppDataService } from 'app/services/app-data.service';
import { Location } from '@angular/common';

@Injectable()
export class CoursesResolve implements Resolve<any> {

  constructor(private coursesService: CoursesService, private router: Router, public appDataService: AppDataService, private location: Location) { }

  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
    return this.coursesService.getCourses().then((courses: any) => {
      // change to zero after removing dummy app course from backend
      if (courses.length === 1) {
        this.appDataService.loginErrorMessage = 'You are are not authorized to any product!';
        this.appDataService.deleteUser();
        this.router.navigate(['auth/login']);
        this.appDataService.screenLoader = false;
      } else {
        // if ( this.location.path().endsWith('dashboard') ) {
        //   return this.coursesService.updateAllCourseStatuses()
        //     .then(updatedCourses => {
        //       return updatedCourses;
        //     });
        // }
        return courses;
      }
    }).catch((error) => {
      this.router.navigate(['auth/login']);
    });
  }
}
