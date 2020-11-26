import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { User } from '../model/user.model';
import { AppDataService, AppMode, UserRole } from 'app/services/app-data.service';
import { ModalService } from '../../app-common/modal/modal.service';
import { environment } from 'environments/environment';
import { Angulartics2, Angulartics2GoogleAnalytics } from 'angulartics2';
import 'bugsnag-js';
import { CourseRedirectService } from 'app/services/course-redirect.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @HostBinding('class') loginClasses = 'login-page app';

  year = new Date().getFullYear();
  username: string;
  password: string;
  rememberMe: boolean;
  org: string;
  invalidCredentials = false;
  formSubmitted = false;
  userModel: User;
  constructor(
    private authService: AuthService,
    public router: Router,
    public appDataService: AppDataService,
    public modalService: ModalService,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private angulartics2: Angulartics2,
    private courseRedirectService: CourseRedirectService) { }

  ngOnInit() {
    this.appDataService.appMode = AppMode.None;
    this.password = '';
    this.username = '';
    this.password = '';
    this.rememberMe = false;
    this.appDataService.loginErrorMessage = '';
    this.appDataService.setPageTitle('COSMATT - Login');
    this.appDataService.gaPage = '/AUTH/LOGIN';
    this.angulartics2GoogleAnalytics.pageTrack(this.appDataService.gaPage);
  }

  onLogin(loginForm: NgForm) {
    this.formSubmitted = true;
    // Handle invalid login form
    if (loginForm.invalid) {
      this.invalidCredentials = true;
      this.appDataService.loginErrorMessage = 'Empty email or password!';
      return;
    }
    // Otherwise, if form is good
    this.appDataService.screenLoader = true;
    this.appDataService.gaEventTrack('LOGIN');

    // Hit API for login
    this.authService.login(this.username, this.password)
      .then((user) => {
        return this.authService.registerUser(user, this.rememberMe);
      }).then((response)=>{
        if (this.appDataService.skipCourseHomePage) {	
          this.courseRedirectService.redirectOnUserRoleBasis().catch((error) => {	
            console.error(error);	
          });	
        } else {	
          this.router.navigate([this.authService.redirectUrl]);	
        }
      })
      .catch(error => {
        this.invalidCredentials = true;
        this.appDataService.screenLoader = false;	
        this.appDataService.loginErrorMessage = 'Invalid email or password!';	
        console.log(error);
        //Bugsnag.notifyException(error);
      });
  }

  onSignUp() {
    this.authService.signUp();
  }
  socialSignIn(value: string) {
    this.authService.socialSignIn(value);
  }
  onForgotPassword() {
    this.authService.forgotPassword();
  }
}
