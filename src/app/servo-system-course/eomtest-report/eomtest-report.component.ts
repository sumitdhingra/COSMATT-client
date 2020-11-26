// import { Component, OnInit } from '@angular/core';
// import { PretestService } from '../services/pretest.service';
// import { ActivatedRoute, Router } from '@angular/router';
// import { ActivityService } from '../services/activity.service';

// @Component({
//   selector: 'app-eomtest-report',
//   templateUrl: './eomtest-report.component.html',
//   styleUrls: ['./eomtest-report.component.scss']
// })
// export class EomtestReportComponent implements OnInit {

//   preTestResponses: any;
//   eomTestResponse: any;
//   attemptedQues = 0;
//   correctQues = 0;
//   incorrectQues = 0;
//   totalQuestions = 0;
//   grade = 0;
//   constructor(private pretestService: PretestService,
//     private router: Router,
//     private activatedRoute: ActivatedRoute,private activityService: ActivityService) { }

//   ngOnInit() {
//     // this.assessmentContent = this.pretestService.getAssessmentContent();

//     this.eomTestResponse = this.activityService.getPracticeResponses();
    
//     this.evaluateResult(this.eomTestResponse);
//   }

//   evaluateResult(responses) {
//     let i = 0;
    

//     // for (let [i, ques] of questions.entries()) {
//     for (let ques of responses.assessment) {
      
//       if (responses.assessment[i].quesState) {
//         this.attemptedQues++;
//         if (ques.isAnsweredCorrectly) {
//           this.correctQues++;
//         } else {
//           this.incorrectQues++;
//         }
//       }
//       i++;
//     }
//     this.totalQuestions = this.eomTestResponse.assessment.length;
//     this.grade = (this.correctQues * 100 ) / this.totalQuestions;
//   }

//   goToCourseClicked() {
//     this.router.navigate(['../../2/0'], { relativeTo: this.activatedRoute });
//   }

// }
