import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
let marked = require('marked/lib/marked.js');
@Component({
  selector: 'app-course-foreword',
  templateUrl: './course-foreword.component.html',
  styleUrls: ['./course-foreword.component.scss']
})
export class CourseForewordComponent implements OnInit {
  @Input() publicAssetsPath: any;
  @Input() mdContent: string;
  domEle: ElementRef;
  $el: any;
  htmlContent: any;
  constructor(domEle: ElementRef) {
    this.domEle = domEle;
    this.$el = jQuery(domEle.nativeElement);
  }

  ngOnInit() {
   this.htmlContent = marked(this.mdContent);
  };

}
