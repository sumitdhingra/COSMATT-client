import { ModalService } from './../../app-common/modal/modal.service';
import { MotionType } from './../shared/models/sizing.enum';
import { Component, OnInit, SimpleChange, Input, Output, EventEmitter, HostListener, ElementRef  } from '@angular/core';
import { Axis } from './axis.model';
import { SizingComponentType, SizingComponentTitle, ComponentViewMode, SizingComponentHeader } from '../shared/models/sizing.enum';
import { ISizingComponent } from '../shared/interfaces/sizing-component.interface';
import { IComponentProfileElementData, IComponentFormData,
  IComponentFormValidationData } from '../shared/interfaces/sizing-component-output.interface';
import { SequencerService } from '../shared/services/sequencer.service';
import { RotaryLoadFormData } from '../rotary-load/rotary-load-form-data.model';
import { MotionProfileFormData } from '../motion-profile/motion-profile-form-data.model';
import { ComponentsProfileElementData } from './components-profile-element-data.model';
import { ComponentsAnalysisParamsData } from './components-analysis-params-data.model';
import { ProfileElementsCollection, ProfileElement } from '../shared/models/profile-element-list.model';
import { TransmissionFormData } from 'app/servo-system-sizing/transmission/transmission-form-data.model';
import { SolutionAnalysisFormData } from 'app/servo-system-sizing/solution-analysis/solution-analysis-form-data.model';
import { AnalysisParams } from '../shared/models/analysis-params.model';
import { SideNavigatorService } from '../../app-common/side-navigator/side-navigator.service';
import { SaveToDiskService } from 'app/file-store/services/save-to-disk.service';
import { SaveType } from 'app/servo-system-sizing/sizing-app-saver/save-type.enum';
import { AppDataService } from 'app/services/app-data.service';
import { SizingAppDataService } from 'app/servo-system-sizing/shared/services/sizing-app-data.service';
import { MotionTypeFormData } from 'app/servo-system-sizing/motion-type/motion-type-form-data.model';

@Component({
  selector: 'app-axis',
  templateUrl: './axis.component.html',
  styleUrls: ['./axis.component.scss']
})
export class AxisComponent implements OnInit {
  @Input() axis: Axis;
  @Input() sideNavClosed = false;
  $el: any;
  showMotionEle = false;

  @Output() updateAxis = new EventEmitter<Axis>();
  // @Output() nextClick = new EventEmitter<Axis>();
  // @Output() previousClick = new EventEmitter<Axis>();

  // ENUMs need to redeclared to be used in html
  SizingComponentType = SizingComponentType;
  ComponentViewMode = ComponentViewMode;
  SizingComponentTitle = SizingComponentTitle;
  // dictionaries to store components data
  componentsProfileElementData: ComponentsProfileElementData;
  componentsAnalysisParamsData: ComponentsAnalysisParamsData;

  // tabular view data
  profileElements: ProfileElement[];

  // passed as input to current selected component
  private _profileElementCollection: ProfileElementsCollection;
  analysisParams: AnalysisParams;

  constructor(public sequencerService: SequencerService,
    public sideNavigatorService: SideNavigatorService,
    private saveToDiskService: SaveToDiskService,
    private appDataService: AppDataService,
    private sizingAppDataService: SizingAppDataService,
    public ElementRef: ElementRef,
    public comingSoonService: ModalService ) {
      this.$el = jQuery(ElementRef.nativeElement);
  }

  set profileElementCollection(value: ProfileElementsCollection) {
    if (!value) {
      return;
    }
    const clonedProfileElements = [];
    for (const profileElement of value.getAll()) {
      clonedProfileElements.push(Object.assign({}, profileElement));
    }
    this._profileElementCollection = new ProfileElementsCollection(clonedProfileElements);
  }
  get profileElementCollection(): ProfileElementsCollection {
    return this._profileElementCollection;
  }

