import { ClassDataService } from './class-data.service';
import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';
import { environment } from '../../../environments/environment';
import { AppDataService } from '../../services/app-data.service';
import { CourseDataService } from './course-data.service';

@Injectable()
export class ActivityService {
  practiceResponses: any;
  constructor(private http: Http,
    private appDataService: AppDataService,
    private courseDataService: CourseDataService,
    private classDataService: ClassDataService) { }

    public getActivity(activityId: string, newAttempt?:string): Promise<any> {
    const params = new URLSearchParams();
    const productId = this.courseDataService.getProductId();
    params.set('productId', productId);
    params.set('activityId', activityId);
    params.set('userId', this.appDataService.getUser()['userId']);
    params.set('details', true.toString());
    params.set('metrics', true.toString());
    params.set('newAttempt', newAttempt)

    if(this.classDataService.ActiveClass){
      params.set('classid', this.classDataService.ActiveClass);
}

    return this.http.get(environment.API_URL + 'analytics/content', { search: params }).toPromise();
  }

  public setPracticeResponses(response) {
    this.practiceResponses = response;
  }
  public getPracticeResponses() {
    return this.practiceResponses;
  }
}
