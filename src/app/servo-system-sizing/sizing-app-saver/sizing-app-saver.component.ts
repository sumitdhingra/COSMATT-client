import { Component, OnInit, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { SaveType } from 'app/servo-system-sizing/sizing-app-saver/save-type.enum';

declare const jQuery: any;

@Component({
  selector: 'app-sizing-app-saver',
  templateUrl: './sizing-app-saver.component.html',
  styleUrls: ['./sizing-app-saver.component.scss']
})
export class SizingAppSaverComponent implements OnInit {

  @Output() onSaveButtonClick = new EventEmitter<SaveType>();

  saveType = SaveType;
  $el: any;

  constructor(
    private domEle: ElementRef
  ) {
    this.$el = jQuery(this.domEle);
  }

  ngOnInit() {
  }

  onSaveButtonClickHandler(saveType: SaveType) {
    this.onSaveButtonClick.emit(saveType);
  }
}
