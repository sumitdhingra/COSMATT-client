import { AppDataService } from './../../services/app-data.service';
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChange,
  ElementRef,
  ViewEncapsulation,
  AfterViewInit,
  ChangeDetectorRef,
  Output,
  EventEmitter,
  ViewContainerRef,
  ViewChild,
  ComponentRef,
  ComponentFactoryResolver,
  ApplicationRef,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import 'libs-frontend-cosmatt/libs-frontend-cosmattPlugin/src/js/libs-frontend-CosmattPlugin';
import 'libs-frontend-cosmatt/libs-frontend-unitLabelControl/dist/js/unitLabelControl.min';
import 'libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/js/unitComboBox.min';
import 'libs-frontend-cosmatt/libs-frontend-motionprofile/dist/js/motionProfile.min';
import 'libs-frontend-cosmatt/libs-frontend-TSCurve/dist/js/tsCurve.min';
import 'libs-frontend-cosmatt/libs-frontend-spreadsheetLeonardo/dist/spreadsheet-jquery-plugin';
// import 'libs-leonardo-core/libs-leonardo-player/dist/leonardoPlayer.jq.min';
import 'libs-frontend-cosmatt/libs-frontend-ICWidget/dist/static/js/app.js';
// import { MdViewerInjector } from 'app/app-common/md-viewer/md-viewer-injector.service';
import 'libs-frontend-cosmatt/libs-frontend-PLGraph/dist/js/plGraph.min.js';

import { AssessmentComponent } from 'app/app-common/assessment/assessment.component';
import { AssessmentSubType } from 'app/app-common/assessment/assessment-subtype.enum';
import { AssessmentType } from 'app/app-common/assessment/assessment-type.enum';
import { PopupService } from 'app/app-common/popup/popup.service';
import { PopupConfig } from 'app/app-common/popup/popup-config.model';
import { HostMode, ComponentType } from 'app/app-common/popup/popup-config.enum';
import { PopupInput } from 'app/app-common/popup/popup-input.model';
import { WidgetType, WidgetIcon, WidgetTitle } from '../../directive/widgets-info.enum';
import { InertiaCalculatorSettings } from '../inertia-calculator/inertia-calculator-settings.model';
import { AssessmentConfig } from '../assessment/assessment-config';
import { ProductService } from 'app/servo-system-course/services/product.service';


let marked = require('marked/lib/marked.js');
declare let MathJax: any;
declare let jQuery: any;

