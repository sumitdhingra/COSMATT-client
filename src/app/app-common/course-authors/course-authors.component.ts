import { Component, OnInit, AfterViewInit, ElementRef, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'jquery.dotdotdot/src/js/jquery.dotdotdot';
import { ModalComponent } from '../../app-common/modal/modal.component';
const marked = require('marked/lib/marked.js');
declare var jQuery: any;

@Component({
  selector: 'app-course-authors',
  templateUrl: './course-authors.component.html',
  styleUrls: ['./course-authors.component.scss']
})
export class CourseAuthorsComponent extends ModalComponent implements OnInit, AfterViewInit  {
  @Input() courseId: any;
  @Input() courseAuthors: any;
  @Input() publicAssetsPath: any;
  @Input() titleData: any;
  domEle: ElementRef;
  $el: any;
  clicked: any;
  currentTragetEle: any;
  selectedIndex = 0;
  authorBio: any;
  courseAuthorDetails: any;
  authorName:Array<any>;
  showAuthorTitle: boolean = false;
  constructor(private router: Router, private activatedRoute: ActivatedRoute, domEle: ElementRef) {
    super(domEle);
    this.domEle = domEle;
    this.$el = jQuery(domEle.nativeElement);

  }

  ngOnInit() {
    this.clicked = false;
    this.currentTragetEle = null;
    let showAuthorProfileCount = 0;
    this.$el.find('ul.nav-tabs').addClass('nav-tabs-bottom');
    for (let author of this.courseAuthors) {
      if (author.showprofile) showAuthorProfileCount++;
      author['bio'] = marked(author.mdContent);
    };
    if (showAuthorProfileCount > 0) this.showAuthorTitle = true;

  };

  ngAfterViewInit() {

    this.$el.find('.description').dotdotdot({
      watch: true,
      height: 100,
    });
  };

  showAuthDetails(index:any) {
  
    this.courseAuthorDetails = index;
    this.$el.find('#appModal').modal('show');
  }

}
