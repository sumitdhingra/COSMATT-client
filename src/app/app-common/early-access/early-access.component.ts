import { Component, OnInit, ElementRef, AfterViewInit, ViewEncapsulation } from '@angular/core';

import { environment } from '../../../environments/environment';

declare const jQuery: any;

@Component({
  selector: 'app-early-access-modal',
  templateUrl: './early-access.component.html',
  styleUrls: [
    '../../../assets/early_access/css/custom_theme.css',
    './early-access.component.scss'
  ],
  encapsulation: ViewEncapsulation.Emulated
})
export class EarlyAccessComponent implements OnInit, AfterViewInit {
  $el: any;
  constructor(el: ElementRef) {
    this.$el = jQuery(el.nativeElement);
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    jQuery.getScript('assets/early_access/js/main.js');
    jQuery.getScript('https://www.google.com/recaptcha/api.js');
  }

  public show() {
    this.$el.find('#earlyAccessModel').modal({focus: true, show: true});
  }
}
