import { ClassDataService } from './class-data.service';
import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';

import 'rxjs/add/operator/retry';

import { environment } from '../../../environments/environment';
import { AppDataService, UserType } from '../../services/app-data.service';
import { AuthService } from '../../services/auth.service';
import { ICourseStatus } from 'app/course-list/models/course-status.interface';


@Injectable()
export class CourseDataService {
  // courseId: string;
  sidebarStatus = {
    selected: window.innerWidth > 1024 ? 'toc' : 'none',
    clicked: window.innerWidth > 1024 ? true : false,
    clickedItem: window.innerWidth > 1024 ? 'toc' : 'none',
    hovered: false,
    open: () => this.sidebarStatus.selected !== 'none'
  };
  // productId: string = environment.productid;
  productId: string;
  productName: string;
  productLogoPath: string;
  publicAssetPath: string;
  appState = {
    lastActivity: null,
    startDate: null
  };

  constructor(
    private http: Http,
    private appDataService: AppDataService,
    private authService: AuthService,
    private classDataService: ClassDataService
  ) {
    this.authService.loggedOut.subscribe(() => this.clearData());
  }

  // setCourseId(id) {
  //   this.courseId = id;
  // }

  // getCourseId() {
  //   return this.courseId;
  // }

  setSidebarStatus(state) {
    this.sidebarStatus = state;;
  }

  getSidebarStatus() {
    return this.sidebarStatus;
  }

  public getProductId(): string {
    return this.productId;
  }

  setProductId(id) {
    this.productId = id;
  }

  public getProductName(): string {
    return this.productName;
  }

  setProductName(pname) {
    this.productName = pname;
  }

  public getProductLogoPath(): string {
    return this.productLogoPath;
  }

  setProductLogoPath(ppath) {
    this.productLogoPath = ppath;
  }


  setPublicAssetsPath(publicAssetPath) {
    this.publicAssetPath = publicAssetPath;
  }

  getPublicAssetsPath() {
    return this.publicAssetPath;
  }

  public getLastActivity(productId: string, userId ?: string ): Promise<any> {
    // Commenting this code to get the updated last visited in case course change.
    // Refactoring To Do 
    // if (this.appDataService.getLastVisited()) {
    //   return Promise.resolve(this.appDataService.getLastVisited());
    // }
    const params = new URLSearchParams();
    userId = userId ? userId : this.appDataService.getUser()['userId'];
    params.set('userid', userId);
    params.set('productid', productId);

    // (passed classId parameter if present)

    if (this.classDataService.ActiveClass) {
      params.set('classid', this.classDataService.ActiveClass);
    }
    return this.http.get(environment.API_URL + 'analytics/state', { search: params }).toPromise()
      .then(response => {
        if (response.json().lastActivity !== undefined && response.json().lastActivity.chapter !== undefined
          && response.json().lastActivity.section !== undefined) {
          return Promise.resolve(response.json().lastActivity);
        } else {
          return Promise.resolve({ chapter: 0, section: 0 });
        }
      })
      .catch(err => {
        console.log(err);
        return Promise.resolve({ chapter: 0, section: 0 });
      });
  }

  public updateLastActivity(productId: string, selectedChapter: number, selectedSection: number): Promise<any> {
    
    //Creating new object to send to dls considering the case if selected section is undefined or equal to -1.
    let lastActivityOfUser : any = {};
    if( selectedSection == undefined || selectedSection == -1 ){
      lastActivityOfUser = {
        chapter: selectedChapter
      };
    }else{
      lastActivityOfUser = {
        chapter: selectedChapter,
        section: selectedSection
      };
    }

      this.appState.lastActivity = {
        chapter: selectedChapter,
        section: selectedSection
      };
      
      this.appState.lastActivity.section =  lastActivityOfUser.section == undefined ? '-1' : lastActivityOfUser.section;

    this.appDataService.setLastVisited(this.appState.lastActivity);

    let params = { userid: this.appDataService.getUser()['userId'], productid: productId, appdata: { lastActivity: this.appState.lastActivity } }

    // (passed classId parameter if present)

    if (this.classDataService.ActiveClass) {
      params['classid'] = this.classDataService.ActiveClass;
    }

    return this.http.put(environment.API_URL + 'analytics/state', params).toPromise()
      .then(response => {
        // console.log(response.json().lastActivity);
        return Promise.resolve(response.json().lastActivity);
      }).catch(err => {
        console.error(err);
      })
  }

  public updateStartDate(productId: string, startDate: number): Promise<any> {

    let params = { userid: this.appDataService.getUser()['userId'], productid: productId, appdata: { startDate: startDate } }

    // (passed classId parameter if present)

    if (this.classDataService.ActiveClass) {
      params['classid'] = this.classDataService.ActiveClass;
    }

    return this.http.put(environment.API_URL + 'analytics/state', params).toPromise()
      .then(response => {
        this.appDataService.setStartDate(response.json().startDate);
        this.appDataService.setUserType(UserType.ExistingUser);
        return Promise.resolve(response.json().startDate);
      }).catch(err => {
        console.error(err);
      });
  }

