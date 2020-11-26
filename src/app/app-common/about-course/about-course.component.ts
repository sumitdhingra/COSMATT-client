import 'jquery-slimscroll';
import { Component, OnInit, ElementRef, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
let marked = require('marked/lib/marked.js');

@Component({
  selector: 'app-about-course',
  templateUrl: './about-course.component.html',
  styleUrls: ['./about-course.component.scss']
})
export class AboutCourseComponent implements OnInit {
  @Input() courseId: any;
  @Input() mdContent: string;
  @Input() courseObjective: string;
  domEle: ElementRef;
  $el: any;
  paragraph1: string;
  paragraph2: string;
  totalReview: string;
  rating: string;
  tooltip: String;
  htmlContent: any;
  constructor(domEle: ElementRef) {
    this.domEle = domEle;
    this.$el = jQuery(domEle.nativeElement);
    this.tooltip = 'Show More';
  }
  ngOnInit() {
    this.htmlContent = marked(this.mdContent);
  };
}
