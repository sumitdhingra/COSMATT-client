import { Injectable } from '@angular/core';
import { Request, XHRBackend, RequestOptions, Response, Http, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable'; // TODO
import { AppDataService } from './app-data.service';
import { Router } from '@angular/router';
import './rxjs-operators.service';

@Injectable()
export class ExtendedHttpService extends Http {
  private addAuthorization = true; // to control whether to add authorization header or not

  constructor(backend: XHRBackend, defaultOptions: RequestOptions, private appDataService: AppDataService, private router: Router) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    // withCredentials - null, true, false - if explicitly not set false then only don't set it
    if (url['withCredentials'] !== false) {
      url['withCredentials'] = true;
    }


    return super.request(url).catch(this.catchErrors());


    // if (url['withCredentials'] === false) {
    //   this.addAuthorization = false;
    // }
    // if (typeof url === 'string') {
    //   if (!options) {
    //     options = { headers: new Headers(), withCredentials: true };
    //   }
    //   this.setHeaders(options);
    // } else {
    //   this.setHeaders(url);
    // }
    // return super.request(url, options).catch(this.catchErrors());;



  }

  private catchErrors() {
    return (res: Response) => {
      if (res.status === 401 || res.status === 403) {
        this.appDataService.deleteUser();
        this.router.navigate(['auth/login']);
      }
      return Observable.throw(res);
    };
  }

  private setHeaders(objectToSetHeadersTo: Request | RequestOptionsArgs) {

    let access_token = this.appDataService.getUser()['token']['access_token'];
    if (access_token) {
      objectToSetHeadersTo.headers.set('Authorization', access_token);
    }

  }
}
