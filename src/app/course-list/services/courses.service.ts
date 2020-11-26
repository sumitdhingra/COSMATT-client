import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { AppDataService, UserType } from '../../services/app-data.service';
import '../../services/rxjs-operators.service';
import { environment } from '../../../environments/environment';
import { CourseDataService } from './../../servo-system-course/services/course-data.service';
import { TocService } from 'app/servo-system-course/services/toc.service';
import { ICourseStatus } from 'app/course-list/models/course-status.interface';

@Injectable()
export class CoursesService implements OnDestroy {
  private getProductsUrl = environment.API_URL + 'product/user-products';
  private _courses: Array<any> = [];

  set courses(newCourses: Array<any>) {
    this._courses = newCourses;
  };
  get courses(): Array<any> {
    return this._courses;
  }

  constructor(public http: Http,
    private appDataService: AppDataService,
    private courseDataService: CourseDataService,
    private tocService: TocService) {
    }

  ngOnDestroy() {
    // this.courses = null;
  }

  /**
   * Gets the list of courses entitled to the user
   * @param fetchNew? : Whether or not to fetch the course list again
   */
  public getCourses(fetchNew?: boolean, userId ?: string): Promise<Array<any>> {

    return new Promise((resolve, reject) => {

      // Early return if courses are already there and you don't wanna fetch new list
      if (!fetchNew && this.courses.length > 0) {
        resolve(this.courses);
      }

      // Prepare params for request
      const params = new URLSearchParams();
      userId = userId ? userId : this.appDataService.getUser()['userId'];
      params.set('userid', userId);

      // Make an HTTP GET request
      this.http.get(this.getProductsUrl, { search: params })
        .toPromise()
        .then(response => {
          this.courses = response.json();
          if(this.courses && Array.isArray(this.courses)){
            for(let index = 0; index < environment.products.length; index++){
                let prodId = environment.products[index];
                let prodIndex = -1;
                let prod = this.courses.find((prodObj, prodObjIndex) => {
                  prodIndex = prodObjIndex;
                  return prodObj.uuid === prodId;
                });
                if(prod){
                  this.courses.splice(this.courses.length-1, 0, prod);
                  this.courses.splice(prodIndex, 1);
                }
            }
          }
          resolve(this.courses);
        })
        .catch(err => {
          console.log('Error getting courses.');
          reject(err);
        });
    });
  }

  /**
  * Updates the course stored in this.courses corresponding to the provided productId
  * @param productId : UUID of the product
  */
  public updateCourseStatuses(productId: string, classId?: string, userId ?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const targetCourse = this.courses.find(course => course.uuid === productId);
      if (!targetCourse) {
        reject(new Error(`Cannot find course with ID: ${productId}`));
      }
      // Get course details
      this.courseDataService.getCourseDetails(productId,classId, userId)
        .then(courseDetails => {
          Object.assign(targetCourse.meta, courseDetails);

          // TODO
          // 1. Find a better way to do this
          // Set course progress
          this.appDataService.setCourseProgress(targetCourse.meta.progress);
          // this.appDataService.setCourseProgress(this.courseDataService.getCourseProgress(targetCourse.meta.toc));

          // Set user type
          targetCourse.meta.userType = UserType.NewUser;
          
          //API_STUB adding startDate check for usertype instead of timespent
          if(targetCourse.meta.startDate !== undefined){
          // if (targetCourse.meta.timespent > 0) {
            targetCourse.meta.userType = UserType.ExistingUser;
          }
          this.appDataService.setUserType(targetCourse.meta.userType);

          // Update TOC details
          this.tocService.setToc(targetCourse.meta.toc);

          // Set the course startDate
          this.appDataService.setStartDate(targetCourse.meta.startDate);

          resolve(targetCourse);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
  * Updates all the courses in the courses array
  */
  public updateAllCourseStatuses(): Promise<Array<any>> {
    return new Promise((resolve, reject) => {
      const coursesUpdatePromise = [];

      this.courses.forEach(course => {
        if ( course.meta.producttype === 'application' ) {
          return;
        }
        coursesUpdatePromise.push(this.updateCourseStatuses(course.uuid));
      });

      Promise.all(coursesUpdatePromise)
        .then(courseUpdatePromiseResults => resolve(this.courses))
        .catch(err => reject(err));
    });
  }


}
