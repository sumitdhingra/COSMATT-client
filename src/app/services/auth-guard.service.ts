import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { AppDataService } from '../services/app-data.service';

@Injectable()
export class AuthGuardService implements CanActivate { // TODO
  constructor(private authService: AuthService,
    private router: Router,
    private appDataService: AppDataService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
    return this.isAuthorized(state);
  }

  isAuthorized(state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    if (this.authService.isLoggedIn()) {
      return true;
    } else {
      this.authService.redirectUrl = url;
      // Navigate to the login page with extras
      this.router.navigate(['auth/login']);
      return false;
    }
  }
}
