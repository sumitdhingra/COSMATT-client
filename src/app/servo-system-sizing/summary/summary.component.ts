import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProfileElementsCollection } from 'app/servo-system-sizing/shared/models/profile-element-list.model';
import { AnalysisParams } from 'app/servo-system-sizing/shared/models/analysis-params.model';
import { ComponentsValidityStatus } from '../axis/components-form-data.model';
import { SequencerService } from '../shared/services/sequencer.service';
import {
  SizingComponentTitle,
  SizingComponentType
} from 'app/servo-system-sizing/shared/models/sizing.enum';
import { SummaryDataModel, SolutionAnalysisAdditionalData } from 'app/servo-system-sizing/summary/summary-data.model';
import { IComponentFormValidationData } from 'app/servo-system-sizing/shared/interfaces/sizing-component-output.interface';
import { SaveType } from 'app/servo-system-sizing/sizing-app-saver/save-type.enum';
import { SolutionAnalysisCalculationsService } from '../solution-analysis/solution-analysis-calculations.service';
import { ModalService } from 'app/app-common/modal/modal.service';
declare const Cosmatt: any;
declare const COSMATT: any;

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {
  @Input() formData: any;
  @Input() profileElementCollection: ProfileElementsCollection;
  @Input() analysisParams: AnalysisParams;
  @Input() validityStatus: ComponentsValidityStatus;
  @Output() formValidEvent = new EventEmitter<IComponentFormValidationData>();
  @Output() onSaveButtonClick =  new EventEmitter<SaveType>();

  solutionAnalysisMotorData:any;
  saveType = SaveType;
  summaryComponentlist = SummaryDataModel;
  solutionAnalysisRequirements = SolutionAnalysisAdditionalData.applicationTSRequirement;
  solutionAnalysisEnvironmental = SolutionAnalysisAdditionalData.EnvironmentFactors;
  numberFormatter: any;
  constructor(private sequencerService: SequencerService,
    private solutionAnalysisCalculationsService: SolutionAnalysisCalculationsService,
    public comingSoonService: ModalService ) {
    this.numberFormatter = new Cosmatt.NumberFormatter();
  }

  ngOnInit() {
    this.solutionAnalysisMotorData = this.solutionAnalysisCalculationsService.solutionAnalysisMotorData;

    for (let index = 0; index < this.summaryComponentlist.length; index++) {

      const summaryElement = this.summaryComponentlist[index];
      const componentFormData = this.formData[summaryElement.id];
      let propertyList = this.summaryComponentlist[index].propertyList;

      for (let list = 0; list < propertyList.length; list++) {
        if (summaryElement.id === SizingComponentType.SolutionAnalysis) {
          propertyList[list].value = this.solutionAnalysisMotorData[propertyList[list].id];
        }else {
          propertyList[list].value = componentFormData[propertyList[list].id];
           
          
          if (summaryElement.id === SizingComponentType.MotionType){
            propertyList[list].value = this.toCamelCase(propertyList[list].value.toString()) + ' Motion';
           }
           if (summaryElement.id === SizingComponentType.MotionProfile && propertyList[list].id === 'moveDistance'){
            propertyList[list].value = COSMATT.UNITCONVERTER.getUnitConvertedValue('ANGULARDISTANCE',propertyList[list].value, 'radian', 'revolution')
           }
           
        }
      }
    }

    for (let list = 0; list < this.solutionAnalysisRequirements.length; list++) {
      this.solutionAnalysisRequirements[list].value.loadSide = this.analysisParams[this.solutionAnalysisRequirements[list].id];
      this.solutionAnalysisRequirements[list].value.motorSide = this.solutionAnalysisMotorData[this.solutionAnalysisRequirements[list].id+'MotorSide'];
    }

    for (let list = 0; list < this.solutionAnalysisEnvironmental.length; list++) {
      this.solutionAnalysisEnvironmental[list].value = this.solutionAnalysisMotorData[this.solutionAnalysisEnvironmental[list].id];
    }

    //COSMATT-1754
    //const isValid = this.isFormValid();
    //this.validityStatus[SizingComponentType.Summary] = true;
    // setTimeout(() => {
    //   //this.formValidEvent.emit({ isValid: isValid, sizingComponentType: SizingComponentType.Summary });
    // }, 0);

  }
  /**
   * Implementing methods of ISizingComponent
   */
  toCamelCase(str: string) {
    if (str.length > 0) {
      return str.toLowerCase().replace(/(?:(^.)|(\s+.))/g, function(match) {
        return match.charAt(match.length - 1).toUpperCase();
      });
    }
  }

  onPrintClick(){
    //window.print();
    this.comingSoonService.open();
  }

  onSaveBtn(saveType: SaveType) {
     
    this.onSaveButtonClick.emit(saveType);
  }
  
  //COSMATT-1754
  // isFormValid(): boolean{
  //   let isValid = true;
  //   for (let index = 0; index < this.sequencerService.sizingComponentsSequence.length-1; index++) {
  //       isValid = this.validityStatus[this.sequencerService.sizingComponentsSequence[index]];
  //       if (!isValid) {
  //         break;
  //       }
  //   }
  //   return isValid;
  // }

  formatter(value) {
    return this.numberFormatter.format(value);
  }

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
