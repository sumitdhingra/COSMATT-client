
import { AppDataService } from 'app/services/app-data.service';
import { Component, OnInit, Input } from '@angular/core';
import { UtilsService } from './../../services/utils.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-chapter-progress-viewer',
  templateUrl: './chapter-progress-viewer.component.html',
  styleUrls: ['./chapter-progress-viewer.component.scss']
})
export class ChapterProgressViewerComponent implements OnInit {
  @Input() chapterSectionAnalytics;
  @Input() progressList;
  @Input() totalStudents;
  @Input() userRole;
  constructor(private utilsService: UtilsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private appDataService: AppDataService ) { }
  
  ngOnInit() {
    this.bindEvents();
  }

  // Helper function to split:
  // XX days YY hrs ZZ mins ---> [XX, days, YY, hrs, ZZ, mins]
  splitTimeString(timeString:string) {
    return timeString.match(new RegExp('\\d+|\\w+', 'g'));
  }

  sectionItemClicked(chapter, section) {
    console.log(chapter,section);
    this.router.navigate(['../content', chapter, section], { relativeTo: this.activatedRoute });
  }

  bindEvents() {
    jQuery('#chapterProgressAccordion').on('show.bs.collapse', function(e) {
      // jQuery(e.target).parents('.card').addClass('bt br bl bb');
      // console.log(e.target);
      jQuery(e.target).siblings('.card-header').css({'background-color': '#efefef'});
    })
    jQuery('#chapterProgressAccordion').on('hidden.bs.collapse', function(e) {
      // jQuery(e.target).parents('.card').removeClass('bt br bl bb');
      jQuery(e.target).siblings('.card-header').css({'background-color': '#ffffff'});
    })
  }
}
