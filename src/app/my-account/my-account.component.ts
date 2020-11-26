import { Component, OnInit, HostBinding, ElementRef, OnChanges, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AppDataService } from '../services/app-data.service';
import { UpdateUserDetailsService } from './services/update-user-details.service';
import { UpdateInteractionService } from './services/update-interaction.service';

declare const jQuery: any;

@Component({
  selector: 'app-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss']
})
export class MyAccountComponent implements OnInit, OnChanges {
  @HostBinding('class') myAccountClasses = 'my-account-page app';
  element$: any;
  currentTab: string;
  userInfo: any;

  constructor(
    elementRef: ElementRef,
    public appDataService: AppDataService,
    private activatedRoute: ActivatedRoute,
    private updateUserDetailsService: UpdateUserDetailsService,
    private updateInteractionService: UpdateInteractionService,
    private router: Router
  ) {
    this.element$ = jQuery(elementRef.nativeElement);
    this.currentTab = 'profileTab';

    this.updateInteractionService.requestChangePassword$.subscribe(
      (passwords) => {
        this.requestUserPasswordChange(passwords);
      }
    );
  }

  ngOnInit() {
    this.appDataService.setPageTitle('My Account');
    this.userInfo = this.activatedRoute.snapshot.data['userInfo'];
    // jQuery('html, body').css({
    //   'height': 'auto',
    //   'min-height': '100%'
    // });
    // console.log(this.userInfo);
    // window.addEventListener('hashchange', shiftWindow);
    // function load() { if (window.location.hash) shiftWindow(); }

    // const jEl = jQuery(this.elementRef.nativeElement);
    // jEl.find('.nav-link').each((i, elem) => {
    //   console.log(elem);
    //   elem.addEventListener('click', e => {shiftWindow(); return false;} );
    //   // elem.on('click', e => shiftWindow);
    // });
    // // Select all links with hashes
    // jQuery('a[href*="my-account#"]')
    // .click(function(event) {
    //   // On-page links
    //   if (
    //     location.pathname.replace(/^\//, '') === this.pathname.replace(/^\//, '')
    //     &&
    //     location.hostname === this.hostname
    //   ) {
    //     // Figure out element to scroll to
    //     let target = jQuery(this.hash);
    //     target = target.length ? target : jQuery('[name=' + this.hash.slice(1) + ']');
    //     console.log(target);
    //     // Does a scroll target exist?
    //     if (target.length) {
    //       // Only prevent default if animation is actually gonna happen
    //       event.preventDefault();
    //       jQuery('html, body').animate({
    //         scrollTop: target.offset().top
    //       }, 1000, function() {
    //         // Callback after animation
    //         // Must change focus!
    //         console.log('Animation done');
    //         let $target = jQuery(target);
    //         $target.focus();
    //         if ($target.is(':focus')) { // Checking if the target was focused
    //           return false;
    //         } else {
    //           $target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
    //           $target.focus(); // Set focus again
    //         };
    //       });
    //     }
    //   }
    // });
  }

  shiftWindow(): void {
    window.scrollBy(0, -50);
    // console.log('Shifting window...');
  };

  ngOnChanges() {
    console.log('Change');
  }

  onClickBackBtn() {
    const backUrl = this.appDataService.previousUrl ? this.appDataService.previousUrl : './courses';
    this.router.navigate([backUrl], { relativeTo: this.activatedRoute });
  }

  requestUserPasswordChange(passwords: {[key: string]: any}) {
    this.updateUserDetailsService
      .updateUserPassword(passwords.oldPassword, passwords.newPassword)
      .then((res) => {
        this.updateInteractionService.initConfirmChangePassword(res);
      })
      .catch((err) => {
        this.updateInteractionService.initConfirmChangePassword(err);
      });
  }

  switchSection(e: any) {
    this.currentTab = e.target.id;

    this.element$.find('.nav-link').each((i, elem) => jQuery(elem).removeClass('active'));
    jQuery(e.target).addClass('active');

    const target = document.getElementById(jQuery(e.target).attr('data-target'));
    jQuery('html, body').animate({
        scrollTop: jQuery(target).offset().top - 50
    }, 500);
    // this.shiftWindow();
  }

  update() {
    console.log('yes');
  }

}
