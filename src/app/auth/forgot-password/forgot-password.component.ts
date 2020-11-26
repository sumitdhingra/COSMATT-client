import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';

import { AuthService } from '../../services/auth.service';
import { NgForm } from '@angular/forms';
import { User } from '../model/user.model';
import { AppDataService } from 'app/services/app-data.service';
import { ModalService } from '../../app-common/modal/modal.service';
import { environment } from 'environments/environment';
import { Angulartics2, Angulartics2GoogleAnalytics } from 'angulartics2';
import 'bugsnag-js';
import { ForgotPasswordMessages } from './forgot-password.messages.enum';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  @HostBinding('class') forgotPasswordClasses = 'forgot-password-page app';

  username: string;
  password: string;
  email: string;

  formStatus = {
    submitted: false,
    valid: true,
    errorMessage: '',
    response: {
      success: '',
      error: '',
      status: 'not_started'
    }
  };

  constructor(
    private authService: AuthService,
    public router: Router,
    public appDataService: AppDataService,
    private angulartics2GoogleAnalytics: Angulartics2GoogleAnalytics,
    private angulartics2: Angulartics2,
    private http: Http) { }

  ngOnInit() {
    this.username = '';
    this.password = '';
    this.appDataService.setPageTitle('Forgot Password');
    this.appDataService.gaPage = '/AUTH/FORGOT-PASSWORD';
    this.angulartics2GoogleAnalytics.pageTrack(this.appDataService.gaPage);
  }

  resetFormInfo(resetCredentials?: boolean) {
    this.formStatus = {
      submitted: false,
      valid: true,
      errorMessage: '',
      response: {
        success: '',
        error: '',
        status: 'not_started'
      }
    };
    if ( resetCredentials ) {
      this.username = '';
      this.email = '';
      this.password = '';
    }
  }

  onForgotPassword(forgotPasswordForm: NgForm) {
    this.resetFormInfo(false);
    if (forgotPasswordForm.invalid) {
      this.formStatus.valid = false;
      this.formStatus.errorMessage = ForgotPasswordMessages.EMPTY_EMAIL;
      return;
    }
    this.appDataService.screenLoader = true;
    this.formStatus.response.status = 'in_process';
    this.http.post(environment.API_URL + 'auth/forgot-password', {email: this.email})
        .toPromise()
        .then(res => {
          this.formStatus.response.status = 'completed';
          this.appDataService.screenLoader = false;
          this.formStatus.response.success = ForgotPasswordMessages.FORGOT_PASSWORD_SUCCESS.replace('<EMAIL_ADDRESS>', this.email);
          this.email = '';
        })
        .catch(err => {
          this.formStatus.response.status = 'completed';
          this.appDataService.screenLoader = false;

          if ( err.status === 400 ) {
            const errorMessage = JSON.parse(err._body)['message'];
            this.formStatus.response.error = errorMessage;
          } else {
            this.formStatus.response.error = ForgotPasswordMessages.FORGOT_PASSWORD_FAILED;
          }
        });
  }
}
