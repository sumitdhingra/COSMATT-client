import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[featureNotAvailable]'
})

export class FeatureNotAvailableDirective{
 
  domEle: ElementRef;
   $el: any;

  constructor(domEle: ElementRef) {
    this.domEle = domEle;
    this.$el = jQuery(domEle.nativeElement);

    this.$el.attr('data-placement', 'bottom');
    this.$el.attr('data-toggle', 'tooltip');
    this.$el.attr('title', 'Feature Not Available');
    this.$el.tooltip('show');

  }
}
