import { Component, OnInit, ViewEncapsulation, Input, Output, ElementRef, OnDestroy } from '@angular/core';
import 'libs-frontend-cosmatt/libs-frontend-cosmattPlugin/src/js/libs-frontend-CosmattPlugin';
import 'libs-frontend-cosmatt/libs-frontend-TSCurve/src/js/libs-frontend-TSCurve';
import 'libs-frontend-cosmatt/libs-frontend-unitcombobox/src/js/unitComboBox';
import { SolutionAnalysisFormData } from './solution-analysis-form-data.model';
import { ISizingComponent } from '../shared/interfaces/sizing-component.interface';
import { IComponentFormData, IComponentProfileElementData, IComponentFormValidationData } from '../shared/interfaces/sizing-component-output.interface';
import { SizingComponentType } from '../shared/models/sizing.enum';
import { EventEmitter } from '@angular/core';
import { SolutionAnalysisDefaultSettings } from './solution-analysis-default-settings.model';
import { ProfileElement, ProfileElementsCollection } from "../shared/models/profile-element-list.model";
import { AnalysisParams } from '../shared/models/analysis-params.model';
import { TransmissionFormData } from 'app/servo-system-sizing/transmission/transmission-form-data.model';
import { SolutionAnalysisCalculationsService } from './solution-analysis-calculations.service';

import 'libs-frontend-cosmatt/libs-frontend-unitLabelControl/dist/js/unitLabelControl.min';


@Component({
  selector: 'app-solution-analysis',
  templateUrl: './solution-analysis.component.html',
  styleUrls: ['./solution-analysis.component.scss',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitLabelControl/dist/css/unitLabelControl.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/css/unitComboBox.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-TSCurve/dist/css/tsCurve.min.css'],
  encapsulation: ViewEncapsulation.None,
})
export class SolutionAnalysisComponent implements OnInit, ISizingComponent,OnDestroy {
  @Input() solutionAnalysisFormData: SolutionAnalysisFormData;
  @Input() profileElementCollection: ProfileElementsCollection;
  @Input() analysisParams: AnalysisParams;
  @Input() transmissionFormData: TransmissionFormData;
  @Output() formDataUpdateEvent = new EventEmitter<IComponentFormData>();
  @Output() formValidEvent = new EventEmitter<IComponentFormValidationData>();
  @Output() profileElementListUpdateEvent = new EventEmitter<IComponentProfileElementData>();
  
  $el: any;
  widgetOptions: any = {
    disableControls: {}
  };
  pluginInstance;
  cosmattWidgets;
  constructor(public domEle: ElementRef, private solutionAnalysisCalculationsService: SolutionAnalysisCalculationsService) { }
  ngOnDestroy() {
    $(this.pluginInstance.ref).detach();
    $(this.cosmattWidgets).detach();
    this.pluginInstance = null;
  }
  ngOnInit() {
    this.$el = $(this.domEle.nativeElement);

    if(this.analysisParams !== undefined){
      this.widgetOptions.peakPoints = [this.analysisParams.peakSpeed, this.analysisParams.peakTorque];
      this.widgetOptions.rmsPoints = [this.analysisParams.peakSpeed, this.analysisParams.rmsTorque];
      this.widgetOptions.peakAcceData = this.analysisParams.peakAcceleration;
      this.widgetOptions.rmsAcceData = this.analysisParams.rmsAcceleration;
    }
    this.widgetOptions.transmissionRaioVal = this.transmissionFormData.transmissionRatio;

    this.widgetOptions.showApplicationPoints = true;
    this.widgetOptions.openAppReqPanel = true;
    this.widgetOptions.disableControls.peakTorqueTextBox = true;
    this.widgetOptions.disableControls.rmsTorqueTextBox = true;
    this.widgetOptions.disableControls.peakSpeedTextBox = true;
    this.widgetOptions.disableControls.peakAcceleration = true;
    this.widgetOptions.disableControls.rmsAcceleration = true;
    this.widgetOptions.disableControls.transmRatioTextBox = false;
    this.widgetOptions.disableControls.transmRatioSlider = false;

    if (this.solutionAnalysisFormData) {
      this.widgetOptions.temperature = this.solutionAnalysisFormData.temperature;
      this.widgetOptions.altitude = this.solutionAnalysisFormData.altitude;
      this.widgetOptions.motorSelectedIndex = this.solutionAnalysisFormData.motorIndex;

    }

    const defaultWidgetSettings = {
      type: 'ts-curve',
      options:
      {
        data:
        {
          notifyIOData: (data) => {

            // emits form data on data change by user 
            this.createFormDataObjectFromWidgetData(data.inputs);
            setTimeout(() => {
              this.formDataUpdateEvent.emit({ data: this.solutionAnalysisFormData, sizingComponentType:
              SizingComponentType.SolutionAnalysis });
              this.solutionAnalysisCalculationsService.updateSolutionAnalysisMotorData(data.output);
              const isFormValid = this.validateForm(data.output.motorStatus);
              this.formValidEvent.emit({ isValid: isFormValid, sizingComponentType: SizingComponentType.SolutionAnalysis });
              if (data.output !== undefined) {
                this.performCalculations(data.output.motorInertia);
              }
            }, 0);
          }
        }
      }
    };


    this.cosmattWidgets = this.$el.find('.cosmatt-widget')[0];

    $.extend(defaultWidgetSettings.options.data, this.widgetOptions);
    this.pluginInstance = $(this.cosmattWidgets).CosmattPlugin(defaultWidgetSettings);
  }
  private createFormDataObjectFromWidgetData(formData) {


    this.solutionAnalysisFormData.temperature = formData.temperature;
    this.solutionAnalysisFormData.altitude = formData.altitude;
    this.solutionAnalysisFormData.motorIndex = (formData.motorIndex + 1);
    this.solutionAnalysisFormData.transmissionRatio = formData.transmissionRatio;
    this.transmissionFormData.transmissionRatio = formData.transmissionRatio;
  }
  private performCalculations(motorInertia) {

    if (!this.profileElementCollection) {
      return;
    }
    this.solutionAnalysisCalculationsService.setMotorInertia(motorInertia);
    this.solutionAnalysisCalculationsService.calculateSegmentParams(this.solutionAnalysisFormData, this.profileElementCollection);

    this.profileElementListUpdateEvent.emit({
      profileElementsCollection: this.profileElementCollection,
      sizingComponentType: SizingComponentType.SolutionAnalysis,
      analysisParams: this.analysisParams
    });
  }
  private validateForm(motorStatus): boolean {
    let isValid = true;

    if(motorStatus === false){
      isValid = false;
    }
    return isValid;
  }

  getDisplayName() {
    return 'T-S Widget';
  }

  getPageHeadingText() {
    return 'T-S Curve Widget';
  }

  getPageSubHeadingText() {
    return '';
  }
}
