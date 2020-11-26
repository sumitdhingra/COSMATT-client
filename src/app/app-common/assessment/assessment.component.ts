import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  Output,
  EventEmitter,
  ElementRef,
  OnChanges,
  SimpleChange,
  OnDestroy,
  NgZone 
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';
import { Angulartics2 } from 'angulartics2';
import { environment } from '../../../environments/environment';
import { AppDataService } from '../../services/app-data.service';

import { ASSESSMENT_FRIENDLY_NAMES } from './assessment-friendly-names';
import { ASSESSMENT_ENGINE_MAP } from './assessment-engine-map';
import { AssessmentSubType } from 'app/app-common/assessment/assessment-subtype.enum';
import { AssessmentType } from 'app/app-common/assessment/assessment-type.enum';
import { AssessmentConfig } from './assessment-config';
import { QuestionResponse } from './assessment';
import { ActivityService } from 'app/servo-system-course/services/activity.service';
import { TocService } from 'app/servo-system-course/services/toc.service';
import { ProductService } from 'app/servo-system-course/services/product.service';
import { ProgressService, ProgressStatus, ItemStatus } from '../../servo-system-course/services/progress.service';
import { ClassDataService } from '../../servo-system-course/services/class-data.service';
declare const TestRunner: any;
declare const Cosmatt: any;

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.scss']
})
export class AssessmentComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() activityDataContent: any;
  @Input() activityId: any;
  @Input() assessmentConfig: AssessmentConfig;

  @Output() onSubmit = new EventEmitter();
  @Output() onCheckMyWork = new EventEmitter();

  quesIndex = 0;
  userRespSubmitData: any;
  testRunner: any;
  secretKey: string;
  userId: string;
  productId: string;
  attemptDetails: any;
  savedResponses: any;
  currentQuestionRes: any;
  $el: any;
  checkAnsDisable = true;
  loading: boolean;
  submitting: boolean;
  checking: boolean;
  assetsPath: string;
  responsesUpdated: boolean;
  assessmentFriendlyName: string;
  chapter: string;
  section: string;
  questionsArr: any;
  maxQuesVisible: number;
  checkMyWorkText = 'Check My Work';
  checkMyWorkTitle = '';
  hintButtonText = 'Show Hint';
  remainingHint: number = 0;
  displayHintButtons :boolean = false;
  disableShowHintButton : boolean = false;
  disableHideHintButton : boolean= true;
  isHideHintButton : boolean= false;
  tryAgainMode = false;
  numberFormatHandler: any;
  renderOverrides_Updated: any;

  // enum props for use in HTML
  assessmentSubType = AssessmentSubType;
  assessmentType = AssessmentType;
  embededAttribs:any;

  constructor(private activatedRoute: ActivatedRoute,
    private appDataService: AppDataService, 
    private router: Router,
    private http: Http,
    private domEle: ElementRef,
    private angulartics2: Angulartics2,
    private _ngZone: NgZone,
    private activityService: ActivityService,
    private tocService: TocService,
    private productService: ProductService,
    private progressService: ProgressService,
    private classDataService :ClassDataService
  ) {
    let numberFormatter = new Cosmatt.NumberFormatter();
    this.numberFormatHandler = function(data){      
      return numberFormatter.format(data.data);
    }

    this.$el = jQuery(domEle.nativeElement);
    
    window['assessment_compre'] = {component: this, zone: _ngZone};
    this.appDataService.resetCurrentSection.subscribe(() => this.resetAssessment());
  }

  ngOnInit() {
    let width = this.$el.width();
    this.maxQuesVisible = width >= 974 ? 10 : 5;

    if ( this.assessmentConfig.type === AssessmentType.Formative ) {
      this.secretKey = this.activityDataContent.secretKey;
      this.userId = this.activityDataContent.userId;
      this.productId = this.activityDataContent.productId;
      this.attemptDetails = this.activityDataContent.attemptDetails;
      this.assetsPath = this.activityDataContent.assetsPath;
      this.loading = true;
      this.submitting = false;
      this.responsesUpdated = false;
      this.chapter = this.activityDataContent.chapterSection.chapter;
      this.section = this.activityDataContent.chapterSection.section;
      this.embededAttribs = this.activityDataContent.embededAttribs;
      //read the override options data from json in md file in case of In Section Assessment.
      this.renderOverrides_Updated = this.activityDataContent.renderOverrides_Updated
      this.activityDataContent = this.activityDataContent.activityContent;
      this.quesIndex = 0;
      if (this.activityDataContent.length > this.maxQuesVisible) {
        this.questionsArr = this.getQuesIndexArray(0, this.maxQuesVisible);
      } else {
        this.questionsArr = this.getQuesIndexArray(0, this.activityDataContent.length);
      }
      this.initTestRunner();
    }

    if (this.activityDataContent.length > this.maxQuesVisible) {
      this.questionsArr = this.getQuesIndexArray(0, this.maxQuesVisible);
    } else {
      this.questionsArr = this.getQuesIndexArray(0, this.activityDataContent.length);
    }
    this.$el.on('resize', (e) => {
      if (width != this.$el.width()) {
        width = this.$el.width();
        this.maxQuesVisible = width >= 974 ? 10 : 5;
        this.setQuestionPaletteArray();
      }
    });

    // const activityContent = changes['activityDataContent']['currentValue'];
    // this.secretKey = this.activityDataContent.secretKey;
    // this.userId = this.activityDataContent.userId;
    // this.productId = this.activityDataContent.productId;
    // this.attemptDetails = this.activityDataContent.attemptDetails;
    // this.assetsPath = this.activityDataContent.assetsPath;
    // this.loading = true;
    // this.submitting = false;
    // this.responsesUpdated = false;
    // this.chapter = this.activityDataContent.chapterSection.chapter;
    // this.section = this.activityDataContent.chapterSection.section;
    // this.quesIndex = 0;
    // if (this.activityDataContent.length > this.maxQuesVisible) {
    //   this.questionsArr = this.getQuesIndexArray(0, this.maxQuesVisible);
    // } else {
    //   this.questionsArr = this.getQuesIndexArray(0, this.activityDataContent.length);
    // }
    // this.activityDataContent = this.activityDataContent.activityContent;
    // this.initTestRunner();
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (changes['activityDataContent'] && changes['activityDataContent']['currentValue']) {
      // This is only run when assessment is `stand-alone`
      const activityContent = changes['activityDataContent']['currentValue'];
      this.secretKey = activityContent.secretKey;
      this.userId = activityContent.userId;
      this.productId = activityContent.productId;
      this.attemptDetails = activityContent.attemptDetails;
      this.assetsPath = activityContent.assetsPath;
      this.activityDataContent = activityContent.activityContent;
      this.loading = true;
      this.submitting = false;
      this.responsesUpdated = false;
      this.chapter = activityContent.chapterSection.chapter;
      this.section = activityContent.chapterSection.section;
      this.embededAttribs = activityContent.embededAttribs;
      this.quesIndex = 0;
      if (this.activityDataContent.length > this.maxQuesVisible) {
        this.questionsArr = this.getQuesIndexArray(0, this.maxQuesVisible);
      } else {
        this.questionsArr = this.getQuesIndexArray(0, this.activityDataContent.length);
      }
      this.initTestRunner();
    }
  }

  ngOnDestroy() {
    this.saveUserResponse(this.currentQuestionRes);
    this.$el.hide();
  }

  ngAfterViewInit() {
    console.log('Assessment view init.');
  }

  initTestRunner() {
    // Paths
    const baseHref = document.getElementsByTagName('base')[0].href;
    const paths = {
      'dependencyBase': baseHref + 'assets/',
      'productAssets': this.assetsPath
    };

    // Iframe Container
    const containerElementRef = this.getUniqueTestId();

    // Render preferences (size, color, resizing, etc.)
    let renderOverrides = {
      'size': 'medium',
      'fontFamily': 'open-sans-font',
      'waitSeconds': 60
    };
    //COSMATT-2061-renderOverrides is passed to Testrunner while initializaing it and then it passes it to engines.
    //Testrunner is initialized once for an assessment(set of questions).
    //In the scenario where an assessment includes leonardo type question but not as first question(index = 0) 
    //renderOverrides does not get passed to Testrunner. 
    //Remvoing leonardo check while initialize and now this config will get passed to each engine.
    // if (this.activityDataContent[this.quesIndex].meta.type === 'LEONARDODLS') {
      const leonardoConfigOption = this.getOveridesObjectForLeonardo();
      renderOverrides = $.extend({}, renderOverrides, leonardoConfigOption);
    // }
    if (this.activityDataContent[this.quesIndex].meta.type === 'COSMATTCOMPREWIDGET') {
      this.assessmentConfig.config.showSubmitButton =false;
      this.assessmentConfig.config.showCMWButton = false;
      this.assessmentConfig.config.showResetButton = false;
    }

    //Override renderOverrides object if its defined in activity.json 
    if(((((this.activityDataContent[this.quesIndex]['app-data'] || {}).options || {}).data || {}).meta || {}).renderOverrides){
       let renderOverrides_Updated = this.activityDataContent[this.quesIndex]['app-data'].options.data.meta.renderOverrides;
      renderOverrides = $.extend({}, renderOverrides, renderOverrides_Updated);
    }
    //Override renderOverrides object if its defined in md file JSON
    // renderOverrides defined in md file will get the priority over the renderOverrides defined in activity.json
    if( this.assessmentConfig.subType === AssessmentSubType.InSection && ((this.renderOverrides_Updated || {}).meta || {}).renderOverrides){
        let renderOverrides_Updated = this.renderOverrides_Updated.meta.renderOverrides;
        renderOverrides = $.extend({}, renderOverrides, renderOverrides_Updated);
    }


    this.testRunner = new TestRunner();
    const questionParams = {};

    const eventContext = {
      'initializationCompleted': () => {
        this.getSavedResponses();
      },
      'afterPartialSave': (uniqueTestId, json) => {
        const response = JSON.parse(JSON.stringify(json.response));
        response.id = this.activityDataContent[this.quesIndex]['item-code'];
        response.type = this.activityDataContent[this.quesIndex]['meta']['type'];
        response.data = {};
        const currentQuesRes = this.getCurrentQuestionSavedResponse(this.quesIndex);
        if (currentQuesRes && currentQuesRes.data) {
          response.data = currentQuesRes.data;
        }
        this.currentQuestionRes = JSON.parse(JSON.stringify(response));
        this.responsesUpdated = true;
        this.updateCurrentQuestionSavedResponse(this.quesIndex, this.currentQuestionRes);
        this.saveUserResponse(this.currentQuestionRes, false);
      },
      'afterCompleted': (uniqueTestId, json) => {
      },
      'afterLoaded': (uniqueTestId) => {
        this.loading = false;
        this.currentQuestionRes = undefined;
        const quesRes = this.getCurrentQuestionSavedResponse(this.quesIndex);
        
        var hasHints = this.testRunner.hasHints(uniqueTestId);
        if(hasHints){
          this.displayHintButtons = true;
          this.updateHintButtonText(true);
        }
        // Also re-paint for InSection assessment after submission.
        if ( this.assessmentConfig.config.showSubmitButton && this.attemptDetails['status'] === 'completed') { // End of chapter assessments
          this.checkAnsDisable = true;
          this.setTryAgainMode(true);
          if (quesRes) {
            this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
            this.testRunner.showGrades(uniqueTestId);
          } else {
            // this.testRunner.showGrades(uniqueTestId, { 'interactions': [] });
            this.testRunner.showGrades(uniqueTestId);
          }
        } else {
          this.checkAnsDisable = false;
          if (!quesRes) {
            this.setTryAgainMode(false);
            
            return;
          }
          // If last action was reset or try again, than data.submitted will be false/undefined
          if (quesRes.data && !quesRes.data.submitted) {
            // if (this.savedResponses.length > 0) {
            this.setTryAgainMode(false);
            
            this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
          } else if (quesRes.data && quesRes.data.submitted === true) {
            if (this.savedResponses.length > 0) {
              this.setTryAgainMode(true);
              this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
              this.testRunner.showGrades(uniqueTestId);
            }
          }
        }
          var remainingHints = this.testRunner.remainingHints(uniqueTestId);
          if(remainingHints == 0){
            this.disableShowHintButton = true;
            this.disableHideHintButton = true;
          }

        // if (this.testType === 'stand-alone') { // End of chapter assessments
        //
        //   if (this.attemptDetails['status'] === 'completed') {
        //     this.checkAnsDisable = true;
        //     if (quesRes) {
        //       this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
        //       this.testRunner.showGrades(uniqueTestId);
        //     } else {
        //       // this.testRunner.showGrades(uniqueTestId, { 'interactions': [] });
        //       this.testRunner.showGrades(uniqueTestId);
        //     }
        //   } else {
        //     this.checkAnsDisable = false;
        //     if (this.savedResponses.length > 0 && quesRes) {
        //       if (quesRes.data.submitted) {
        //         //this.checkAnsDisable = true;
        //         this.setTryAgainMode(true);
        //         this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
        //         this.testRunner.showGrades(uniqueTestId);
        //       } else {
        //         this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
        //       }
        //     }
        //   }
        // } else if (this.testType === 'embedded') {  // Test your understanding
        //   if (!quesRes) {
        //     return;
        //   }
        //   this.checkAnsDisable = false;
        //   // If last action was reset or try again, than data.submitted will be false/undefined
        //   if (quesRes.data && !quesRes.data.submitted) {
        //     // if (this.savedResponses.length > 0) {
        //     this.setTryAgainMode(false);
        //     this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
        //     // }
        //   } else if (quesRes.data && quesRes.data.submitted === true) {
        //     if (this.savedResponses.length > 0) {
        //       this.setTryAgainMode(true);
        //       this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
        //       this.testRunner.showGrades(uniqueTestId);
        //     }
        //     // when user response is correct no need to show try again
        //     // if (quesRes.statusEvaluation === 'correct' && quesRes.interactions.length) {
        //     //   this.checkAnsDisable = true;
        //     //   this.setTryAgainMode(false);
        //     //   this.testRunner.updateLastSavedResults(uniqueTestId, quesRes);
        //     //   this.testRunner.showGrades(uniqueTestId);
        //     // }
        //     // If last action was check my work,than data.submitted will be true
        //     // if (quesRes.data && quesRes.data.submitted === true) {
        //     // }
        //   }
        // }
      }
    };

    const uniqueTestId = this.getUniqueTestId();
    const loaderId = 'loader_' + uniqueTestId;
    //removing passing of secretkey  to test runner as per post https://basecamp.com/2083367/projects/11273909/messages/72777279#comment_608789359
    this.testRunner.init(uniqueTestId, paths, containerElementRef, renderOverrides, eventContext, loaderId);
  }
  getOveridesObjectForLeonardo() {
    const self = this;
    const newLeonardoConfigOption = {
      scoreConfig: {
        "showSummary":false,
        "showDetails":false
      },
      widgetStyles:{
      border: "0px",
      "box-shadow": "none"
      },
      'horizontalAlignment': 'center'
      };
      if(this.productService.applyNumberFormatter()){
        newLeonardoConfigOption['numberFormatter'] = self.numberFormatHandler; 
      }
    return newLeonardoConfigOption;
  }
  getSavedResponses(forcePaint: boolean = true) {
    if (forcePaint) {
      this.loading = true;
    }
    const params = new URLSearchParams();
    params.set('userid', this.userId);
    if(this.classDataService.ActiveClass){
      params.set('classid', this.classDataService.ActiveClass);
    }
    console.log('Getting test data', params);
    let itemcode = encodeURIComponent(this.activityId);

    return this.http.get(`${environment.API_URL}analytics/state/${this.productId}/${itemcode}`, { search: params }).toPromise()
      .then((res) => {
        let response = JSON.parse(res['_body']);
        this.savedResponses = response.userresponse ? response.userresponse : [];
        if (this.submitting) {
          this.submitting = false;
          this.$el.find('#reportModal').modal('hide');
        }
        if (forcePaint) {
          this.paintTestRunner();
        }
      }).catch(err => {
        console.log(err);
      });
  }

  postResetData(paint, showLoader: boolean = true) {
    const currentQues = this.getCurrentQuestionSavedResponse(this.quesIndex);
    if (!currentQues) {
      return;
    }
    if ((currentQues.interactions && currentQues.interactions.length > 0) || currentQues.data.submitted) {
      currentQues.interactions = [];
      currentQues.data = {};
      this.responsesUpdated = true;
      this.saveUserResponse(currentQues, showLoader);
      this.updateCurrentQuestionSavedResponse(this.quesIndex, currentQues);
      if (paint) {
        this.paintTestRunner();
      }

    }
  }

  reset() {
    this.checkAnsDisable = false;
    this.checking = false;
    this.setTryAgainMode(false);
    
    if(this.displayHintButtons){
      this.updateHintButtonText(true);
    }
    // hot fix to be updated
    if (this.savedResponses.length === 0) {
      this.getSavedResponses(false).then(() => {
        this.postResetData(false);
      });
      try {
        this.testRunner.resetAnswers(this.getUniqueTestId());
      } catch (ex) {
        this.paintTestRunner();
      }
      return;
    }
    try {
      this.testRunner.resetAnswers(this.getUniqueTestId());
      this.postResetData(false, false);
    } catch (ex) {
      this.postResetData(true);
    }
    const quesId = this.activityDataContent[this.quesIndex]['item-code'];
    this.appDataService.gaEventTrack('SERVO_SYSTEM_FORMATIVE_RESET', quesId, this.assessmentFriendlyName);
  }

  tryAgain() {
    this.checkAnsDisable = false;
    this.checking = false;
    try {
      this.testRunner.clearGrades(this.getUniqueTestId());
      this.setTryAgainMode(false);
    } catch (ex) {
      this.loading = true;
      this.paintTestRunner();
    }
    const quesId = this.activityDataContent[this.quesIndex]['item-code'];
    this.appDataService.gaEventTrack('SERVO_SYSTEM_FORMATIVE_TRY_AGAIN', quesId, this.assessmentFriendlyName);
  }

  setTryAgainMode(enable: boolean) {
    this.tryAgainMode = enable;
    if (enable) {
      this.checkMyWorkText = 'Try Again';
      this.checkMyWorkTitle = 'Allows you to re-enter the data once you have checked your work';
    } else {
      this.checkMyWorkText = 'Check My Work';
      this.checkMyWorkTitle = 'Check your entries once you have input all the required cells in the sheet' ;
    }
  }


  saveUserResponse(response, showLoader: boolean = true, forceSave?: boolean) {
    if (!forceSave && !this.responsesUpdated) {
      this.checking = false;
      this.loading = false;
      return Promise.resolve();;
    }
    this.responsesUpdated = false;
    if (!this.checking && showLoader) {
      this.loading = true;
    }
    let itemcode = encodeURIComponent(this.activityId);
    return this.http.put(`${environment.API_URL}analytics/state/${this.productId}/${itemcode}`, {
      userid:this.userId,
      classid : this.classDataService.ActiveClass,
      appdata : {userresponse: this.savedResponses},
      // attemptId: this.attemptDetails['uuid']
    }).toPromise()
      .then((res) => {
        this.loading = false;
        this.checking = false;
      }).catch(err => {
        console.log(err);
        // TODO - Handle this use case in some better way
        // Prevent assessment state from getting bugged.
        this.loading = false;
        this.checking = false;
      });
  };

  paintTestRunner() {
    const mode = 'MODE_ENGINE';
    let runtimeProfile = 'COSMATT_PROFILE1';

    const questionParams = {};
    questionParams['content'] = this.activityDataContent[this.quesIndex];
    questionParams['engine'] = questionParams['content']['meta']['type'];
    questionParams['variation'] = questionParams['content']['content']['canvas']['layout'];
    const uniqueTestId = this.getUniqueTestId();
    this.assessmentFriendlyName = (ASSESSMENT_FRIENDLY_NAMES[questionParams['engine']]);
    if(this.assessmentConfig.subType === AssessmentSubType.InSection){
      runtimeProfile = 'ACCOUNTING_PROFILE';
    }
    //Reset Hint button visibility for each question. 
    // Hint button will be visible based on hasHint funtion refer "afterLoaded" funtion
    this.displayHintButtons = false;
    this.testRunner.paintQuestion(uniqueTestId, questionParams, ASSESSMENT_ENGINE_MAP[questionParams['engine']], mode, runtimeProfile);
  }

  getCurrentQuestionSavedResponse(quesIndex) {
    const quesId = this.activityDataContent[quesIndex]['item-code'];
    for (const response of this.savedResponses) {
      if (response.id === quesId) {
        if (  this.currentQuestionRes && this.currentQuestionRes.id === quesId ) {
          this.currentQuestionRes = response;
        }
        return response;
      }
    }
    return null;
  }

  updateCurrentQuestionSavedResponse(quesIndex, currentResponse) {
    const quesId = this.activityDataContent[quesIndex]['item-code'];
    for (let i = 0; i < this.savedResponses.length; i++) {
      if (this.savedResponses[i].id === quesId) {
        if (currentResponse.data) {
          this.savedResponses[i].data = currentResponse.data;
        }
        this.savedResponses[i].statusProgress = currentResponse.statusProgress;
        this.savedResponses[i].statusEvaluation = currentResponse.statusEvaluation;
        this.savedResponses[i].interactions = currentResponse.interactions;
        return;
      }
    }
    this.savedResponses.push(currentResponse);
  }

  prevBtnClicked() {
    if (this.quesIndex > 0) {
      this.currentQuestionRes = this.getCurrentQuestionSavedResponse(this.quesIndex);
      this.quesIndex--;
      this.changeQuestion();
    }
  }

  nextBtnClicked() {
    if (this.quesIndex < this.activityDataContent.length - 1) {
      this.currentQuestionRes = this.getCurrentQuestionSavedResponse(this.quesIndex);
      this.quesIndex++;
      this.changeQuestion();
    }
  }

  changeQuestion() {
    this.saveUserResponse(this.currentQuestionRes).then(() => {
      return this.getSavedResponses();
    }).then(() => {
      this.setQuestionPaletteArray();
    });
  }

  setQuestionPaletteArray() {
    let lastQuesVisibleIndex = (Math.floor(this.quesIndex / this.maxQuesVisible) + 1) * this.maxQuesVisible;
    if (lastQuesVisibleIndex > this.activityDataContent.length - 1) lastQuesVisibleIndex = this.activityDataContent.length;
    const firstQuesVisibleIndex = (Math.floor(this.quesIndex / this.maxQuesVisible)) * this.maxQuesVisible;
    if (this.quesIndex < this.questionsArr[0] ||
      this.quesIndex > this.questionsArr[this.questionsArr.length - 1] ||
      this.questionsArr[this.questionsArr.length - 1] != lastQuesVisibleIndex - 1 ||
      lastQuesVisibleIndex - firstQuesVisibleIndex != this.questionsArr.length
    ) {
      this.questionsArr = this.getQuesIndexArray(firstQuesVisibleIndex, lastQuesVisibleIndex);
    }
  }

  getQuesIndexArray(start, end) {
    const arr = [];
    for (let i = start; i < end; i++) {
      arr.push(i);
    }
    return arr;
  }

  submitTestBtnClicked() {
    this.$el.find('#reportModal').modal('show');
  }

  submitTestOnMarkAsCompleted(){
    this.submitTest(undefined, false)
  }
  
  checkforSubmitEvent(){
    let bfireEvent:boolean= false;
    if(this.embededAttribs && this.embededAttribs['mark-as-complete'] && this.embededAttribs['mark-as-complete'].items){
      for(let index = 0; index < this.embededAttribs['mark-as-complete'].items.length; index++){
        let element =  this.embededAttribs['mark-as-complete'].items[index];
        if(element['item-code'] == this.tocService.getItemCode(this.appDataService.selectedModule, this.appDataService.selectedChapter)){
          bfireEvent= true;
          break;
        }
      }
    }else if(this.embededAttribs && this.embededAttribs.isTest == true){
      bfireEvent= true;
    }
    return bfireEvent;
  }
  submitTest(userresponse?, fireSubmitEvent:boolean=true) {
    this.appDataService.gaEventTrack('SERVO_SYSTEM_SUMMATIVE_SUBMIT');
    this.submitting = true;
    this.saveUserResponse(undefined, true, true)
      .then((res) => {
        this.attemptDetails['status'] = ItemStatus.COMPLETED;
        this.getSavedResponses();
        if(fireSubmitEvent && this.checkforSubmitEvent()){
          this.onSubmit.emit({
            status: this.attemptDetails['status'],
            activityId: this.activityId
          });
        }
        // if (this.activityId === 'Fundamentals_Pre_Test_V9') {
        //   $('#Fundamentals_Pre_Test_V9').find('a').find('span:first').addClass('fa-check');
        //   $('#Fundamentals_Radians').find('a').find('span:first').addClass('fa-check');
        //   $('#Fundamentals_Power').find('a').find('span:first').addClass('fa-check');
        //   $('#Fundamentals_Units').find('a').find('span:first').addClass('fa-check');
        // }
      });
  }

  /**
   * Function which allows multiple submissions
   * 1. Fires `Check My Work` behavior of all the questions.
   * 2. Does not submit the `attempt` but marks the activity as `completed.`
   *
   * TODO
   * 1. Multiple submissions should mean multiple submits on different `attempts`
   *  Current implementation uses only one `attempt` without getting more `attempts` from DLS
   */
  submitTestAsCheckMyWork() {
    this.submitting = true;
    // Do check my work for current question
    this.checkMyWorkBtnClicked();

    // Also, do checkMyWork stuff for other questions in the activity
    this.questionsArr.forEach(questionIndex => {
      // Only do it for other questions as current question's CheckMyWork has already been handled.
      if ( questionIndex !== this.quesIndex ) {
        let questionResponse = this.getCurrentQuestionSavedResponse(questionIndex);
        if ( !questionResponse ) {
          questionResponse = this._createQuestionResponse(questionIndex, true);
        }
        questionResponse.data.submitted = true;
        this.saveUserResponse(questionResponse, true, true);
        this.updateCurrentQuestionSavedResponse(questionIndex, questionResponse);
        this.onCheckMyWork.emit(questionResponse.id);
      }
    });

    // Fire the submit event, so this TOC item can be marked as complete.
    this.onSubmit.emit({
      status: 'completed',
      activityId: this.activityId
    });

    this.submitting = false;
    this.$el.find('#reportModal').modal('hide');
  }

  private _createQuestionResponse(questionIndex: number, submitted?: boolean): QuestionResponse {
    return {
      type: this.activityDataContent[questionIndex]['meta']['type'],
      id: this.activityDataContent[questionIndex]['item-code'],
      interactions: [],
      data: submitted === undefined ? { submitted: false } : { submitted: submitted }
    };
  }

  // to be implemented
  getQuesState(index) {
    // if (this.responses[index]) {
    //   if (this.responses[index]['quesState'] === 'attempted') {
    //     return 'Not Submitted';
    //   } else if (this.responses[index]['quesState'] === 'correct') {
    //     return 'Correct';
    //   } else if (this.responses[index]['quesState'] === 'incorrect') {
    //     return 'Incorrect';
    //   }
    // }
    return 'Not Attempted';
  }

  questionNavClicked(index) {
    if (this.quesIndex === index) {
      return;
    }
    this.currentQuestionRes = this.getCurrentQuestionSavedResponse(this.quesIndex);
    this.quesIndex = index;
    this.changeQuestion();
  }

  getUniqueTestId() {
    return this.activityId.replace(/\//g, '___'); // remove special characters
  }

  checkMyWorkBtnClicked() {
    this.checkAnsDisable = true;
    this.checking = true;
    this.currentQuestionRes = this.getCurrentQuestionSavedResponse(this.quesIndex);
    const uniqueTestId = this.getUniqueTestId();
    if (!this.currentQuestionRes) {
      this.currentQuestionRes = this._createQuestionResponse(this.quesIndex, !this.tryAgainMode);
    }
    this.currentQuestionRes.data.submitted = !this.tryAgainMode;
    this.testRunner.showGrades(uniqueTestId);
    this.responsesUpdated = true;
    this.saveUserResponse(this.currentQuestionRes);
    this.updateCurrentQuestionSavedResponse(this.quesIndex, this.currentQuestionRes);

    if (this.tryAgainMode) { // on try again reload test runner and update saved results
      this.tryAgain();
      if (this.savedResponses.length > 0 && this.currentQuestionRes) {
        this.testRunner.updateLastSavedResults(uniqueTestId, this.currentQuestionRes);
      }
    } else if (!this.tryAgainMode) { // on check my work click set text to try again
      this.checkAnsDisable = false;
      this.setTryAgainMode(true);
      if(this.displayHintButtons){
        this.updateHintButtonText(true);
      }
    }

    // if status is correct the set text back to Check My Work and disable it
    // if (this.savedResponses[0].statusEvaluation === 'correct' && this.currentQuestionRes.interactions.length && this.testType === 'embedded') {
    //   this.checkAnsDisable = true;
    //   this.setTryAgainMode(false);
    // }

    this.onCheckMyWork.emit(this.currentQuestionRes.id);
    const action = (this.assessmentConfig.type === AssessmentType.Formative) ? 'SERVO_SYSTEM_FORMATIVE_CHECK_MY_WORK' : 'SERVO_SYSTEM_SUMMATIVE_CHECK_MY_WORK';
    this.appDataService.gaEventTrack(action, this.currentQuestionRes.id, this.assessmentFriendlyName);
  }

  hintButtonClicked(){
    const uniqueTestId = this.getUniqueTestId();
    if(this.isHideHintButton){
      this.testRunner.hideHints(uniqueTestId);
      this.updateHintButtonText(true);
    }else{
      this.remainingHint = this.testRunner.showHints(uniqueTestId);
      this.updateHintButtonText(false);
    }
    
  }
  updateHintButtonText(bShowHint){
    if(bShowHint){
      this.isHideHintButton = false;
      this.hintButtonText = 'Show Hint'
    }else{
      this.isHideHintButton = true;
      this.hintButtonText = 'Hide Hint'
    }
  }
  resetAssessment(){
    const params = new URLSearchParams();
    params.set('userid', this.userId);
    params.set('key', 'userresponse');
    if(this.classDataService.ActiveClass){
      params.set('classid', this.classDataService.ActiveClass);
    }
    let itemcode = encodeURIComponent(this.activityId);

    return this.http.delete(`${environment.API_URL}analytics/state/${this.productId}/${itemcode}`, { search: params }).toPromise()
    .then((res) => {
      return this.progressService.postAttemptStatement(this.activityId, ProgressStatus.LAUNCHED)
    })
    .then(data => { 
      return this.activityService.getActivity(this.activityId);
    })
    .then( (response) =>{
      const responseJson = response.json();
      this.attemptDetails = responseJson.attemptDetails;
      this.savedResponses = [];
      this.paintTestRunner();
    }).catch(error=>{
      console.log(error);
    })
  }
}