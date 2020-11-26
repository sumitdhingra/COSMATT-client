import { Component, OnInit, ViewEncapsulation, Input, Output, ElementRef, AfterViewInit } from '@angular/core';
import 'libs-frontend-cosmatt/libs-frontend-cosmattPlugin/src/js/libs-frontend-CosmattPlugin';
import 'libs-frontend-cosmatt/libs-frontend-motionprofile/dist/js/motionProfile.min';
import { MotionProfileFormData } from './motion-profile-form-data.model';
import { ISizingComponent } from '../shared/interfaces/sizing-component.interface';
import { IComponentFormData, IComponentProfileElementData, IComponentFormValidationData } from '../shared/interfaces/sizing-component-output.interface';
import { SizingComponentType } from '../shared/models/sizing.enum';
import { EventEmitter } from '@angular/core';
import { MotionProfileDefaultSettings } from './motion-profile-default-settings.model';
import { ProfileElement, ProfileElementsCollection } from "../shared/models/profile-element-list.model";
import { AnalysisParams } from "../shared/models/analysis-params.model";
import { ProfileCalculationService } from "./profile-calculation.service";
import { AppDataService } from './../../services/app-data.service';

declare var $: any;

@Component({
  selector: 'app-motion-profile',
  templateUrl: './motion-profile.component.html',
  styleUrls: ['./motion-profile.component.scss',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitLabelControl/dist/css/unitLabelControl.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/css/unitComboBox.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-motionprofile/dist/css/motionProfile.min.css'
  ],
  encapsulation: ViewEncapsulation.None,
})
export class MotionProfileComponent implements OnInit, AfterViewInit, ISizingComponent {

  @Input() motionProfileFormData: MotionProfileFormData;
  @Output() formValidEvent = new EventEmitter<IComponentFormValidationData>();
  @Output() formDataUpdateEvent = new EventEmitter<IComponentFormData>();
  @Output() profileElementListUpdateEvent = new EventEmitter<IComponentProfileElementData>();

  widgetOptions;
  profileWidgetOutputData = {};
  profileElementCollection: ProfileElementsCollection;
  $el: any;

  constructor(public domEle: ElementRef, private profileCalculationService: ProfileCalculationService,
    private appDataService: AppDataService) {
  }

  ngOnInit() {
    //this.appDataService.screenLoader = false;
    this.$el = $(this.domEle.nativeElement);

    var motionProfileDefaultSettings = new MotionProfileDefaultSettings();

    if (this.motionProfileFormData) {
      motionProfileDefaultSettings['moveDistance'] = this.motionProfileFormData.moveDistance;
      motionProfileDefaultSettings['moveTime'] = this.motionProfileFormData.moveTime;
      motionProfileDefaultSettings['dwellTime'] = this.motionProfileFormData.dwellTime;
      motionProfileDefaultSettings['velocityFactor'] = this.motionProfileFormData.velocityFactor;
    }

    const defaultWidgetSettings = {
      type: 'motion-profile',
      options:
      {
        data:
        {
          notifyIOData: (data) => {
            // emits form data on data change by user 
            let isFormValid;
            const sendformDataUpdateEvent = this.createFormDataObjectFromWidgetData(data.inputs);
            if (sendformDataUpdateEvent === true) {
              this.formDataUpdateEvent.emit({ data: this.motionProfileFormData, sizingComponentType: SizingComponentType.MotionProfile });
            }
              isFormValid = this.validateForm();
              this.formValidEvent.emit({ isValid: isFormValid, sizingComponentType: SizingComponentType.MotionProfile });

            // emits updated elements collection data whenevr user changes data
            if (data.output !== undefined && isFormValid === true) {
              this.profileWidgetOutputData = data.output;
              this.performCalculations();
            }
          }
        }
      }
    };
    // this.widgetOptions = new WidgetDefaultSettings(defaultWidgetSettings);
    const cosmattWidgets = this.$el.find('.cosmatt-widget')[0];

    $.extend(defaultWidgetSettings.options.data, motionProfileDefaultSettings);

    $(cosmattWidgets).CosmattPlugin(defaultWidgetSettings);
  }

  private validateForm(): boolean {
    let isValid = true;

    if (this.motionProfileFormData.moveTime <= 0
      || this.motionProfileFormData.moveDistance <= 0
      || this.motionProfileFormData.velocityFactor < 1 || this.motionProfileFormData.velocityFactor > 2
      || this.motionProfileFormData.dwellTime < 0
    ) {
      isValid = false;
    }

    return isValid;
  }

  private performCalculations() {

    let profileElementsCollection = new ProfileElementsCollection();
    let analysisParams = new AnalysisParams();
    
    this.profileCalculationService.setProfileWidgetOutputData(this.profileWidgetOutputData);

    this.profileCalculationService.calculateSegmentParams(this.motionProfileFormData, profileElementsCollection);

    this.profileCalculationService.calculateAnalysisParams(this.motionProfileFormData, profileElementsCollection, analysisParams);

    this.profileElementListUpdateEvent.emit({
      profileElementsCollection: profileElementsCollection,
      sizingComponentType: SizingComponentType.MotionProfile,
      analysisParams
    });
  }

  // mapping function that maps Motion Profile Widget form inputs data to component's model object => MotionProfileFormData
  private createFormDataObjectFromWidgetData(formData): boolean {
    let sendformDataUpdateEvent = false;
    if (this.motionProfileFormData.moveDistance !== formData.moveDistance){
      this.motionProfileFormData.moveDistance = formData.moveDistance;
      sendformDataUpdateEvent = true;
    }
    if (this.motionProfileFormData.moveTime !== formData.moveTime){
      this.motionProfileFormData.moveTime = formData.moveTime;
      sendformDataUpdateEvent = true;
    }
    if (this.motionProfileFormData.dwellTime !== formData.dwellTime){
      this.motionProfileFormData.dwellTime = formData.dwellTime;
      sendformDataUpdateEvent = true;
    }
    if (this.motionProfileFormData.velocityFactor !== formData.velocityFactor){
      this.motionProfileFormData.velocityFactor = formData.velocityFactor;
      sendformDataUpdateEvent = true;
    }
    return sendformDataUpdateEvent;
  }

  getDisplayName() {
    return "Profile";
  }

  getPageHeadingText() {
    return "Create Your Profile";
  }

  getPageSubHeadingText() {
    return "";
  }
  ngAfterViewInit() {
    // const self = this;
    // setTimeout(function(){
    //   self.appDataService.screenLoader = false;
    // }, 0);
  }
}
