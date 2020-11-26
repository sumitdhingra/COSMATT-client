// import { Component, OnInit } from '@angular/core';
// import { PretestService } from '../services/pretest.service';
// import { ActivatedRoute, Router } from '@angular/router';

// @Component({
//   selector: 'app-pretest-report',
//   templateUrl: './pretest-report.component.html',
//   styleUrls: ['./pretest-report.component.scss']
// })
// export class PreTestReportComponent implements OnInit {
//   // assessmentContent: any;
//   preTestResponses: any;
//   attemptedQues = 0;
//   correctQues = 0;
//   incorrectQues = 0;
//   constructor(private pretestService: PretestService,
//     private router: Router,
//     private activatedRoute: ActivatedRoute) { }

//   ngOnInit() {
//     // this.assessmentContent = this.pretestService.getAssessmentContent();
//     this.preTestResponses = this.pretestService.getPreTestResponses();
//     this.evaluateResult(this.preTestResponses);
//   }

//   evaluateResult(responses) {
//     let i = 0;
//     // for (let [i, ques] of questions.entries()) {
//     for (let ques of responses) {
//       if (responses[i].quesState) {
//         this.attemptedQues++;
//         if (ques.isAnsweredCorrectly) {
//           this.correctQues++;
//         } else {
//           this.incorrectQues++;
//         }
//       }
//       i++;
//     }
//   }

//   goToCourseClicked() {
//     this.router.navigate(['../../0/2'], { relativeTo: this.activatedRoute });
//   }
// }
