import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.scss']
})
export class QuestionComponent implements OnInit {
  @Input() quesData: any;
  @Input() quesIndex: number;
  @Input() responses: any;
  constructor() { }

  ngOnInit() {
     console.log(this.responses);
  }

  optionSelected(e) {
    this.responses[this.quesIndex]['response'] = e.target.value;
    this.responses[this.quesIndex]['quesState'] = 'attempted';
    this.responses[this.quesIndex]['isAnsweredCorrectly'] = this.quesData.correctAns === e.target.value;
  }

  getResponseStatus() {
    if (this.responses[this.quesIndex].isAnsweredCorrectly) {
      return {
        'alertClass': 'alert-success',
        'msg': 'Correct: '
      };
    }
    return {
      'alertClass': 'alert-danger',
      'msg': 'Incorrect: '
    };
  }
}
