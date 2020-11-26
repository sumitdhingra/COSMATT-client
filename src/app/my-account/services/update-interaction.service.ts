import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';

@Injectable()
export class UpdateInteractionService {

  // Subjects to change password
  private requestChangePassword = new Subject<any>();
  private confirmChangePassword = new Subject<any>();

  // Observable streams for password change
  public requestChangePassword$ = this.requestChangePassword.asObservable();
  public confirmChangePassword$ = this.confirmChangePassword.asObservable();

  // Called when a component requests a password change
  initRequestChangePassword(passwords: {[key: string]: string}) {
    this.requestChangePassword.next(passwords);
  }
  // Called when password change request has been completed
  initConfirmChangePassword(result: any) {
    this.confirmChangePassword.next(result);
  }

  constructor() { }

}
