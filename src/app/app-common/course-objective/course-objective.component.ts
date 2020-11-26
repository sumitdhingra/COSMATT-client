import 'jquery-slimscroll';
import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
@Component({
  selector: 'app-course-objective',
  templateUrl: './course-objective.component.html',
  styleUrls: ['./course-objective.component.scss']
})
export class CourseObjectiveComponent implements OnInit {
  domEle: ElementRef;
  $el: any;
  @Input() courseId: any;
  @Input() courseObjective: any;
  courseObjList: Array<String>;
  leftCourseObj: Array<String>;
  rightCourseObj: Array<String>;
  tooltip: String;
  constructor(domEle: ElementRef) {
    this.domEle = domEle;
    this.$el = jQuery(domEle.nativeElement);
    this.tooltip = 'Show More';
  }

  ngOnInit() {
    if ( Array.isArray(this.courseObjective) ) {
      this.courseObjList = this.courseObjective;
    } else {
      this.courseObjList = Object.keys(this.courseObjective);
    }
    let length = this.courseObjList.length;
    let middle = Math.ceil(length / 2);
    this.leftCourseObj = this.courseObjList.slice(0, middle);
    this.rightCourseObj = this.courseObjList.slice(middle, length);
  };

}
