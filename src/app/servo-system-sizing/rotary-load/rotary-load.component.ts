import { Component, OnInit, Output, Input, EventEmitter, ViewChild } from '@angular/core';
import 'libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/js/unitComboBox.min';
import { ISizingComponent } from '../shared/interfaces/sizing-component.interface';
import { IComponentFormData, IComponentProfileElementData, IComponentFormValidationData } from '../shared/interfaces/sizing-component-output.interface';
import { RotaryLoadFormData } from './rotary-load-form-data.model';
import { SizingComponentType } from '../shared/models/sizing.enum';
import { ProfileElement, ProfileElementsCollection } from '../shared/models/profile-element-list.model';
import { AnalysisParams } from '../shared/models/analysis-params.model';
import { RotaryLoadCalculationsService } from './rotary-load-calculations.service';
import { ModalService } from 'app/app-common/modal/modal.service';
import { InertiaCalculatorSettings } from '../../app-common/inertia-calculator/inertia-calculator-settings.model';
import { IInertiaCalculatorOutput } from 'app/app-common/inertia-calculator/inertia-calculator-output.interface';
import { UnitComboboxComponent } from 'app/app-common/unit-combobox/unit-combobox.component';
import { WidgetType } from '../../directive/widgets-info.enum';

@Component({
  selector: 'app-rotary-load',
  templateUrl: './rotary-load.component.html',
  styleUrls: ['./rotary-load.component.scss']
})
export class RotaryLoadComponent implements OnInit, ISizingComponent {

  @ViewChild('loadInertia') private loadInertia: UnitComboboxComponent;

  @Output() formDataUpdateEvent = new EventEmitter<IComponentFormData>();
  @Output() formValidEvent = new EventEmitter<IComponentFormValidationData>();
  @Output() profileElementListUpdateEvent = new EventEmitter<IComponentProfileElementData>();

  @Input() rotaryLoadFormData: RotaryLoadFormData;
  @Input() profileElementCollection: ProfileElementsCollection;
  @Input() analysisParams: AnalysisParams;

  widgetType = WidgetType;

  constructor(
    private rotaryLoadCalculationsService: RotaryLoadCalculationsService,
    public modalService: ModalService
  ) {
  }

  ngOnInit() {
    // added to handle the case of an existing application. i.e. If form data is provided by axis
    if (this.rotaryLoadFormData) {
      this.performCalculations();
    }
  }

  public loadInertiaComboConfig(value?: any) {
    const self = this;
    return {
      "unitType": "INERTIA",
      "unit": 'kilogrammetersquare',
      "value": value ? value : this.rotaryLoadFormData.loadInertia,
      "comboBoxWidthRatio": {
        "textBox": "50%",
        "comboBox": "50%"
      },
      callBackFn: function () {
        const SIValue = this.SIValue;
        // to be reviewed: sumit sir & adnan - interferes first time with Angular lifecycle
        setTimeout(() => {
          if (self.rotaryLoadFormData.loadInertia !== this.SIValue) {
            self.rotaryLoadFormData.loadInertia = this.SIValue;
            self.emitUIDataChanged();
          }
          self.validateAndPerformCalculations();
        }, 0);
      }
    };
  }

  public frictionTorqueComboConfig() {
    const self = this;
    return {
      "unitType": "TORQUE",
      "unit": 'newtonmeter',
      "value": this.rotaryLoadFormData.frictionTorque,
      'comboBoxWidthRatio': {
        'textBox': '50%',
        'comboBox': '50%'
      },
      callBackFn: function () {
        const SIValue = this.SIValue;
        // to be reviewed: sumit sir & adnan - interferes first time with Angular lifecycle
        setTimeout(() => {
          if (self.rotaryLoadFormData.frictionTorque !== this.SIValue){
            self.rotaryLoadFormData.frictionTorque = this.SIValue;
            self.emitUIDataChanged();
          }
          self.validateAndPerformCalculations();
        }, 0);
      }
    };
  }

  public extTorqueComboConfig() {
    const self = this;
    return {
      'unitType': 'TORQUE',
      'unit': 'newtonmeter',
      'value': this.rotaryLoadFormData.externalTorque,
      'comboBoxWidthRatio': {
        'textBox': '50%',
        'comboBox': '50%'
      },
      callBackFn: function () {
        const SIValue = this.SIValue;
        // to be reviewed: sumit sir & adnan - interferes first time with Angular lifecycle
        setTimeout(() => {
          if (self.rotaryLoadFormData.externalTorque !== SIValue) {
            self.rotaryLoadFormData.externalTorque = SIValue;
            self.emitUIDataChanged();
          }
          self.validateAndPerformCalculations();
        }, 0);
      }
    };
  }

  private emitUIDataChanged(): void {
    this.formDataUpdateEvent.emit({ data: this.rotaryLoadFormData, sizingComponentType: SizingComponentType.RotaryLoad });
  }

  private validateAndPerformCalculations() {
    const isFormValid = this.validateForm();
    this.formValidEvent.emit({ isValid: isFormValid, sizingComponentType: SizingComponentType.RotaryLoad });
    this.performCalculations();
  }

  private performCalculations(): void {
    if (!this.profileElementCollection) {
      return;
    }
    if (this.validateForm() === false) {
      return;
    }

    this.rotaryLoadCalculationsService.calculateSegmentParams(this.rotaryLoadFormData, this.profileElementCollection);
    this.rotaryLoadCalculationsService.calculateAnalysisParams(this.rotaryLoadFormData, this.profileElementCollection, this.analysisParams);

    // emit results
    this.profileElementListUpdateEvent.emit({
      profileElementsCollection: this.profileElementCollection,
      sizingComponentType: SizingComponentType.RotaryLoad,
      analysisParams : this.analysisParams
    });
  }

  private validateForm(): boolean {
    let isValid = true;

    if (this.rotaryLoadFormData.loadInertia < 0
      || this.rotaryLoadFormData.frictionTorque < 0
      || this.rotaryLoadFormData.externalTorque < 0) {
      isValid = false;
    }

    return isValid;
  }

  /**
   * Implementing methods of WidgetLauncherDirective
   */
  onInertiaCalculatorOutput(outputJSON: IInertiaCalculatorOutput) {
    // Update value of comboBox
    this.loadInertia.setSIValue(outputJSON.totalInertia);
    // Post update operations
    if (this.rotaryLoadFormData.loadInertia !== outputJSON.totalInertia) {
      this.rotaryLoadFormData.loadInertia =  outputJSON.totalInertia;
      this.emitUIDataChanged();
    }
    this.validateAndPerformCalculations();
  }

  getInertiaCalculatorSettings() {
    return new InertiaCalculatorSettings().defaultSettings;
  }

  /**
   * Implementing methods of ISizingComponent
   */
  public getDisplayName() {
    return 'Rotary Load';
  }

  public getPageHeadingText() {
    return 'Add Load';
  }

  public getPageSubHeadingText() {
    return '';
  }

}
