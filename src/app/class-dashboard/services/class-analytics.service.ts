import { CourseDataService } from './../../servo-system-course/services/course-data.service';
import { environment } from './../../../environments/environment';
import { AppDataService } from './../../services/app-data.service';
import { ClassDataService } from './../../servo-system-course/services/class-data.service';
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';

@Injectable()
export class ClassAnalyticsService {
  getClassDummyData: boolean;
  constructor(private appDataService: AppDataService,private classDataService: ClassDataService
    ,private http:Http, private courseDataService:CourseDataService) { }

  getClassProductAnalytics(): Promise<any> {

    return new Promise((resolve, reject) => {

      // The Users may have been stored in the Home Page only , therefore a check was required 
      // Prepare params for request
      const params = new URLSearchParams();
      params.set('userid', this.appDataService.getUser()['userId']);
      params.set('classid', this.classDataService.ActiveClass);
      params.set('productid', this.courseDataService.getProductId());
      params.set('dummyData', this.appDataService.getClassDummyData.toString());
      params.set('sortField', 'first_name');
      params.set('sortOrder', 'asc');
      // Make an HTTP GET request
      this.http.get(environment.API_URL + 'analytics/class-analytics', { search: params })
        .toPromise()
        .then(response => {
          response = JSON.parse(response['_body']);
          this.classDataService.ClassProductAnalytics['data'] = response['product-analytics-class'];
          this.classDataService.NumberOfStudents = response['students-enrolled'];
          this.classDataService.ClassAverageCompletion = response['class-average-completion'];
          this.classDataService.StudentsEnrolledStats = response['students-enrolled-stats'];
          this.classDataService.TotalClassTimespentAllStudents  = response['total-class-timespent-all-students'];
          resolve(response);
        })
        .catch(err => {
          console.log('Error getting users ...');
          reject(err);
        });
    });
  }

  public getStudentsLogins(productId: string, type: 'stat' | 'timeseries', start?: number, interval?: string, analyticsDataType? : string ): Promise<any> {
    const params = new URLSearchParams();
    params.set('userid', this.appDataService.getUser()['userId']);
    params.set('productid', productId);
    params.set('type', type);

    // (passed classId parameter if present)
    if (this.classDataService.ActiveClass) {
      params.set('classid', this.classDataService.ActiveClass);
    }
    
    if (analyticsDataType) {
      params.set('analyticsDataType', analyticsDataType);
    }else{
      params.set('analyticsDataType', 'logins');
    }

    if (start) { params.set('start', start.toString()); }
    if (interval) { params.set('interval', interval.toString()); }

    return this.http.get(environment.API_URL + 'analytics/class-logins-time-stats', { search: params }).toPromise()
      .then(response => {
        
        return Promise.resolve(JSON.parse(response['_body']));
      }).catch(err => {
        console.error(err);
      });
  }
  public getUserClassData(): Promise<any> {
    let self =this;
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams();
      if (self.classDataService.ActiveClassData) {
        return resolve()
      }
      params.set('userid', self.appDataService.getUser()['userid']);
      params.set('classid',self.classDataService.ActiveClass);
      return this.http
        .get(environment.API_URL + 'groups-classes/user-enrolled-class', { search: params })
        .toPromise().then((userClass) => {
          if (userClass.status === 200) {
            // Resolve promise with result JSON
            this.classDataService.ActiveClassData = userClass.json();
            return resolve();
          } else {
            return reject('Error getting User Class');
          }
        });
    });
  }

  public getClassTotalTimeSpent(productId: string,
    type: 'stat' | 'timeseries',
    start?: number,
    interval?: string,
    analyticsDataType? : string,
    range?: string,
    role?: string): Promise<any> {
    const params = new URLSearchParams();
    params.set('userid', this.appDataService.getUser()['userId']);
    params.set('productid', productId);
    params.set('type', type);

    // (passed classId parameter if present)
    if (this.classDataService.ActiveClass) {
      params.set('classid', this.classDataService.ActiveClass);
    }
    
    if (analyticsDataType) {
      params.set('analyticsDataType', analyticsDataType);
    }else{
      params.set('analyticsDataType', 'logins');
    }

    if (start) { params.set('start', start.toString()); }
    if (interval) { params.set('interval', interval.toString()); }
    if (range) { params.set('range', range.toString()); }
    if (role) { params.set('role', role.toString()); }
    
    

    return this.http.get(environment.API_URL + 'analytics/class-time-spent-stats', { search: params }).toPromise()
      .then(response => {
        
        return Promise.resolve(JSON.parse(response['_body']));
      }).catch(err => {
        console.error(err);
      });
  }
  
  getClassObjectivesAnalytics(): Promise<any> {

    return new Promise((resolve, reject) => {

      // The Users may have been stored in the Home Page only , therefore a check was required 
      // Prepare params for request
      const params = new URLSearchParams();
      params.set('userid', this.appDataService.getUser()['userId']);
      params.set('classid', this.classDataService.ActiveClass);
      params.set('productid', this.courseDataService.getProductId());
      params.set('search', 'student');


      // Make an HTTP GET request
      this.http.get(environment.API_URL + 'analytics/class-objectives-analytics', { search: params })
        .toPromise()
        .then(response => {
          response = JSON.parse(response['_body']);
          this.classDataService.ClassObjectivesAnalytics = response['objective-analytics-class'];
          resolve();
        })
        .catch(err => {
          console.log('Error getting users ...');
          reject(err);
        });
    });
  }
}
