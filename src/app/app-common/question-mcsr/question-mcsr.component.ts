// import { Component, OnInit, Input } from '@angular/core';

// @Component({
//   selector: 'app-question-mcsr',
//   templateUrl: './question-mcsr.component.html',
//   styleUrls: ['./question-mcsr.component.scss']
// })
// export class QuestionMcsrComponent implements OnInit {

//   @Input() quesData: any;
//   @Input() quesIndex: number;
//   @Input() responses: any;
//   constructor() { }
//   questionType : any;
//   questionText : any;
//   ngOnInit() {
//     this.questionType = this.quesData.content.canvas.layout;
//     this.questionText = this.quesData.content.canvas.data.questiondata[0].text;
//      console.log(this.questionType);
//   }

//   optionSelected(e) {
//     this.responses[this.quesIndex]['userResponse'] = e.target.value;
//     this.responses[this.quesIndex]['quesState'] = 'attempted';
//     this.responses[this.quesIndex]['isAnsweredCorrectly'] = this.quesData.responses.i1.correct == e.target.value;
//   }

// }
