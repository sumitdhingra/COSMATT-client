import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { FetchUserDetailsService } from './fetch-user-details.service';

@Injectable()
export class MyAccountResolverService implements Resolve<any> {

  constructor(private userDetailsService: FetchUserDetailsService) { }

  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
    return this.userDetailsService.getDetails();
  }
}