@Component({
  selector: 'app-md-viewer',
  templateUrl: './md-viewer.component.html',
  styleUrls: [
    './md-viewer.component.scss',
    // '../../../../node_modules/libs-leonardo-core/libs-leonardo-player/dist/leonardoPlayer.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-cosmattPlugin/src/css/libs-frontend-CosmattPlugin.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitLabelControl/dist/css/unitLabelControl.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/css/unitComboBox.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-motionprofile/dist/css/motionProfile.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-TSCurve/dist/css/tsCurve.min.css',
   "../../../../node_modules/libs-frontend-cosmatt/libs-frontend-ICWidget/dist/static/css/app.css",
   "../../../../node_modules/libs-frontend-cosmatt/libs-frontend-PLGraph/dist/css/plGraph.min.css"
   

  ],
  encapsulation: ViewEncapsulation.None,
})
export class MdViewerComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() mdContent: any;
  @Input() loading: boolean;
  @Input() assetsPath: String;
  @Input() embeddedAssessmentContent: any;
  @Input() numberFormatterOptions: any;
  // @Input() activityIds: any;
  @Output() onCheckMyWorkClicked = new EventEmitter();
  @Output() onAssessmentSubmit = new EventEmitter();
  @Output() navigateToSection = new EventEmitter();


  renderer: any;
  htmlContent: any;
  mdElement: any;
  // mdAssessment: any;
  testType: string;
  assessmentComponent: boolean;
  $el: any;
  activityMap: Map<string, boolean>;
  // Stores the references to all the injected assessments.
   _injectedAssessments: Array<ComponentRef<AssessmentComponent>> = [];

  constructor(private elementRef: ElementRef,
    private ref: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private appDataService: AppDataService,
    private viewContainerRef: ViewContainerRef,
    private factoryResolver: ComponentFactoryResolver,
    private popupService: PopupService,
    private productService: ProductService
  ) {
  }

  ngOnInit() {
    this.$el = jQuery(this.elementRef.nativeElement);
    this.activityMap = new Map<string, boolean>();
    // This is not needed as we are not setting testType on the basis @Input testType
    // this.testType = AssessmentType.Formative;
    // const embeddedObj =  this.tocService.tocJSON[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter].embedded;
    // if (embeddedObj && embeddedObj[0].tags && embeddedObj[0].tags[0] === 'Test') {
    //   this.testType = AssessmentType.Summative;
    // }

  }

  ngAfterViewInit() {
    this.mdElement = this.elementRef.nativeElement.querySelector('#md-content');
    this.appendBlankAssessmentDiv();
    this.renderMdContent(this.mdContent);
  }

  ngOnDestroy() {
    // Destroy the injected assessments
    this._injectedAssessments.forEach(injectedAssessment => {
      injectedAssessment.destroy();
    });
    // Destroy the widgets
    this._destroyWidgets();
  }

  /**
   * Injects embedded assessment into an HTML node
   * @param htmlNode : HTMLElement where assessment will be injected
   * @param viewIndexToInsert : index of the view to be inserted
   */
  private injectEmbeddedAssessment(htmlNode: HTMLElement, viewIndexToInsert: number): ComponentRef<AssessmentComponent> {
      // Get factory of AssessmentComponent
      const assessmentFactory = this.factoryResolver.resolveComponentFactory(AssessmentComponent);

      // Get the node's `data-cosmatt-assessment` attribute value
      const htmlNodeData = JSON.parse(htmlNode.getAttribute('data-cosmatt-widget'));

      // Create component with factory
      const assessmentComponent = assessmentFactory.create(this.viewContainerRef.parentInjector, null, htmlNode);

      // Find it's content from given array of assessment contents
      this.activityMap.set( htmlNodeData.options.id,true);
      const assessmentContent = this.embeddedAssessmentContent.find(content => {
        
        return content.attemptDetails.activityid === htmlNodeData.options.id;
      });

      //add the options defined in [cosmatt-plugin] json in md file.
      assessmentContent.renderOverrides_Updated = htmlNodeData.options.data;
      assessmentContent.embeddedAttribs = assessmentContent.embededAttribs;
      // Pass values to component
      assessmentComponent.instance.activityId = assessmentContent.attemptDetails.activityid;
      assessmentComponent.instance.activityDataContent = assessmentContent;
      let assessmentConfig = {showCMWButton: true, showSubmitButton: false};
      if(assessmentContent.embeddedAttribs && assessmentContent.embeddedAttribs['assessment-config']){
        assessmentConfig = {...assessmentConfig, ...assessmentContent.embeddedAttribs['assessment-config']};
      }
      assessmentComponent.instance.assessmentConfig = new AssessmentConfig(AssessmentType.Formative, AssessmentSubType.InSection, assessmentConfig);
      assessmentComponent.instance.onCheckMyWork.subscribe((event) => {
        this.onCheckMyWork(event);
      });
      assessmentComponent.instance.onSubmit.subscribe((event) => {
        this.onSubmit(event);
      });

      // Insert the component into view
      this.viewContainerRef.insert(assessmentComponent.hostView, viewIndexToInsert);

      // Add it to the array of injected assessments
      this._injectedAssessments.push(assessmentComponent);

      return assessmentComponent;
  }

  /**
   * Injects old formative end-of-section assessments
   */
  private injectTYUAssessment(injectedTYUViewIndex): void {
    // The TYU (Test Your Understanding) assessment will be added only for the first orphan embedded item (orphan = not linked via md)
    // Get factory of AssessmentComponent
    const assessmentFactory = this.factoryResolver.resolveComponentFactory(AssessmentComponent);
    let self = this;

    for (let index = 0; index < this.embeddedAssessmentContent.length; index++) {
      const content = this.embeddedAssessmentContent[index];
      if(!self.activityMap.has(content.attemptDetails.activityid)) {
        const appendedDiv = this.$el.find('#md-assessment').get(0);
        // Create component with factory
        const assessmentComponent = assessmentFactory.create(this.viewContainerRef.parentInjector, null, appendedDiv);
        assessmentComponent.instance.activityId = content.attemptDetails.activityid;
        assessmentComponent.instance.activityDataContent = content;
        assessmentComponent.instance.assessmentConfig = new AssessmentConfig(AssessmentType.Formative, AssessmentSubType.EndOfSection);
        assessmentComponent.instance.onCheckMyWork.subscribe((event) => {
          this.onCheckMyWork(event);
        });
        // Insert the component into view
        this.viewContainerRef.insert(assessmentComponent.hostView,injectedTYUViewIndex);
        this._injectedAssessments.push(assessmentComponent);
        break;
      }
    }
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (changes['mdContent'] && changes['mdContent']['currentValue'] && this.mdElement) {
      this.renderMdContent(changes['mdContent']['currentValue']);
    }
  }

  public onCheckMyWork(event) {
    this.onCheckMyWorkClicked.emit(event);
  }

  public onSubmit(data: any) {

    let allAssessmentsCompleted = true;
    this._injectedAssessments.forEach(assessment => {
      // Update it's local status
      if ( assessment.instance.activityId === data.activityId ) {
        assessment.instance.attemptDetails.status = data.status;
      }
      // Update all assessment completed bool
      //allAssessmentsCompleted = allAssessmentsCompleted && assessment.instance.attemptDetails.status === 'completed';
    });

    // Emit event that updates ToC
      this.onAssessmentSubmit.emit({
         'chapter': this.appDataService.selectedModule,
         'section': this.appDataService.selectedChapter,
         'status': data.status,
         'isEmbeddedTest': true
        });
  }

  public submitOnMarkAsCompleted(itemCodes){
    itemCodes.forEach(element => {
      let assessmentInstance = this._injectedAssessments.find(assessment =>  assessment.instance.activityId == element['item-code']);

      if(assessmentInstance && assessmentInstance.instance.attemptDetails.status !=='completed'){
        assessmentInstance.instance.submitTestOnMarkAsCompleted();
      }
    });
  }
  /**
   * Updates MD viewer's content
   * @param mdContent : The main MD content
   */
  renderMdContent(mdContent: any) {
    if (!mdContent) {
      return;
    }
    this.loading = true;

    // Before current HTML is removed, destroy the existing widgets
    this._destroyWidgets();

    this.mdElement.innerHTML = '';

    // Destroy all the existing injected assessment components ( if any )
    this._injectedAssessments.forEach(injectedAssessment => {
      injectedAssessment.hostView.detach();
      injectedAssessment.instance.$el.css('display', 'none');
      injectedAssessment.destroy();
    });
    this._injectedAssessments = [];

    // Get parsed HTML from MD
    this.htmlContent = marked(mdContent, {
      basePath: this.assetsPath
    });
    if (!this.mdElement) {
      this.mdElement = this.elementRef.nativeElement.querySelector('#md-content');
    }
    this.mdElement.innerHTML = this.htmlContent;

    // Append blank HTML div #md-assessment inside #md-content in case it's FORMATIVE + END_OF_SECTION
    this.appendBlankAssessmentDiv();
    this.loading = false;

    //Math equations update
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.mdElement], () => {
      const codeElements = this.mdElement.querySelectorAll('.code-math');
      for (const element of codeElements) {
        element.classList.remove('math-loader');
        const mathSvgEle = element.querySelector('.MathJax_SVG');
        if (mathSvgEle) {
          const width = mathSvgEle.querySelector('svg').getAttribute('width');
          mathSvgEle.style.width = width;
        }
      }
    });

    //Cosmatt-widgets update
    const cosmattWidgets = this.mdElement.querySelectorAll('.cosmatt-widget');
    let injectedAssessmentViewIndex = 1;
    for (const widget of cosmattWidgets) {
      const $widget = jQuery(widget);
      const widgetOptions = $widget.data('cosmatt-widget');
      if ( widgetOptions.type === 'assessment' ) {
        // Add embedded assessment to this $widget's HTML node
        this.injectEmbeddedAssessment($widget.get(0), injectedAssessmentViewIndex++);
        this.updateWidgetCSS(widgetOptions, $widget);
      } else {
        widgetOptions.options.applyNumberFormatter = this.productService.applyNumberFormatter();
        widgetOptions.options.data.numberFormatterOptions = this.numberFormatterOptions;
        $widget.CosmattPlugin(widgetOptions);

        // Hacky handling - To be removed when Leonardo has options to provide CSS of border, paddings etc.
        // Add the CSS provided by widget
        this.updateWidgetCSS(widgetOptions, $widget);
      }
    }

    // If no embedded assessments were there, it's the case of old formative assessments
    
    //Passed injectedTYUViewIndex as a parameter to insert the TYU Asessment at last after all MD Embedded Items have been inserted
    //Earlier Index 1 was hardcoded as only either md embedded items or TYU was to be inserted
      this.injectTYUAssessment(injectedAssessmentViewIndex);

    // chapter internal links

    // this.popupService.open();
    const internalRefElements = this.mdElement.querySelectorAll('.ngx-router-link');
    for (const ele of internalRefElements) {

      let myElementHref = ele.attributes.routerlink.value;

      // used to prevent default functionality of click event.
      // Refer: https://stackoverflow.com/questions/3666683/href-javascript-vs-href-javascriptvoid0
      ele.href = 'javascript:void(0);';

      ele.addEventListener('click', (e) => {
        // temp code. This check should be removed when all links in the content documenst are replaced with item codes..
        if ( myElementHref.startsWith('../')) {
          this.router.navigate([myElementHref], { relativeTo: this.activatedRoute });
        } else if (myElementHref === 'advanced_course') {
          // special handling for when link is for advanced course pop up
          this.popupService.popupConfig = new PopupConfig(HostMode.Component,{showCancelButton: false,showOkButton: false, showCloseButton: true, showFooterInfo: true});
          this.popupService.popupConfig.componentType = ComponentType.MdViewerLauncher;
          this.popupService.popupInput = new PopupInput('Advanced Course', '', '', {
            publicAssetPath: this.assetsPath
          });
          this.popupService.open();
        } else if ( myElementHref === 'inertia_calculator' ) {
          // Open IC with default settings and not output handlers
          this.popupService.popupConfig = new PopupConfig(HostMode.Component, {
            showCancelButton: false,
            showOkButton: false,
            showFooterInfo: false,
            showCloseButton: true
          });
          this.popupService.popupConfig.componentType = WidgetType.InertiaCalculator;
          this.popupService.popupInput = new PopupInput(WidgetTitle.InertiaCalculator,
             '',
             WidgetIcon.InertiaCalculator,
             new InertiaCalculatorSettings().defaultSettings);
          this.popupService.open();
        } else {
          // when myElementHref refers to item-code
          this.navigateToSection.emit(myElementHref);
        }
      });
    }

    // iframe wrapper for maintaining aspect ratio - e.g youtue video
    const iframe = this.mdElement.querySelectorAll('iframe');
    jQuery(iframe).wrap('<div class="aspect-ratio"></div>');
  }

  // Appends a blank HTML div inside mdElement
  private appendBlankAssessmentDiv() {
    if ( this.$el.find('#md-assessment').length === 0 ) {
      const mdAssessmentNode = jQuery('<div id="md-assessment"></div>');
      jQuery(this.mdElement).append(mdAssessmentNode);
    }
  }

  private updateWidgetCSS(widgetOptions,$widget){
    if ( widgetOptions.options.data && widgetOptions.options.data.cssOverrides ) {
      Object.keys(widgetOptions.options.data.cssOverrides).forEach(selector => {
        if ( $widget.is(selector) ) {
          $widget.css(widgetOptions.options.data.cssOverrides[selector]);
        } else {
          // Apply the selector to children
          $widget.children(selector).css(widgetOptions.options.data.cssOverrides[selector]);
        }
      });
    }

  }
  /**
   * Calls destroy functions of widgets/plugins
   * Functionality of what method to call for each widget is handled by DestroyCosmattPlugin method of cosmattPlugin.js
   */
  private _destroyWidgets() {
    const cosmattWidgets = this.mdElement.querySelectorAll('.cosmatt-widget');
    for (const widget of cosmattWidgets) {
      const $widget = jQuery(widget);
      const widgetOptions = $widget.data('cosmatt-widget');
      $widget.DestroyCosmattPlugin(widgetOptions);
    }
  }
}