  public getStartDate(productId: string): Promise<any> {
    if (this.appDataService.getStartDate()) {
      return Promise.resolve(this.appDataService.getStartDate());
    }
    const params = new URLSearchParams();
    params.set('userid', this.appDataService.getUser()['userId']);
    params.set('productid', productId);

    // (passed classId parameter if present)

    if (this.classDataService.ActiveClass) {
      params.set('classid', this.classDataService.ActiveClass);
    }

    return this.http.get(environment.API_URL + 'analytics/state', { search: params }).toPromise()
      .then(response => {
        let startDate = null;
        if (response.json() && response.json().startDate) {
          startDate = response.json().startDate;
          this.appDataService.setStartDate(startDate);
        }
        return Promise.resolve(startDate);
      });
  }

  /**
 * Returns the details of course as specified in ICourseStatus interface
 * @param productId : UUID of the product
 */
  public getCourseDetails(productId: string , classId?: string, userId ?: string): Promise<ICourseStatus> {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams();
    userId = userId ? userId : this.appDataService.getUser()['userId'];
    params.set('userid',userId);
    params.set('productid', productId);


    // (passed classId parameter if present)
    // let userClasses = await this.classDataService.getClasses();

    if (classId) {
      params.set('classid',classId);
    }

      return this.http.get(environment.API_URL + 'product/user-product-details', { search: params })
        .retry(1)
        .toPromise()
        .then(response => {
          const responseJson: any = response.json();
          // Create ICourseStatus object
          const courseDetails: ICourseStatus = {
            startDate: responseJson.startDate,
            timespent: responseJson.timespent,
            toc: responseJson.toc.result,
            progress: Math.round(responseJson.toc.__analytics.percentageCompletion),
             //API_STUB adding startDate check for usertype instead of timespent
            userType: responseJson.startDate !== undefined ? UserType.ExistingUser : UserType.NewUser
          };
          resolve(courseDetails);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  /**
   * Gets the time spent by a user on a given product.
   * Refer https://github.com/comprodls/comprodls-sdk-js/wiki/06_ANALYTICS-Adapter#getproducttimespenttsparams
   * @param productId : UUID of product
   * @param type : type of time spent data to get. 'stat' or 'timeseries'
   * @param start : (optional) start time in milliseconds
   * @param interval : (optional) end time in milliseconds
   */
  public getCourseTimeSpent(productId: string, type: 'stat' | 'timeseries', start?: number, interval?: string, userId ?: string): Promise<any> {
    const params = new URLSearchParams();
    userId = userId ? userId : this.appDataService.getUser()['userId']
    params.set('userid', userId);
    params.set('productid', productId);
    params.set('type', type);

    // (passed classId parameter if present)
    if (this.classDataService.ActiveClass) {
      params.set('classid', this.classDataService.ActiveClass);
    }
    if (start) { params.set('start', start.toString()); }
    if (interval) { params.set('interval', interval.toString()); }

    return this.http.get(environment.API_URL + 'analytics/timespent', { search: params }).toPromise()
      .then(response => {
        return Promise.resolve(JSON.parse(response['_body']));
      });
  }

  /**
  * Gets the progress of course from tocJson of the course
  * @param tocJson : tocJson or the `items` property in course data as per DLS.
  */
  public getCourseProgress(tocJson: any): number {
    const progress = {
      reading: {
        total: 0,
        completed: 0
      },
      assessment: {
        total: 0,
        completed: 0
      }
    };

    for (const chapter of tocJson) {
      for ( const section of chapter.items ) {
        // Check if it is reading type section and embedded items are greater than 1
        // TODO - Need a better check to detect these assessments in the future.
        if ( section['sub-type'] === 'md' ) {
          progress.reading.total++;
          if (section['__analytics'].status === 'completed') {
            progress.reading.completed++;
          }

          // Only do this for embedded assessments
          if ( section.embedded && section.embedded.length > 1 ) {
            for (const embeddedItem of section.embedded) {
              // Each embeddedItem can have multiple questions ( sub-embedded things )
              progress.assessment.total += embeddedItem.questions.length;
              if ( embeddedItem.__analytics.activityStatus === 'completed' ) {
                progress.assessment.completed++;
              }
            } // end for-embedded
          }
        } else if ( section['sub-type'] === 'test' ) {
          progress.assessment.total++;
          if (section['__analytics'].status === 'completed') {
            progress.assessment.completed++;
          }
        }
      } // end for-sections
    } // end for-chapters

    const totalCompleted = progress.reading.completed + progress.assessment.completed;
    const totalCount = progress.reading.total + progress.assessment.total;

    return Math.round(totalCompleted / totalCount * 100);
  }

  public applyProductTheme(productId, ProductTheme){
    let theme = this.appDataService.getThemeColor(productId);
    if(theme){
      this.appDataService.setThemeColor(productId, theme);
    }else{
      this.appDataService.setThemeColor(productId, ProductTheme);
    }
  }

  public clearData() {
    this.appDataService.setStartDate(null);
    this.appDataService.setLastVisited(null);
  }
}