  ngOnInit() {
    // set the sequence
    this.axis.sizingComponentsSequence = this.sequencerService.sizingComponentsSequence;
    // set the first component as the seclected component
    this.axis.selectedSizingComponent = this.sequencerService.sizingComponentsSequence[0];
    // initialize element and analysis data
    this.componentsProfileElementData = new ComponentsProfileElementData();
    this.componentsAnalysisParamsData = new ComponentsAnalysisParamsData();
    // initialize component form data

    if (!this.axis.componentsFormData.motionType) {
      this.axis.componentsFormData.motionType = new MotionTypeFormData();
    }
    if (!this.axis.componentsFormData.motionProfile) {
      this.axis.componentsFormData.motionProfile = new MotionProfileFormData();
    }
    if (!this.axis.componentsFormData.rotaryLoad) {
      this.axis.componentsFormData.rotaryLoad = new RotaryLoadFormData();
    }
    if (!this.axis.componentsFormData.transmission) {
      this.axis.componentsFormData.transmission = new TransmissionFormData();
    }
    if (!this.axis.componentsFormData.solutionAnalysis) {
      this.axis.componentsFormData.solutionAnalysis = new SolutionAnalysisFormData();
    }

    // Clear calulation data for all next component from MotionProfile on launch / reload.
    this.invalidateCalculations(SizingComponentType.MotionType);

    this.updateAxis.emit(this.axis);
    this.updateSideNavigator();
  }
  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) { 
   if (event.shiftKey === true && event.key === 'M' ){
    this.onMotionElementsKeyPress();
   }
  }

  onComponentFormDataUpdate(formData: IComponentFormData) {
    // update the form data of the selected component
    if (formData.sizingComponentType === SizingComponentType.MotionType){
      this.axis.motionType = formData.data.selectedMotionType;
    }

    this.axis.componentsFormData[formData.sizingComponentType] = formData.data;
    // invalidate the calculations of all the next components
    this.invalidateCalculations(formData.sizingComponentType);
    // inform the sizing app about the update
    this.updateAxis.emit(this.axis);
    this.updateSideNavigator();
  }

  onComponentProfileElementListUpdate(elementData: IComponentProfileElementData) {
    this.componentsProfileElementData[elementData.sizingComponentType] = elementData.profileElementsCollection;
    if (elementData.analysisParams) {
      this.componentsAnalysisParamsData[elementData.sizingComponentType] = elementData.analysisParams;
    }
  }

  onFormValidityChange(formData: IComponentFormValidationData) {
    this.axis.componentsValidityStatus[formData.sizingComponentType] = formData.isValid;
    this.updateAxis.emit(this.axis);
    this.updateSideNavigator();
  }

  nextSizingComponent(currentSizingComponent): string {
    for (let i = 0; i < this.axis.sizingComponentsSequence.length - 1; i++) {
      if (this.axis.sizingComponentsSequence[i] === currentSizingComponent) {
        return this.axis.sizingComponentsSequence[i + 1];
      }
    }
  }

  previousSizingComponent(currentSizingComponent): string {
    for (let i = this.axis.sizingComponentsSequence.length - 1; i > 0; i--) {
      if (this.axis.sizingComponentsSequence[i] === currentSizingComponent) {
        return this.axis.sizingComponentsSequence[i - 1];
      }
    }
  }
  get pageHeading() {
    return SizingComponentHeader[this.axis.selectedSizingComponent].heading;
  }

  get pageSubHeading() {
    return SizingComponentHeader[this.axis.selectedSizingComponent].subHeading;
  }

  setMotionType(event) {
    this.axis.motionType = event.motionType;
    this.axis.selectedSizingComponent = this.nextSizingComponent(this.axis.selectedSizingComponent);
    // this.nextClick.emit();
    this.updateSideNavigator();
  }

  onNextClick() {
    this.setSizingComponent(this.nextSizingComponent(this.axis.selectedSizingComponent));
    // inform the parent about the click so that sider navigator (and others) can update it's view
    // this.nextClick.emit();
    this.updateSideNavigator();
  }

  setSizingComponent(nextComponent) {
    // set form view always on next click
    this.axis.componentViewMode = ComponentViewMode.Form;
    // store the reference of current selected component
    const previousComponent = this.previousSizingComponent(nextComponent);
    // set the next component as the selected sizing component
    this.axis.selectedSizingComponent = nextComponent;
    // pass profileElementCollection of previous component to the next component
    this.profileElementCollection = this.componentsProfileElementData[previousComponent];
    // pass analysisParams of previous component to the next component
    this.analysisParams = this.componentsAnalysisParamsData[previousComponent];
  }

  onPreviousClick() {
    // set form view always on previous click
    this.axis.componentViewMode = ComponentViewMode.Form;
    this.axis.selectedSizingComponent = this.previousSizingComponent(this.axis.selectedSizingComponent);
    // this.previousClick.emit();
    this.updateSideNavigator();
  }

  onMotionElementsKeyPress() {
    // set the profile elements of current selected component
    this.profileElements = this.componentsProfileElementData[this.axis.selectedSizingComponent].getAll();
    // set the analysis params of current selected component
    this.analysisParams = this.componentsAnalysisParamsData[this.axis.selectedSizingComponent];
    // set the tabular mode
    this.axis.componentViewMode = ComponentViewMode.Tabular;
  }
  onMotionElementsClick() {
    // set the profile elements of current selected component
    this.profileElements = this.componentsProfileElementData[this.axis.selectedSizingComponent].getAll();
    this.showMotionEle = true;
    this.$el.find('#appModal').modal('show');
  }

  onMotionElementsBackClick() {
    this.axis.componentViewMode = ComponentViewMode.Form;
  }

  private invalidateCalculations(sizingComponent) {
    while (sizingComponent = this.nextSizingComponent(sizingComponent)) {
      this.componentsProfileElementData[sizingComponent].clear();
      // status of sizing element should not change.
      // this.axis.componentsValidityStatus[sizingComponent] = false;
    }
  }
  get isLastComponent(): boolean {
    const length = this.sequencerService.sizingComponentsSequence.length;
    const isLastComponent = this.axis.selectedSizingComponent === this.sequencerService.sizingComponentsSequence[length - 1];
    if (isLastComponent) {
      return true;
    }
    return false;
  }
  get isSecondLastComponent(): boolean {
    //const length = this.sequencerService.sizingComponentsSequence.length;
    // const isSecondLastComponent = this.axis.selectedSizingComponent === this.sequencerService.sizingComponentsSequence[length - 2];
    // if (isSecondLastComponent) {
    //   return true;
    // }
    //https://compro.atlassian.net/browse/COSMATT-2031-isSecondLastComponent is used for displaying View Summary in Navigation Header and Footer
    //Returning false always to remove the View Summary component in Navigation Header and Footer
    //Uncomment the lines 238-242 for showing View Summary again.
    return false;
  }
  get disableNext(): boolean {
    if (this.isLastComponent) {
      return true;
    }
    const isFormValid = this.axis.componentsValidityStatus[this.axis.selectedSizingComponent];
    // if form is valid and it's calculations exist
    if (isFormValid && this.axis.selectedSizingComponent === SizingComponentType.MotionType) {
      return false;
    }

    if (isFormValid && !this.componentsProfileElementData[this.axis.selectedSizingComponent].isEmpty()) {
      return false;
    }
    return true;
  }

  get disablePrevious(): boolean {
    return this.axis.selectedSizingComponent === this.sequencerService.sizingComponentsSequence[0];
  }

  public onSummaryClick(){
    // handling for summary
  }

  updateSideNavigator() {
    // setting up sidebar
    this.sideNavigatorService.setAxesData(this.axis.name, [this.axis] );
  }

  onSideNavigatorItemNameChanged(newAxisName) {
    // Update current axis name
    this.axis.name = newAxisName;
    // Updates local storage as well
    this.sizingAppDataService.saveAppData();
  }

  onSideNavigatorItemClicked(event) {
    this.setSizingComponent(event.id);
  }

  // Handle the saving of sizing app data
  onSaveButtonClickHandler(saveType: SaveType) {
    // SaveType can be SaveType.HardDisk or SaveType.GoogleDrive
    /**
     * TODO
     * 1. Handle the case of different save types.
     */
    if ( saveType === SaveType.HardDisk) {
      this.saveToDiskService.save(this.sizingAppDataService.name, this.appDataService.sizingApplicationJson);
    }
  }
  onPrintClick(event?:any){
    //window.print();
    this.comingSoonService.open();
  }
}
