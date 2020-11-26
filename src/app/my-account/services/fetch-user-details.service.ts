import { Injectable } from '@angular/core';

import { AppDataService } from '../../services/app-data.service';
import { GravatarService } from './gravatar.service';
/*
 * Service to fetch user details -
 * 1. userBasics - Basic user details:
 *      a. name
 *      b. email
 *      c. id
 * 2. userDetails - Personal user details:
 *      a. contactNumber
 *      b. jobTitle
 *      c. location
 *      d. companyName
 *      e. personalWebsite
 * 3. subscriptionDetails - User's subscription details: (TBD)
**/

@Injectable()
export class FetchUserDetailsService {

  userInfo = {
    userBasics : undefined,
    userDetails : undefined,
    subscriptionDetails : undefined
  };

  constructor(
    private appDataService: AppDataService,
    private gravatarService: GravatarService
  ) { }

  getDetails(): any {
    this.userInfo.userBasics = this.appDataService.getUser();
    /**
     * TODO -
     * Update the userDetails object when there is support from DLS
     */
    this.userInfo.userDetails = Object.assign({}, {
      gravatarPictureUrl: this.gravatarService.getGravatarUrl(this.userInfo.userBasics.email, '100')
    });
    return this.userInfo;
  }

}
