import { Component, OnInit, ElementRef } from '@angular/core';
/**
 * To use ModalComponent inject the ModalService in the the component
 * and call modalService.open() onClick
 */
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {
  $el: any
  constructor(el: ElementRef) {
    this.$el = jQuery(el.nativeElement);
  }

  ngOnInit() {
  }

  show() {
    this.$el.find('#appModal').modal('show');
  }
}
