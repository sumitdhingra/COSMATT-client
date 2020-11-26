import { Component, OnInit, ViewChild, Output, EventEmitter} from '@angular/core';
import { ClassDataService } from 'app/servo-system-course/services/class-data.service';

@Component({
  selector: 'app-students-summary',
  templateUrl: './students-summary.component.html',
  styleUrls: ['./students-summary.component.scss']
})
export class StudentsSummaryComponent implements OnInit {
  rows = new Array<any>();
  columns = [
    { prop: 'index', sort: true, name: '#'},
    { prop: 'name', sort: true, search: true}, 
    { prop: 'status', sort: true}, 
    { prop: 'average', name: 'Average Completion', sort: true},
    { prop: 'average', name: "Progress", sort: true}, 
    { prop: 'timespent', name: "Total Time Spent", sort: true},
    { prop: 'uuid', name: ''}
  ];
  

  @Output() onViewAnalytics = new EventEmitter<any>();

  isViewAnalyticsMode: Boolean = false;
  currentStudentSelected: any = null;
  classAverageCompletion: number;
  maxCompletion: number = 0;

  constructor(private classDataService: ClassDataService) {
    this.rows = this.classDataService.StudentsEnrolledStats['students'];
    this.classAverageCompletion = Math.round(this.classDataService.ClassAverageCompletion);
    this.rows = this.rows.map((row, index) => {
      row['index'] = index + 1;
      return row;
    })
    //finding max completion among all students
    for(let idx = 0; idx < this.rows.length; idx++) {
      if(this.rows[idx].average > this.maxCompletion) {
        this.maxCompletion = this.rows[idx].average;
      }
    }
  } 

  ngOnInit() {
  }

  onViewAnalyticsClick (value) {
    this.onViewAnalytics.emit(value);
  }
}