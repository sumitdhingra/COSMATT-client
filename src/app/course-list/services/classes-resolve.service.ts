import { ClassesService } from './classes-service';
import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';

import { AppDataService, UserRole } from 'app/services/app-data.service';
import { AuthService } from 'app/services/auth.service';
@Injectable()
export class ClassesResolve implements Resolve<any> {

  constructor(private classesService: ClassesService,
    private router: Router, public appDataService: AppDataService,
    public authService: AuthService) { }

  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
    return this.classesService.getUserEnrolledClasses(this.appDataService.getUser()['userId']).then((classes: any) => {
      //setting Classes
      
      if((this.appDataService.getUserRole() === UserRole.Teacher)
       && (!classes || classes.count === 0 || (classes.entities && classes.entities.length === 0))){
        this.appDataService.loginErrorMessage = 'You are not enrolled in any class!';
        this.appDataService.deleteUser();
        this.router.navigate(['auth/login']);
        this.appDataService.screenLoader = false;
      }else{
        this.classesService.Classes = classes;
        return this.classesService.Classes;
      }
      
    }).catch((error) => {
      this.authService.logout()
        .catch(() => {
          console.log("Error in logging out");
        })
    });
  }
}
