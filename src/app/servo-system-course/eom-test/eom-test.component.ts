import { Component, OnInit, Input, Output, EventEmitter, ViewChild, } from '@angular/core';
import { ActivityService } from '../services/activity.service';
// import { ActivatedRoute, Router } from '@angular/router';
import { AppDataService } from '../../services/app-data.service';
import { CourseDataService } from '../services/course-data.service';
import { ProductService } from '../services/product.service';
import { TocService } from '../services/toc.service';
import { AssessmentConfig } from '../../app-common/assessment/assessment-config';
import { AssessmentType } from '../../app-common/assessment/assessment-type.enum';
import { AssessmentSubType } from '../../app-common/assessment/assessment-subtype.enum';
import {AssessmentComponent} from '../../app-common/assessment/assessment.component'

@Component({
  selector: 'app-eom-test',
  templateUrl: './eom-test.component.html',
  styleUrls: ['./eom-test.component.scss']
})
export class EomTestComponent implements OnInit {
  assessmentContent: any;
  // $el: any;
  // domEle: ElementRef;
  @Input() testObject: Object;
  @Output() onTestSubmit = new EventEmitter();
  @Output() onCheckMyWorkClicked = new EventEmitter();
  activityData: any;
  activityId: any;
  loading: boolean;

  // assessment config to be used in HTML binding
  assessmentConfig = new AssessmentConfig(AssessmentType.Summative, AssessmentSubType.EndOfSection);

  @ViewChild(AssessmentComponent)
  private assessmentComponent: AssessmentComponent;

  constructor(
    // private router: Router,
    // private activatedRoute: ActivatedRoute,
    // domEle: ElementRef,
    private activityService: ActivityService,
    private appDataService: AppDataService,
    private productService: ProductService,
    private tocService: TocService,
    private courseDataService: CourseDataService) {
    // this.$el = jQuery(domEle.nativeElement);
  }

  ngOnInit() {
    this.loading = true;
    this.activityId = this.testObject['item-code'];
    this.activityService.getActivity(this.activityId)
      .then((responses) => {
        responses = responses.json();
        this.loading = false;
        this.activityData = {
          secretKey: responses.secretKey,
          activityContent: responses.items,
          userId: this.appDataService.getUser()['userId'],
          productId: this.courseDataService.getProductId(),
          attemptDetails: responses.attemptDetails,
          assetsPath: this.productService.getPublicAssetsPath() + '/',
          chapterSection: this.tocService.getChapterSectionName(
            this.appDataService.selectedModule,
            this.appDataService.selectedChapter
          ),
          embededAttribs: {"isTest": true}
        };
      });
  }

  onAssessmentSubmit(data) {
    console.log('assessment submitted');
   /* Below code comitted to fix issue: COSMATT-1306. We have updated signature of function updateTocAnalytics in content-page.component.ts.
   so now we need to pass index of chapter and section instead of activityId*/
  //this.onTestSubmit.emit({ 'activityId': this.activityId, 'status': status });
   this.onTestSubmit.emit({ 'chapter': this.appDataService.selectedModule, 'section': this.appDataService.selectedChapter,'status': data.status });
  }
  public submitOnMarkAsCompleted(itemCodes){
    itemCodes.forEach(element => {
      this.assessmentComponent.submitTestOnMarkAsCompleted();
    });
  }
  public onCheckMyWork(event) {
    this.onCheckMyWorkClicked.emit(event);
  }
}
