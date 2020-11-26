import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { environment } from '../../../environments/environment';
import { CourseDataService } from './course-data.service';
import { AppDataService } from '../../services/app-data.service';
import { Statement } from '../models/statement.model';
import { ClassDataService} from './class-data.service';

export const ItemStatus: any = {
  NOT_STARTED: 'not_started',
  INCOMPLETE: 'in_complete',
  COMPLETED: 'completed'
};

export const ProgressStatus: any = {
  LAUNCHED: 'launched',
  INTERACTED: 'interacted',
  COMPLETED: 'completed',
  ANSWERED: 'answered',
  ATTEMPED: 'attempted',
  SCORED: 'scored',
  SUBMITTED: 'submitted'
};

@Injectable()
export class ProgressService {

  constructor(private http: Http, private courseDataService: CourseDataService, private appDataService: AppDataService
    , private classDataService: ClassDataService) { }

  private postExperienceStatement(statement: Statement) {

   //passed classId parameter if present

   if(this.classDataService.ActiveClass){
    statement.classid = this.classDataService.ActiveClass;
   }

    return this.http.post(environment.API_URL + 'experience/statements', statement).toPromise().then(res => {
      return JSON.parse(res['_body']);
    }).catch((error) => console.log);
  }
  public postAttemptStatement(itemCode: string, status: string, timespent?: number): Promise<JSON> {
    const statement = new Statement();
    statement.actor = { uuid: this.appDataService.getUser()['userId'] };
    statement.product = { uuid: this.courseDataService.getProductId() };
    statement.entities = [{
      verb: status,
      'item-code': itemCode,
      timestamp: Date.now(),
      timespent: timespent || 0
    }];
    return this.postExperienceStatement(statement);
  }

  public getLearningObjectiveQuestionProgress(itemCode: string): Promise<any> {
    const params = new URLSearchParams();
    params.set('userId', this.appDataService.getUser()['userId']);
    params.set('productId', this.courseDataService.getProductId());
    params.set('itemCode', itemCode);
    params.set('type', 'items');
    return this.http.get(environment.API_URL + 'analytics/learning-objective/progress', { search: params }).toPromise().then((res: any) => {
      return JSON.parse(res['_body']);
    }).catch(err => {
      console.error(err);
    });
  }

}


