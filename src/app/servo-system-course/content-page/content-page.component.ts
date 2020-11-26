import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { ProductService } from '../services/product.service';
import { TocService } from '../services/toc.service';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';
import { CourseDataService } from '../services/course-data.service';
import { Http } from '@angular/http';
import { AppDataService, ContentMode } from '../../services/app-data.service';
import { ActivityService } from '../services/activity.service';
import { MdContentService } from '../services/md-content.service';
import { SidebarComponent } from '../../app-common/sidebar/sidebar.component';
import { ProgressService, ProgressStatus, ItemStatus } from '../services/progress.service';
import { Angulartics2 } from 'angulartics2';
import { UtilsService } from '../../services/utils.service';
import { LoViewerComponent } from '../../app-common/lo-viewer/lo-viewer.component';
import { MdViewerComponent } from 'app/app-common/md-viewer/md-viewer.component';
import { EomTestComponent } from 'app/servo-system-course/eom-test/eom-test.component';

@Component({
  selector: 'app-content-page',
  templateUrl: './content-page.component.html',
  styleUrls: ['./content-page.component.scss']
})
export class ContentPageComponent implements OnInit, OnDestroy {
  @ViewChild(SidebarComponent)
  private sidebarComponent: SidebarComponent;
  @ViewChild(MdViewerComponent)
  private mdViewerComponent: MdViewerComponent;


  @ViewChild(EomTestComponent)
  private eomTestComponent: EomTestComponent;

  @ViewChild('whiteBackground') whiteBlankDivisionForLOLOader: ElementRef;

  @ViewChild(LoViewerComponent)
  private loViewerComponent: LoViewerComponent;

  timeOut: any;
  courseId: string;
  sub: any;
  mdContent: any;
  activatedItem: Object;
  el: ElementRef;
  userType: String;
  sidebar: any;
  toc: false;
  pageTitle: string;
  selectedModuleName: String;
  loading = false;
  selectedModule: any;
  selectedChapter: any;
  prevTopicName: String;
  nextTopicName: String;
  testObject: any;
  selectedChapterNumber: any;
  selectedModuleNumber: any;
  onlyModuleSelected: boolean = false;
  preTestObject: any;
  tocArray: any;
  enableMarkAsCompleteBtn: boolean;
  showMarkAsCompleteBtn = false;
  publicAssetsPath: String;
  readSessionLastPostTime: number;
  embeddedTestObj: any;
  embeddedTestArray: any;
  itemCurrentStatus: string;
  markAsCompleteBtnLoading: boolean = false;
  routerSub: any;
  activityData: any;
  activityIds: any;
  markAsCompleteTimeoutReference: any;
  timeSpentPostIntervalRef: any;
  LOloading = false;
  public contentMode = ContentMode;
  markAsCompleteOptions: any;

  constructor(private productService: ProductService,
    public courseDataService: CourseDataService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: Http,
    el: ElementRef,
    public appDataService: AppDataService,
    private tocService: TocService,
    private progressService: ProgressService,
    private mdContentService: MdContentService,
    private activityService: ActivityService,
    private angulartics2: Angulartics2,
    public utilsService: UtilsService) {
    console.log('DEBUG | ContentPage constructor called...');
    this.appDataService.resetCurrentSection.subscribe(() => this.resetCurrentSection());
    this.tocService.loadSectionOnItemComplete.subscribe(() => this.loadSectionOnItemComplete());
  }

