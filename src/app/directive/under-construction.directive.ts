import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appUnderConstruction]'
})
export class UnderConstructionDirective implements OnChanges {

  @Input('isEnabled') private isEnabled: boolean;

  private $element: any;
  private $underConstElement: any;

  constructor(
    private elementRef: ElementRef
  ) {
    this.$element = $(elementRef.nativeElement);
    this.$underConstElement = this.createDOMElement();
    if ( this.isEnabled ) {
      this.$underConstElement.css({'display': 'flex'});
    }
    this.$element.append(this.$underConstElement);
  }

  ngOnChanges() {
    if ( this.isEnabled ) {
      this.$underConstElement.css({'display': 'flex'});
    } else {
      this.$underConstElement.css({'display': 'none'});
    }
  }

  private createDOMElement(): any {
    const $outerDiv = $(`<div class='under-construction'></div>`);
    $outerDiv.css({
      'z-index': 1000,
      'background-color': '#9e9e9e',
      'height': '100%',
      'width': '100%',
      'opacity': '0.6',
      'left': 0,
      'top': 0,
      'font-size': '50px',
      'display': 'none',
      'justify-content': 'center',
      'position': 'absolute',
      'transition-property': 'background-color',
      'transition-duration': '1s',
      'cursor': 'not-allowed'
    });

    const $innerDiv = $('<div></div>');
    $innerDiv.text('Authoring in process');
    $innerDiv.css({
      'position': 'sticky',
      'top': '100px',
      'height': '60px',
      'margin-top': '50px',
      'color': '#4a4747'
    });

    $outerDiv.append($innerDiv);
    return $outerDiv;
  }

}
