import { Component, OnInit, EventEmitter, Output, ElementRef } from '@angular/core';
import { NgForm, ReactiveFormsModule, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { ModalService } from '../modal/modal.service';
import { matchOtherValidator } from '../validators/match-other-validator';
import { UpdateInteractionService } from '../../my-account/services/update-interaction.service';

declare let jQuery: any;

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  // Password form
  pwdForm: FormGroup;
  /**
   * Represents whether or not the user-settings component is loading
   * TODO -
   *    1. Make it generic so that multiple forms are supported
   */
  componentLoading = false;
  // Alerts for future use
  alerts = {
    currPassword : {
      message: '',
      type: 'info',
      visible: false
    },
    newPassword : {
      message: '',
      type: 'info',
      visible: false
    },
    confPassword : {
      message: '',
      type: 'info',
      visible: false
    },
    updateMessage: {
      message: '',
      type: 'info',
      visible: false
    }
  };

  // Password form field constants
  readonly MSG_PWD_SUCCESS = 'Password changed successfully. ';
  readonly MSG_PWD_FAILED = 'Password update failed. Please try again later. ';
  readonly MSG_PWD_OLD_MISMATCH = 'Old password is incorrect.';
  readonly MSG_PWD_INVALID_CHARS = 'Password can only be alphanumberic with !,@,#,$,& or _. ';
  readonly MSG_PWD_INVALID_LENGTH = 'Password must be between 8 to 15 chars. ';
  readonly MSG_PWD_MISMATCH = 'New password and confirm password fields do not match. ';
  readonly MSG_PWD_OLD_NEW_SAME = 'New password cannot be same as old password. ';
  readonly MSG_FIELDS_REQ = 'All fields are required ';
  // Password regex for fields
  readonly PASSWORD_REGEX = '^[\\w!@#$&]{8,15}$';


  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private udpateInteractionService: UpdateInteractionService,
    private el: ElementRef) {
   }

  ngOnInit() {
    this.initPasswordForm();
  }

  // Initiailizes fields of password form
  initPasswordForm(): void {
    // let that = this;
    this.pwdForm = this.fb.group({
      currPassword : ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
          Validators.pattern(this.PASSWORD_REGEX)
        ]
      ],
      newPassword : ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
          Validators.pattern(this.PASSWORD_REGEX)
        ]
      ],
      confPassword : ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(15),
          Validators.pattern(this.PASSWORD_REGEX),
          matchOtherValidator('newPassword', true)
        ]
      ]
    });
  }

  // Handler for password form
  onPwdFormSubmit(pwdForm: FormGroup) {
    if ( !this.pwdForm.errors && this.pwdForm.status !== 'INVALID' ) {
      // Initiate a password update request through interaction service
      this.udpateInteractionService
          .initRequestChangePassword({
            oldPassword: this.pwdForm.controls['currPassword'].value,
            newPassword: this.pwdForm.controls['newPassword'].value
          });

      // When password update request is in process, do the following -
      this.hideMessageAlert('updateMessage');
      this.componentLoading = true;
      this.disableFormControls();

      // When password update request is complete, do the following -
      this.udpateInteractionService
          .confirmChangePassword$.subscribe((result) => {
            if ( result === 'SUCCESS' ) {
              this.showMessageAlert('updateMessage', {message: this.MSG_PWD_SUCCESS, type: 'success'});
              this.resetFormFields();
            } else {
              const resultBody = result.message;
              if (resultBody.search('Incorrect email or password') > -1 ) {
                this.showMessageAlert('updateMessage', {message: this.MSG_PWD_OLD_MISMATCH, type: 'danger'});
              } else {
                this.showMessageAlert('updateMessage', {message: this.MSG_PWD_FAILED, type: 'danger'});
              }
            }
            this.componentLoading = false;
            this.enableFormControls();
          });
    } else {
      // this.showMessageAlert('updateMessage', {message: this.MSG_PWD_FAILED, type: 'danger'});
      const errors = this.getAllErrors(this.pwdForm);
      for ( const controlName of Object.keys(errors) ) {
        if ( errors[controlName].required ) {
          this.showMessageAlert('updateMessage', {message: this.MSG_FIELDS_REQ, type: 'warning'});
          break;
        } else if ( errors[controlName].minlength ) {
          this.showMessageAlert('updateMessage', {message: this.MSG_PWD_INVALID_LENGTH, type: 'warning'});
          break;
        } else if ( errors[controlName].pattern ) {
          this.showMessageAlert('updateMessage', {message: this.MSG_PWD_INVALID_CHARS, type: 'warning'});
          break;
        } else if ( errors[controlName].matchOther ) {
          this.showMessageAlert('updateMessage', {message: this.MSG_PWD_MISMATCH, type: 'warning'});
          break;
        }
      }
    }
  }

  /*
  * Helper functions
  */
  showMessageAlert(alertName: string, value: {[key: string]: string}) {
    this.alerts[alertName].message = value.message;
    this.alerts[alertName].type = value.type;
    this.alerts[alertName].visible = true;
  }

  getAllErrors(fg: FormGroup) {
    let errors = {};
    Object.keys(this.pwdForm.controls).forEach(key => {
      const error = this.pwdForm.controls[key].errors;
      if ( error ) { errors[key] = error; }
    });
    return Object.getOwnPropertyNames(errors).length === 0 ? null : errors;
  }

  hideMessageAlert(alertName) {
    this.alerts[alertName].visible = false;
  }

  disableFormControls() {
    Object.keys(this.pwdForm.controls).forEach((key, i) => {
      this.pwdForm.controls[key].disable();
    });
  }

  enableFormControls() {
    Object.keys(this.pwdForm.controls).forEach((key, i) => {
      this.pwdForm.controls[key].enable();
    });
  }

  resetFormFields() {
    Object.keys(this.pwdForm.controls).forEach((key, i) => {
      this.pwdForm.controls[key].reset();
    });
  }

}
