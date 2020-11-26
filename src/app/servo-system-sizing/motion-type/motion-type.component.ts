import { AppDataService } from './../../services/app-data.service';
import { Axis } from './../axis/axis.model';
import { ISizingComponent } from './../shared/interfaces/sizing-component.interface';
import { MotionType, MotionTypeElement, SizingComponentType } from './../shared/models/sizing.enum';
import { Component, OnDestroy, OnInit, Output, EventEmitter, Input, ElementRef, AfterViewInit, TemplateRef } from '@angular/core';
import { MotionTypeClass } from './motion-type.model';
import {
  IComponentMotionTypeOutputData, IComponentFormData, IComponentFormValidationData,
  IComponentProfileElementData
} from '../shared/interfaces/sizing-component-output.interface';
import { MotionTypeFormData } from 'app/servo-system-sizing/motion-type/motion-type-form-data.model';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { ModalService } from '../../app-common/modal/modal.service';

@Component({
  selector: 'app-motion-type',
  templateUrl: './motion-type.component.html',
  styleUrls: ['./motion-type.component.scss']
})
export class MotionTypeComponent implements OnInit, OnDestroy, AfterViewInit, ISizingComponent {
  @Output() formDataUpdateEvent = new EventEmitter<IComponentFormData>();
  @Output() formValidEvent= new EventEmitter<IComponentFormValidationData>();
  @Output() profileElementListUpdateEvent = new EventEmitter<IComponentProfileElementData>();
  @Output() proceedToNextEvent = new EventEmitter();
  
  MotionType = MotionType; // ENUM
  motionsArr = [];
  // @Output() setMotionTypeEvent = new EventEmitter<IComponentMotionTypeOutputData>();
  selectedMotionType = '';
  modalRef: BsModalRef;
  modalmessage: string;
  currentSelection= '';
  nextSelection= '';
  @Input() motionTypeFormData: MotionTypeFormData;
  $el: any;
  constructor(public domEle: ElementRef, private modalService: BsModalService,
    public comingSoonService: ModalService,
    private appDataService: AppDataService) { }

  ngOnInit() {
    this.$el = $(this.domEle.nativeElement);
    // create motion object by initializing the MotionTypeClass.
    for (const motionType in MotionType) {
      if (MotionType.hasOwnProperty(motionType)) {
        const motion = new MotionTypeClass();
        // hard coded data for motion type model, need to move somewhere else.
        if (motionType.toLowerCase() === MotionType.Rotary.toLowerCase()) {
          motion.name = MotionTypeElement.Rotary.name;
          motion.type = MotionType.Rotary;
          motion.description = MotionTypeElement.Rotary.description;

        } else if (motionType.toLowerCase() === MotionType.Linear.toLowerCase()) {
          motion.name = MotionTypeElement.Linear.name;
          motion.type = MotionType.Linear;
          motion.description = MotionTypeElement.Linear.description;

        } else {
          // default handling
        }
        this.motionsArr.push(motion);
      }


    }
    // if(this.motionTypeFormData) {
    //   this.selectedMotionType = this.motionTypeFormData.selectedMotionType;
    // }
  }

  getDisplayName(): string {
    throw new Error('Method not implemented.');
  }
  getPageHeadingText(): string {
    throw new Error('Method not implemented.');
  }
  getPageSubHeadingText(): string {
    throw new Error('Method not implemented.');
  }

  setMotionType(event, template) {
    this.selectedMotionType = event.currentTarget.getAttribute('id');
    // Remove this code once Sizing app support linear motion.
    if (this.selectedMotionType === MotionType.Linear) {
      this.comingSoonService.open();
      return 0;
    }
    if (this.motionTypeFormData.selectedMotionType !== this.selectedMotionType) {
      if (this.motionTypeFormData.selectedMotionType === undefined || this.motionTypeFormData.selectedMotionType === "") {
        this.motionTypeFormData.selectedMotionType = this.selectedMotionType;
        this.emitAxisEvents();
        this.appDataService.screenLoader = true;
        this.proceedToNextEvent.emit();
      } else {
        if (this.selectedMotionType === MotionType.Rotary) {
          this.currentSelection = MotionTypeElement.Linear.name;
        } else {
          this.currentSelection = MotionTypeElement.Rotary.name;
        }
        this.openModal(template);
      }
    }else {
        // this.motionTypeFormData.selectedMotionType = this.selectedMotionType;
        // this.emitAxisEvents();
        this.appDataService.screenLoader = true;
        this.proceedToNextEvent.emit();
    }
  }

  emitAxisEvents() {

    this.updateBorderCSS();
    this.formDataUpdateEvent.emit({ data: this.motionTypeFormData, sizingComponentType: SizingComponentType.MotionType });

    const isFormValid = this.validateForm();
    this.formValidEvent.emit({ isValid: isFormValid, sizingComponentType: SizingComponentType.MotionType });
  }

  validateForm(): boolean {
    if (this.motionTypeFormData.selectedMotionType === MotionType.Rotary
      || this.motionTypeFormData.selectedMotionType === MotionType.Linear) {
      return true;
    } else {
      return false;
    }

  }

  updateBorderCSS() {

    // let motionTypeElement = this.$el.find('#' + this.selectedMotionType)[0];
    const selectedMotionTypeElement = this.$el.find('.selected-motion-type')[0];

    if (selectedMotionTypeElement) {
      $(selectedMotionTypeElement).removeClass('selected-motion-type');
    }

    const motionTypeElement = this.$el.find('#' + this.motionTypeFormData.selectedMotionType)[0];
      $(motionTypeElement).addClass('selected-motion-type')
  }

  ngAfterViewInit() {
    if (this.motionTypeFormData.selectedMotionType !== '' ) {
      this.updateBorderCSS();
    }
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }

  confirm(motionType): void {
    this.modalmessage = 'Confirmed!';
    this.modalRef.hide();
    this.motionTypeFormData.selectedMotionType = this.selectedMotionType;
    this.emitAxisEvents();
  }

  decline(): void {
    this.modalmessage = 'Declined!';
    this.modalRef.hide();
  }
  ngOnDestroy() {
    const self = this;
    setTimeout(function(){
      self.appDataService.screenLoader = false;
    }, 0);
  }
}
