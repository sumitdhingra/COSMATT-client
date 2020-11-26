// import { Component, OnInit, ElementRef, Input } from '@angular/core';
// import { PretestService } from '../services/pretest.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { AppDataService } from '../../services/app-data.service';

// @Component({
//   selector: 'app-pre-test',
//   templateUrl: './pre-test.component.html',
//   styleUrls: ['./pre-test.component.scss']
// })
// export class PreTestComponent implements OnInit {
//   assessmentContent: any;
//   $el: any;
//   domEle: ElementRef;
//   @Input() preTestObject;
//   constructor(private pretestService: PretestService,
//     private router: Router,
//     private activatedRoute: ActivatedRoute,
//     domEle: ElementRef,
//     private appDataService: AppDataService) {
//     this.$el = jQuery(domEle.nativeElement);
//   }

//   ngOnInit() {
//     // this.assessmentContent = this.activatedRoute.snapshot.data['assessmentContent'];
//     // console.log('this.preTestObject', this.preTestObject);
//     this.pretestService.getAssessmentContent()
//       .then((data) => {
//         this.assessmentContent = data;
//       });
//   }

//   onResponse(responses, questions) {
//     this.pretestService.setPreTestResponses(responses);
//     this.$el.find('#reportModal').modal('show');
//   }

//   skipPreTest() {
//     console.log('PreTest Skipped');
//     this.router.navigate(['../../0/2'], { relativeTo: this.activatedRoute });
//   }

//   dialogSubmitClicked() {
//     this.appDataService.setPretestFlag(true);
//     // this.router.navigate(['../pretest-report'], { relativeTo: this.activatedRoute });
//     this.preTestObject['__analytics']['attempted'] = true;
//   }

//   dialogCancelClicked() {
//     this.appDataService.setPretestFlag(true);
//   }
// }
