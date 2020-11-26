import { Component, OnInit, Input, AfterViewInit, ElementRef } from '@angular/core';
import { NgForm, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ModalService } from '../modal/modal.service';

declare let jQuery: any;

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {
  @Input('user-info') _userInfo: any;
  userInfo: any;
  prsnlForm: FormGroup;
  hideGravImage: boolean;

  readonly GRAV_DEFAULT_URL = 'https://s.gravatar.com/avatar/f003d954e39a3b95cd7c2913823972d7?s=100';

  constructor(
    private fb: FormBuilder,
    private el: ElementRef,
    private modalService: ModalService) {
  }

  ngOnInit() {
    this.userInfo = this._userInfo;
    this.initForm();

    if ( this.userInfo.userDetails.gravatarPictureUrl === this.GRAV_DEFAULT_URL ) {
      this.hideGravImage = true;
    }
  }

  onUpdate(prsnlForm: any) {
    this.modalService.open();
  }

  onImageUpdate() {
    this.modalService.open();
  }

  initForm(): void {
    let firstNameVal = '';
    let lastNameVal = '';
    let fullName = this.userInfo.userBasics.name ? this.userInfo.userBasics.name : '';

    if ( fullName.length > 0 ) {
      const firstSpaceIndex = fullName.search(' ');
      firstNameVal = firstSpaceIndex > -1 ? fullName.substr(0, firstSpaceIndex) : '';
      lastNameVal = firstSpaceIndex > -1 ? fullName.substr(firstSpaceIndex + 1, fullName.length) : '';
    }

    this.prsnlForm = this.fb.group({
      firstName: [
        {value: firstNameVal, disabled: true}, [
          Validators.required,
          Validators.pattern('^([a-zA-Z]+\s{1})+|([a-zA-Z])+$')
        ]
      ],
      lastName: [
        {value: lastNameVal, disabled: true}, [
          Validators.required,
          Validators.pattern('^([a-zA-Z]+\s{1})+|([a-zA-Z])+$')
        ]
      ],
      email: [
       { value: this.userInfo.userBasics.email ? this.userInfo.userBasics.email : 'NO_EMAIL', disabled: true}, [
          Validators.required,
        ]
      ],
      countryCode: [
        { value: this.userInfo.userDetails.countryCode ? this.userInfo.contactDetails.countryCode : '', disabled: true},
        [
          Validators.pattern('^([+]?\\d{1,3}[.-\\s]?)$')
          // Validators.pattern(/^((\+?\d{1,3})|(\d{1,4}))$/gm)
        ]
      ],
      contactNumber: [
        { value: this.userInfo.userDetails.contactNumber ? this.userInfo.userDetails.contactNumber : '', disabled: true},
        [
          Validators.minLength(10),
          Validators.maxLength(10)
        ]
      ]
      // ,
      // jobTitle: [
      //   this.userDetails.jobTitle ? this.userDetails.jobTitle : ''
      // ],
      // location: [
      //   this.userDetails.location ? this.userDetails.location : ''
      // ],
      // companyName: [
      //   this.userDetails.companyName ? this.userDetails.companyName : ''
      // ],
      // personalWebsite: [
      //   this.userDetails.personalWebsite ? this.userDetails.personalWebsite : ''
      // ]
    });
  }

  ngAfterViewInit(): void {
    jQuery(this.el.nativeElement).find('[data-toggle="tooltip"]').tooltip();
  }

}
