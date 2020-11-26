import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import 'libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/js/unitComboBox.min';
import { ISizingComponent } from '../shared/interfaces/sizing-component.interface';
import { IComponentFormData, IComponentProfileElementData, IComponentFormValidationData } from '../shared/interfaces/sizing-component-output.interface';
import { TransmissionFormData } from './transmission-form-data.model';
import { SizingComponentType } from '../shared/models/sizing.enum';
import { ProfileElement, ProfileElementsCollection } from '../shared/models/profile-element-list.model';
import { TransmissionCalculationService } from 'app/servo-system-sizing/transmission/transmission-calculation.service';
import { AnalysisParams } from 'app/servo-system-sizing/shared/models/analysis-params.model';

@Component({
  selector: 'app-transmission',
  templateUrl: './transmission.component.html',
  styleUrls: ['./transmission.component.scss']
})
export class TransmissionComponent implements OnInit, ISizingComponent {

  // Interface inputs
  @Input() transmissionFormData: TransmissionFormData;
  @Input() profileElementCollection: ProfileElementsCollection;
  @Input() analysisParams: AnalysisParams;

  // Interface implementations
  @Output() formDataUpdateEvent = new EventEmitter<IComponentFormData>();
  @Output() formValidEvent = new EventEmitter<IComponentFormValidationData>();
  @Output() profileElementListUpdateEvent = new EventEmitter<IComponentProfileElementData>();

  constructor(
    private transCalcService: TransmissionCalculationService
  ) {
  }

  ngOnInit() {
  }

  getComboBoxConfig(comboBoxName: string) {
    const self = this;
    switch (comboBoxName) {

      case 'transmissionEfficiency':
        return {
          unitType: 'PERCENTAGE',
          unit: 'percentage',
          value: this.transmissionFormData.transmissionEfficiency,
          comboBoxWidthRatio: {
            textBox: '50%',
            comboBox: '50%'
          },
          enable: {
            textBox: false,
            comboBox: false
          },
          callBackFn: function () {
            setTimeout(() => {
              if (self.transmissionFormData.transmissionEfficiency !== this.SIValue){
                self.transmissionFormData.transmissionEfficiency = this.SIValue;
                self.emitUIDataChanged();
              }
              self.handleDataChange();
            }, 0);
          }
        };

      case 'transmissionInertia':
        return {
          unitType: 'INERTIA',
          unit: 'kilogrammetersquare',
          value: this.transmissionFormData.transmissionInertia,
          comboBoxWidthRatio: {
            textBox: '50%',
            comboBox: '50%'
          },
          enable: {
            textBox: false,
            comboBox: false
          },
          callBackFn: function () {
            setTimeout(() => {
              if (self.transmissionFormData.transmissionInertia !== this.SIValue){
                self.transmissionFormData.transmissionInertia = this.SIValue;
                self.emitUIDataChanged();
              }
              self.handleDataChange();
            }, 0);
          }
        };
    }
  }

  private handleDataChange() {
    if ( this.isFormValid() ) {
      this.formValidEvent.emit({sizingComponentType: SizingComponentType.Transmission, isValid: true });
      this.performCalculations();
    } else {
      this.formValidEvent.emit({sizingComponentType: SizingComponentType.Transmission, isValid: false});
    }
  }

  private emitUIDataChanged() {
    this.formDataUpdateEvent.emit({ data: this.transmissionFormData, sizingComponentType: SizingComponentType.Transmission });
  }

  private getClonedProfileElementsCollection(profileElementsCollection: ProfileElementsCollection): ProfileElementsCollection {
    const clonedProfileElements = [];
    for ( const profileElement of profileElementsCollection.getAll() ) {
      clonedProfileElements.push(Object.assign({}, profileElement));
    };
    return new ProfileElementsCollection(clonedProfileElements);
  }

  private performCalculations() {
    // Cloning of objects to always modify the original data and not calculate on previous calculation
    // Create a new PE collection. Cannot do .assign() as it will not copy the prototype
    const clonedProfileElementsCollection = this.getClonedProfileElementsCollection(this.profileElementCollection);
    // Create a clone of analysisParams
    // const clonedAnalysisParams: AnalysisParams = Object.assign({}, this.analysisParams);

    // Calculate segment params
    this.transCalcService.calculateSegmentParams(this.transmissionFormData, clonedProfileElementsCollection);
    // Calculate analysis params
    const newAnalysisParams = this.transCalcService.calculateAnalysisParams(this.transmissionFormData, clonedProfileElementsCollection);

    const updateEventData: IComponentProfileElementData = {
      profileElementsCollection: clonedProfileElementsCollection,
      sizingComponentType: SizingComponentType.Transmission,
      analysisParams: newAnalysisParams
    };

    this.profileElementListUpdateEvent.emit(updateEventData);
  }

  private isFormValid(): boolean {
    const inertiaValid = this.transmissionFormData.transmissionInertia >= 0 && this.transmissionFormData.transmissionInertia < 10000;
    const ratioValid = this.transmissionFormData.transmissionRatio >= 1 && this.transmissionFormData.transmissionRatio <= 100;
    const efficiencyValid = this.transmissionFormData.transmissionEfficiency >= 1 && this.transmissionFormData.transmissionEfficiency <= 100;

    return inertiaValid && ratioValid && efficiencyValid;
  }

  handleRatioInput(e: any) {
    if (this.transmissionFormData.transmissionRatio !== +e) {
      this.transmissionFormData.transmissionRatio = +e;
      this.emitUIDataChanged();
    }
    this.handleDataChange();
  }

  getDisplayName() {
    return 'Transmission';
  }

  getPageHeadingText() {
    return 'Add Transmission';
  }

  getPageSubHeadingText() {
    return '';
  }

}
