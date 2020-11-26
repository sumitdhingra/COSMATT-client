import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { environment } from '../../../environments/environment';
import { AppDataService } from '../../services/app-data.service';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class UpdateUserDetailsService {
  constructor(
    private http: Http,
    private appDataService: AppDataService,
    private authService: AuthService
  ) {

  }

  updateUserPassword(oldPassword: string, newPassword: string): Promise<any> {
    // const responseOnMismatch = {
    //   status: 'failed',
    //   message: 'New password fields donot match'
    // };

    // const responseOnSamePassword = {
    //   status: 'failed',
    //   message: 'Old and new password fields cannot be same'
    // };

    // const responseGeneric = {};
    // this.pwdChangeRequest.next(passwords);

    return this.authService.changePassword(oldPassword, newPassword);
  }

}
