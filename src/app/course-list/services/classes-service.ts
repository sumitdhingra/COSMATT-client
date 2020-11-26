import { Injectable} from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import '../../services/rxjs-operators.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ClassesService {

  private _classes: any = [];
  private _classUsers: any = [];
  private _lastMonthTimeSpent:number;
  

  set Classes(classes) {
    this._classes = classes;
  }

  get Classes() {
    return this._classes;
  }

  set ClassUsers(classUsers) {
    this._classUsers = classUsers;
  }

  get ClassUsers() {
    return this._classUsers;
  }

  set LastMonthTimeSpent(lastMonthTimeSpent) {
    this._lastMonthTimeSpent = lastMonthTimeSpent;
  }

  get LastMonthTimeSpent() {
    return this._lastMonthTimeSpent;
  }
  

  constructor(public http: Http) {
  }

  public async getUserEnrolledClasses(userid): Promise<any> {
    if(this.Classes && this.Classes.length > 0){
      return this.Classes;
    }
    const params = new URLSearchParams();

    params.set('userid', userid);

    const userClasses = await this.http
      .get(environment.API_URL + 'groups-classes/user-enrolled-classes', { search: params })
      .toPromise();

    if (userClasses.status === 200) {
      // Resolve promise with result JSON
      this.Classes = userClasses.json()
      return Promise.resolve(this.Classes);
    } else {
      // Token in invalid
      return Promise.reject('Token is invalid');
    }
  }

  public async getClassStudents(classId, search?:string): Promise<any> {

    if(this.ClassUsers && this.ClassUsers.length > 0){
      return this.ClassUsers;
    }
    const params = new URLSearchParams();

    params.set('classid', classId);
    if(search) {params.set('search', search.toString());}

    const classUsers = await this.http
      .get(environment.API_URL + 'groups-classes/class-users', { search: params })
      .toPromise();

    if (classUsers.status === 200) {
      // Resolve promise with result JSON
      this.ClassUsers = classUsers.json()
      return Promise.resolve(this.ClassUsers);
    } else {
      // Token in invalid
      return Promise.reject('Token is invalid');
    }
  }

  public async getLastMonthTimeSpent(
  productId: string,
  userid: string,
  classid:string,
  type: 'stat' | 'timeseries',
  start?: number,
  role?: string,
  interval?: string,
  analyticsDataType? : string,
  range?: string,
  ): Promise<any> {
    const params = new URLSearchParams();
    params.set('userid', userid);
    params.set('productid', productId);
    params.set('type', type);
    params.set('classid', classid);

    if (analyticsDataType) {
      params.set('analyticsDataType', analyticsDataType);
    }else{
      params.set('analyticsDataType', 'timespent');
    }

    if (start) { params.set('start', start.toString()); }
    if (interval) { params.set('interval', interval.toString()); }
    if (range) { params.set('range', range.toString()); }
    if (role) { params.set('role', role.toString()); }
    
    

    var timeSpent = await this.http.get(environment.API_URL + 'analytics/class-time-spent-stats', { search: params }).toPromise();

    if (timeSpent.status === 200) {
      // Resolve promise with result JSON
      this.LastMonthTimeSpent = timeSpent.json().total;
      return Promise.resolve(this.LastMonthTimeSpent);
    } else {
      // Token in invalid
      return Promise.reject('Token is invalid');
    }
  }


}