  ngOnInit() {
    console.log('DEBUG | ContentPage - ngOnInit - ', 'appDataService.contentMode: ', this.appDataService.contentMode);
    this.appDataService.setCourseContentDisplayed(true);
    this.sidebar = this.courseDataService.getSidebarStatus();
    this.courseId = this.courseDataService.getProductId();
    this.publicAssetsPath = this.productService.getPublicAssetsPath() + '/';
    this.tocArray = this.tocService.getToc();
    this.appDataService.unitSystemChanged$.subscribe(unitSystem => this.onUnitSystemChanged(unitSystem));

    // Subscribe to the params of activatedRoute. Called everytime parameters of the route after 'xyz/content/' changes.
    // Ex- If user moves to Chapter 5 Section 4, params would be {module: 4, chapter: 3}
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.mdContent = undefined;
      this.embeddedTestObj = undefined;
      this.embeddedTestArray = [];
      this.testObject = undefined;
      this.enableMarkAsCompleteBtn = false;
      this.readSessionLastPostTime = Date.now();
      // to collapse all expanded modules
      this.LOloading = true;
      const _params = {};
      for (const param of Object.keys(params)) {
        _params[param] = this.utilsService.stripQueryParams(params[param]);
      }
      // Set the current chapter and module
      this.appDataService.selectedModule = _params['module'];
      this.appDataService.selectedChapter = _params['chapter'];
      //const { chapter, section } = this.tocService.getChapterSectionName(+_params['module'], +_params['chapter']);

      // moduleName is the name of chapter. Ex- Transmission Ratio Optimization
      const moduleName = this.tocArray[this.appDataService.selectedModule]['name'];
      const courseName = this.courseDataService.getProductName();
      this.selectedModuleName = moduleName;
      var selectedChapterObj = this.tocArray[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter];
      // chapterName is the name of seciton. Ex - Adding a Transmission Mechanism
      this.selectedChapterNumber = this.appDataService.selectedChapter;
      this.selectedModuleNumber = this.appDataService.selectedModule;
      if ((this.appDataService.selectedChapter == undefined || this.appDataService.selectedChapter == "-1") && selectedChapterObj == undefined) {
        this.appDataService.DisplayMDContent = false;
        //this.loViewerComponent.loaderForLOComponent = true;
        this.pageTitle = moduleName;

        this.activatedItem = {
          module: this.appDataService.selectedModule,
          chapter: '-1'
        };
        this.appDataService.setPageTitle(`${moduleName} - ${courseName}`);
        return;
      } else {
        this.appDataService.DisplayMDContent = true;
      }
      const chapterName = selectedChapterObj['name'];
      this.appDataService.setPageTitle(`${moduleName} - ${chapterName} - ${courseName}`);

      // Set Mark as complete visibility
      //this.setMarkAsCompleteVisibility();
      this.itemCurrentStatus = this.tocService.getItemStatus(this.appDataService.selectedModule, this.appDataService.selectedChapter);

      // BugFix in if statement: COSMATT-1252
      // Update the timespent on first visit of every section
      setTimeout(() => {
        this.postItemTimeSpentToServer(this.testObject != null);
        if (this.sidebarComponent.tocArr[this.activatedItem['module']]['items'][this.activatedItem['chapter']]['__analytics']['status'] === ItemStatus.NOT_STARTED) {
          this.sidebarComponent
            .tocArr[this.activatedItem['module']]['items'][this.activatedItem['chapter']]['__analytics']['status'] = ItemStatus.INCOMPLETE;
        }
      }, 0);

      this.pageTitle = chapterName;
      this.activatedItem = {
        module: this.appDataService.selectedModule,
        chapter: this.appDataService.selectedChapter
      };

      this.showMarkAsCompleteBtn = this.tocArray[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter]['attribs']['mark-as-complete']['visible'];
      this.markAsCompleteOptions = this.tocService.getMarkAsCompleteOptions(this.appDataService.selectedModule, this.appDataService.selectedChapter);

      if (this.tocArray[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter]['md']) {
        this.preTestObject = false;
        this.testObject = null;
        if (this.tocArray[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter].embedded) {
          this.activityIds = this.mdContentService.activityIds;
        }
        const responses = this.activatedRoute.snapshot.data.mdData;
        this.updatePageContent(responses);
      }
      else if (this.tocArray[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter]['test']) {

        this.preTestObject = false;
        setTimeout(() => {
          this.testObject = this.tocArray[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter];
        }, 0);
      }
    });

    this.routerSub = this.router.events.subscribe(event => {
      if (this.appDataService.getUser()) {

        const itemTracking: boolean = this.tocService.getItemTrackingStatus(this.appDataService.selectedModule, this.appDataService.selectedChapter);

        if ((event instanceof NavigationStart) && itemTracking) {
          // show content loader for content pages only
          if (event.url.includes('/content')) {
            this.loading = true;
            this.appDataService.screenLoader = false;
          }
          if (this.markAsCompleteTimeoutReference) {
            clearTimeout(this.markAsCompleteTimeoutReference);
          }
          if (this.timeSpentPostIntervalRef) {
            clearInterval(this.timeSpentPostIntervalRef);
          }
        } else if (event instanceof NavigationEnd) {
          this.courseDataService.updateLastActivity(this.courseId, this.appDataService.selectedModule, this.appDataService.selectedChapter);
          this.loading = false;
          //this.appDataService.DisplayLOContent = true;
          // Commenting .animate() LOC as it was causing a same-origin-policy SecurityError when app was placed inside an iframe
          // Also, this is dead code and doesn't work anyway.
          // jQuery(this.el.nativeElement).closest('.cosmatt-app').animate({ scrollTop: top }, 0);
          const isTest = (this.testObject !== null);
          this.setTimeSpentPostInterval(isTest);
        }
      }
    });

    this.courseDataService.getStartDate(this.courseId).then(startDate => {
      if (!startDate) {
        this.courseDataService.updateStartDate(this.courseId, Date.now());
      }
    });
  }

  onUnitSystemChanged(unitSystem) {
    this.loading = true;
    this.mdContentService.fetchContent(this.appDataService.selectedModule, this.appDataService.selectedChapter).then((responses) => {
      this.updatePageContent(responses);
      this.loading = false;
    }).catch((er) => {
      this.loading = false;
    });
  }

  updatePageContent(responses: any) {
    this.mdContent = responses[0]['_body'];
    if (responses.length > 1) {
      // const activityDetails = responses[1].json();
      // this.embeddedTestObj = {
      //   secretKey: activityDetails.secretKey,
      //   activityContent: activityDetails.items,
      //   userId: this.appDataService.getUser()['userId'],
      //   productId: this.courseId,
      //   attemptDetails: activityDetails.attemptDetails,
      //   assetsPath: this.productService.getPublicAssetsPath() + '/',
      //   chapterSection: this.tocService.getChapterSectionName(
      //     this.appDataService.selectedModule,
      //     this.appDataService.selectedChapter
      //   )
      // };
      responses.forEach((response, i) => {
        if (i === 0) {
          return;
        } else {
          const responseJson = response.json();
          this.embeddedTestArray.push({
            secretKey: responseJson.secretKey,
            activityContent: responseJson.items,
            userId: this.appDataService.getUser()['userId'],
            productId: this.courseId,
            attemptDetails: responseJson.attemptDetails,
            assetsPath: this.productService.getPublicAssetsPath() + '/',
            chapterSection: this.tocService.getChapterSectionName(
              this.appDataService.selectedModule,
              this.appDataService.selectedChapter
            ),
            embededAttribs: this.tocService.getEmbededAttribs(
              this.appDataService.selectedModule,
              this.appDataService.selectedChapter, responseJson.attemptDetails.activityid
            )
          });
        }
      });
    }
  }

  ngOnDestroy() {
    this.appDataService.setCourseContentDisplayed(false);
    this.sub.unsubscribe();
    this.routerSub.unsubscribe();
    clearInterval(this.timeSpentPostIntervalRef);
  }

  navigateToSection(itemCode) {
    this.sidebarComponent.selectTOCItem(itemCode);
  }

  navigateToChapter({ chapter, section }) {
    this.whiteBlankDivisionForLOLOader.nativeElement.style.display = "block";
    this.whiteBlankDivisionForLOLOader.nativeElement.style.height = 350 + 'px';
    this.loViewerComponent.loaderForLOComponent = true;
    this.navigateToCourse({ chapter, section });
  }

  // Called when navigating to a different section
  navigateToCourse({ chapter, section }) {
    this.loViewerComponent.LearinigObjectivesMap = [];
    if (section == undefined ||section == "-1") {
      this.appDataService.DisplayMDContent = false;
    } else {
      // adding this check so that 'DisplayLOContent' not become 'false' when same chapter clicked multiple times
      if (this.activatedRoute['params']['_value']['chapter'] != section) {
        this.appDataService.DisplayLOContent = false;
      }
      this.appDataService.DisplayMDContent = true;
    }

    const isTest = (this.testObject != null);
    // First, update the time spent of the previous section( section from where we have navigated )
    this.postItemTimeSpentToServer(isTest);
    // Second, set the current chapter and module as per new selection of section
    this.appDataService.selectedChapter = section;
    this.appDataService.selectedModule = chapter;
    if (this.timeOut) {
      clearTimeout(this.timeOut);
    }
    // Third, navigate to the desired chapter/section
    this.timeOut = setTimeout(() => {
      this.router.navigate(['../../', chapter, section], { relativeTo: this.activatedRoute }).then(() => {
      }).catch((error) => {
        console.log(error);
      });
    }, 500);

  }

  nextBtnClicked(e) {
    if (e.target.className.split(' ').indexOf('btn') != -1) {
      e.target.blur();
    } else {
      e.target.parentNode.blur();
    }
    let { module, chapter } = this.navigateChapter('next');
    this.appDataService.gaEventTrack('SERVO_SYSTEM_NEXT_TOPIC');
    if (chapter != undefined && chapter != -1) {
      if (this.sidebarComponent.tocArr[module]['items'][chapter]['__analytics']['status'] === ItemStatus.NOT_STARTED) {
        this.sidebarComponent.tocArr[module]['items'][chapter]['__analytics']['status'] = ItemStatus.INCOMPLETE;
      }
    }
    if (this.tocService.isOnlyChapterSelected(chapter) == null) {
      this.navigateToChapter({ chapter: module, section: chapter });
    } else {
      this.navigateToCourse({ chapter: module, section: chapter });
    }
  }

  prevBtnClicked(e) {
    if (e.target.className.split(' ').indexOf('btn') != -1) {
      e.target.blur();
    } else {
      e.target.parentNode.blur();
    }
    let { module, chapter } = this.navigateChapter('prev');
    this.appDataService.gaEventTrack('SERVO_SYSTEM_PREVIOUS_TOPIC');
    if (chapter != undefined && chapter != -1) {
      if (this.sidebarComponent.tocArr[module]['items'][chapter]['__analytics']['status'] === ItemStatus.NOT_STARTED) {
        this.sidebarComponent.tocArr[module]['items'][chapter]['__analytics']['status'] = ItemStatus.INCOMPLETE;
      }
    }
    //this.navigateToCourse({ chapter: module, section: chapter });
    if (this.tocService.isOnlyChapterSelected(chapter) == null) {
      this.navigateToChapter({ chapter: module, section: chapter });
    } else {
      this.navigateToCourse({ chapter: module, section: chapter });
    }
  }

  getChapterSectionDisplayNumber() {
    const chapterDisplayName = parseInt(this.appDataService.selectedModule, 10) + 1;
    const sectionDisplayName = parseInt(this.appDataService.selectedChapter, 10) + 1;
    return `${chapterDisplayName}.${sectionDisplayName}`;
  }
  getChapterDisplayNumber() {
    const chapterDisplayName = parseInt(this.appDataService.selectedModule, 10) + 1;
    return `${chapterDisplayName}.`;
  }

  submitItemsOnMarkAsComplete(itemCodes) {
    if (this.testObject) {
      this.eomTestComponent.submitOnMarkAsCompleted(itemCodes);
    } else {
      this.mdViewerComponent.submitOnMarkAsCompleted(itemCodes);
    }
  }
  markAsCompleteBtnClicked() {
    if (this.itemCurrentStatus !== ProgressStatus.COMPLETED) {
      this.appDataService.gaEventTrack('SERVO_SYSTEM_MARK_AS_COMPLETE');
      this.markAsCompleteBtnLoading = true;
      const chapter = this.appDataService.selectedModule;
      const section = this.appDataService.selectedChapter;
      if (this.markAsCompleteOptions['auto-complete-on-items'] && this.markAsCompleteOptions['auto-complete-on-items'].length > 0) {
        this.submitItemsOnMarkAsComplete(this.markAsCompleteOptions['auto-complete-on-items']);
      }
      this.itemCurrentStatus = ProgressStatus.COMPLETED;
      this.navigateToCourse({ chapter, section });
      const updatedTimeSpent: number = Date.now() - this.readSessionLastPostTime;
      this.readSessionLastPostTime = Date.now();
      this.markAsComplete(chapter, section, updatedTimeSpent);
    }
  }
  resetCurrentSection() {
    this.appDataService.gaEventTrack('SERVO_SYSTEM_MARK_AS_COMPLETE');
    this.markAsCompleteBtnLoading = true;
    this.loading = true;
    const chapter = this.appDataService.selectedModule;
    const section = this.appDataService.selectedChapter;
    this.readSessionLastPostTime = Date.now();
    this.resetTocAnalytics(chapter, section, ProgressStatus.LAUNCHED);

  }

  // updateSelectedModuleAnalytics(): Promise<any> {
  //   return this.tocService.updateChapterAnalytics(this.appDataService.selectedModule).then(() => {
  //     const completedPercentage = this.tocService.getChapterPercentageCompletion(this.appDataService.selectedModule);
  //     this.sidebarComponent.sidebarTocUpdated({ 'module': this.appDataService.selectedModule, percentage: completedPercentage });
  //     return Promise.resolve();
  //   });
  // }

  navigateChapter(direction) {
    var module = this.appDataService.selectedModule;
    var chapter = this.appDataService.selectedChapter;
    if (direction === 'next') {
      if (chapter < this.tocArray[module]['items'].length - 1) {
        chapter++;
      } else {
        if (module < this.tocArray.length - 1) {
          module++;
          chapter = -1;
        }
      }
    } else if (direction === 'prev') {
      if (chapter > 0) {
        chapter--;
      } else {
        if (module >= 0) {
          if (chapter == -1) {
            if (module == 0) {
              module = 0;
            } else {
              module--;
            }
            chapter = this.tocArray[module]['items'].length - 1;
          } else {
            chapter = -1;
          }
        }
      }
    }

    return {
      'module': module,
      'chapter': chapter
    };
  }

  sideBarToggle(state) {
    this.sidebar = state;
    this.courseDataService.setSidebarStatus(state);
  }
  checkStatusOfAssessmentItems(itemCodes, activityObj?): boolean {
    if (!this.testObject) {
      for(let itemIndex = 0; itemIndex < itemCodes.length; itemIndex++){
        let assessment = this.mdViewerComponent._injectedAssessments.find(assessment => assessment.instance.activityId == itemCodes[itemIndex]['item-code']);
        if (!assessment || assessment.instance.attemptDetails.status !== ProgressStatus.COMPLETED) {
          return false;
        }
      }
    } else {
      for(let itemIndex = 0; itemIndex < itemCodes.length; itemIndex++){
        if (itemCodes[itemIndex]['item-code'] == this.eomTestComponent.activityId) {
          if (activityObj.status !== ProgressStatus.COMPLETED) {
            return false;
          }
        }
      }
    }
    return true;
  }
  eomTestCompleted(activityObj) {
    let markSection = false;
    if (this.markAsCompleteOptions['auto-complete-on-items'] && this.markAsCompleteOptions['auto-complete-on-items'].length > 0) {
      markSection = this.checkStatusOfAssessmentItems(this.markAsCompleteOptions['auto-complete-on-items'], activityObj);
    }

    if (activityObj.status === ProgressStatus.COMPLETED && markSection) {
      this.itemCurrentStatus = ProgressStatus.COMPLETED;
      if (activityObj.isEmbeddedTest) {
        this.updateTocAnalytics(activityObj.chapter, activityObj.section, ProgressStatus.COMPLETED);
      } else {
        this.updateTocAnalytics(activityObj.chapter, activityObj.section, ProgressStatus.SUBMITTED);
      }
    }
  }

  updateTocAnalytics(chapter, section, status) {
    this.navigateToCourse({ chapter, section });
    this.readSessionLastPostTime = Date.now();

    const itemCode: string = this.tocService.getItemCode(chapter, section);
    //this.sidebarComponent.sidebarTocUpdated({ chapter, section, status: ItemStatus.COMPLETED });
    this.progressService.postAttemptStatement(itemCode, status).then(data => {
      this.tocService.updateAnalytics(this.appDataService.selectedModule, this.appDataService.selectedChapter, ).then((updatedTOC) => {
        this.sidebarComponent.sidebarTocUpdated({
          chapter, section,
          percentage: updatedTOC[chapter].__analytics.percentageCompletion,
          status: ItemStatus.COMPLETED
        });
        //comminting the learning objective api as its deprecated now.
        // TODO: find another alternative approach for this feature
        // if (this.testObject && this.testObject.name === 'Pre-test') {
        //   this.updatePretestLinkedSections(this.testObject['item-code']);
        // }
        this.markAsCompleteBtnLoading = false;
      });
    }).catch(err => {
      console.error(err);
    });
  }
  resetTocAnalytics(chapter, section, status) {
    const itemCode: string = this.tocService.getItemCode(chapter, section);
    this.progressService.postAttemptStatement(itemCode, status).then(data => {
      this.tocService.updateAnalytics(this.appDataService.selectedModule, this.appDataService.selectedChapter, ).then((updatedTOC) => {
        this.sidebarComponent.sidebarTocUpdated({
          chapter, section,
          percentage: updatedTOC[chapter].__analytics.percentageCompletion,
          status: ItemStatus.INCOMPLETE
        });
        this.itemCurrentStatus = ProgressStatus.INCOMPLETE;
        this.markAsCompleteBtnLoading = false;
        this.loading = false;
      });
    }).catch(err => {
      console.error(err);
    });
  }

  /**
   * Updates timeSpent of the USER linked with MODULE/CHAPTER
   * Gets called on first and subsequent section visits
   * Also called automatically every 30 seconds (or as specified by appDataService.itemTimeSpentPostInterval)
   * @param isTest : If the selected module/chapter combo is an assessment
   */
  private postItemTimeSpentToServer(isTest: boolean): void {
    const itemStatus: string = this.tocService.getItemStatus(this.appDataService.selectedModule, this.appDataService.selectedChapter);
    const chapterItemCode: string = this.tocService.getItemCode(this.appDataService.selectedModule, this.appDataService.selectedChapter);
    const updatedTimeSpent: number = Date.now() - this.readSessionLastPostTime;
    this.readSessionLastPostTime = Date.now();
    let attemptstate = ProgressStatus.INTERACTED;
    if (this.itemCurrentStatus === ProgressStatus.COMPLETED || itemStatus === ProgressStatus.COMPLETED) {
      attemptstate = isTest ? ProgressStatus.SUBMITTED : ProgressStatus.COMPLETED;
    }
    this.progressService.postAttemptStatement(chapterItemCode, attemptstate, updatedTimeSpent).then((result) => {
      // New analytics should not be fetched when page / chapter selection is changed. commented below line of code to impreve the page loading time.
      //this.tocService.updateAnalytics(this.appDataService.selectedModule, this.appDataService.selectedChapter);
    }).catch(err => console.error(err));
  }

  /**
   * Sets analytics time update timer to 30 seconds (or as specified by appDataService.itemTimeSpentPostInterval)
   * @param isTest : If the selected module/chapter combo is an assessment
   */
  private setTimeSpentPostInterval(isTest: boolean): void {
    this.timeSpentPostIntervalRef = setInterval(() => {
      if (this.appDataService.getUser()) {
        const itemTracking: boolean = this.tocService.getItemTrackingStatus(this.appDataService.selectedModule, this.appDataService.selectedChapter);
        if (itemTracking) {
          this.postItemTimeSpentToServer(isTest);
        }
      }
    }, this.appDataService.getitemTimeSpentInterval());
  }

  public onCheckMyWorkClicked(activityId: string) {
    // if summative set as answered else if formattive set as interactive
    if (this.testObject) {
      this.progressService.postAttemptStatement(activityId, ProgressStatus.ANSWERED);
    } else {
      this.progressService.postAttemptStatement(activityId, ProgressStatus.INTERACTED);
    }
  }
  markAsComplete(chapter, section, updatedTimeSpent) {
    this.updateTocAnalytics(chapter, section, ProgressStatus.COMPLETED);
  }

  public updatePretestLinkedSections(itemCode: string) {
    this.progressService.getLearningObjectiveQuestionProgress(itemCode).then((learningObjectives) => {
      for (const key in learningObjectives) {
        if (learningObjectives.hasOwnProperty(key)) {
          const status: any = learningObjectives[key].status;
          if (status.correct === status.total) {
            const sections = this.findLearningObjectiveLinkedSections(key);
            for (const section of sections) {
              const itemStatus: string = this.tocService.getItemStatus(this.appDataService.selectedModule, section);
              if (itemStatus !== ProgressStatus.COMPLETED) {
                this.markAsComplete(this.appDataService.selectedModule, section, 0);
              }
            }
          }
        }
      }
    });
  }
  private findLearningObjectiveLinkedSections(learningObjective) {
    const chapterSections = this.tocArray[this.appDataService.selectedModule]['items'];
    const sections = [];
    for (let index = 0; index < chapterSections.length; index++) {
      const learningObjectives = chapterSections[index]['learning-objectives'];
      if (learningObjectives.includes(learningObjective)) {
        sections.push(index);
      }
    }
    return sections;
  }
  private loadSectionOnItemComplete() {
    this.loading = true;
    this.mdContentService.fetchMDContent(this.appDataService.selectedModule, this.appDataService.selectedChapter, true).then(response => {
      if (this.tocArray[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter].embedded) {
        this.activityIds = this.mdContentService.activityIds;
      }
      const responses = response;
      this.updatePageContent(responses);
    }).catch(err => {
      this.loading = false;
      console.log(err);
    })
  }
}
