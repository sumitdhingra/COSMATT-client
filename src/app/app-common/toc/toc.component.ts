import 'jquery-slimscroll';
import { Component, OnInit, AfterViewInit, ElementRef, Input, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppDataService } from '../../services/app-data.service';

declare let jQuery: any;

@Component({
  selector: 'app-toc',
  templateUrl: './toc.component.html',
  styleUrls: ['./toc.component.scss']
})
export class TocComponent implements OnInit, AfterViewInit, OnChanges {
  @Input() tocArr: Object;
  @Input() activatedItem: Object;
  @Output() sidebarClosed = new EventEmitter<any>();
  @Output() sectionClicked = new EventEmitter<any>();
  @Output() chapterClicked = new EventEmitter<any>();
  el: ElementRef;
  $el: any;
  collapseList: any;
  timeOut: any;

  constructor(el: ElementRef,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public appDataService: AppDataService) {
    this.$el = jQuery(el.nativeElement);
  }

  ngOnInit() {
    jQuery(window).on('sn:resize', this.initSidebarScroll.bind(this));
  }

  ngAfterViewInit() {
    // draw pie chart
    // this.$el.find('.chart').easyPieChart({
    //   barColor: '#F2BE35',
    //   trackColor: '#555',
    //   scaleColor: false,
    //   lineWidth: 2,
    //   lineCap: 'butt',
    //   size: 28,
    //   animate: 800
    // });

    this.collapseList = jQuery(this.$el).find('.chapter-container');
    //initial selected
    jQuery(this.$el).on('show.bs.collapse', (e) => {
      this.collapseList.collapse('hide');
      //   let $ele = jQuery(e.target.parentElement);
      //   $ele.find('.fa-plus').removeClass('fa-plus').addClass('fa-minus');
      //   $ele.find('.collapse-toggle').attr('ng-reflect-tooltip', 'Collapse');
      //   $ele.find('.collapse-toggle').attr('tooltip', 'Collapse');
    });

    // jQuery(this.$el).on('hide.bs.collapse', (e) => {
    //   let $ele = jQuery(e.target.parentElement);
    //   $ele.find('.fa-minus').removeClass('fa-minus').addClass('fa-plus');
    //   $ele.find('.collapse-toggle').attr('ng-reflect-tooltip', 'Expand');
    //   $ele.find('.collapse-toggle').attr('tooltip', 'Expand');
    // });

    jQuery(this.$el).on('shown.bs.collapse', (e) => {
      this.updateScrollOnCollapse(e);
    });
    jQuery(this.$el).on('hidden.bs.collapse', (e) => {
      //this.initSidebarScroll();
    });
    this.collapseList.eq(this.activatedItem['module']).collapse('show');
    this.initSidebarScroll();
  }

  initSidebarScroll(): void {
    let $sidebarContent = this.$el.find('.js-sidebar-content');
    const $titleText = this.$el.find('.title-text');
    // Calculate the height of slimScroll according to the Menu title element's height.
    let slimScrollOffset = 100;
    if ( $titleText.length ) {
      slimScrollOffset = $titleText.outerHeight() + 84;
    }

    if (this.$el.find('.slimScrollDiv').length !== 0) {
      $sidebarContent.slimscroll({
        destroy: true
      });
    }
    $sidebarContent.slimscroll({
      height: window.innerHeight - slimScrollOffset,
      size: '8px',
      alwaysVisible: true,
      railVisible: true,
      railOpacity: 0.0
    });
    // Bind event to scroll using rail
    this.$el.find('.slimScrollRail').click( e => {
      const $scrollBar = this.$el.find('.slimScrollBar');
      // const $scrollRail = jQuery(e.target);

      const scrollBarHeight = $scrollBar.height();
      // const scrollRailHeight = $scrollRail.height();

      let scrollDistance = e.offsetY - scrollBarHeight;
      if ( scrollDistance < 0 ) {
        scrollDistance = scrollDistance / 2;
      }
      console.log('Scroll distance ', scrollDistance);
      jQuery('.js-sidebar-content').slimScroll({ scrollBy: scrollDistance});
    });
  }

  updateScrollOnCollapse(event): void {
    let scrollDistance;
    let elemTopRelativeScreen = jQuery("a[aria-expanded='true']").parent().position().top;
    let elemTopRelativeToc = event.target.offsetTop;
    if(elemTopRelativeScreen < 0) {
      scrollDistance = elemTopRelativeToc + elemTopRelativeScreen - 46;
      jQuery('.js-sidebar-content').slimScroll({ scrollTo: scrollDistance});
    }
  }

  onResize(event) {
    this.$el.find('.slimScrollRail').unbind('click');
    this.initSidebarScroll();
  }

  tocItemClicked(chapter, section) {
    this.appDataService.gaEventTrack('SERVO_SYSTEM_TOC_CHAPTER_SECTION');
    if (this.tocArr[chapter]['items'][section]['__analytics']['status'] === 'not_started') {
      this.tocArr[chapter]['items'][section]['__analytics']['status'] = 'in_complete';

    }
    this.sectionClicked.emit({ chapter, section });
  }

  tocModuleClicked(chapter, section) {
    //Applying check so that following block is executed only when user switches to chapter, either from any section or any other chapter.
    //this.appDataService.selectedChapter != section --> When user switches from section of a chapter to the same chapter.
    //this.appDataService.selectedModule != chapter --> When user switches from one chapter to another chapter
    if((this.appDataService.selectedModule != chapter) || (this.appDataService.selectedChapter != section)){
      this.chapterClicked.emit({chapter, section});
    }
  }

  tocPercentageUpdated(obj) {
    this.tocArr[obj.module].__analytics.percentageCompletion = obj.percentage;
    this.$el.find('.module').eq(obj.module).find('.icon .chart').data('easyPieChart').update(obj.percentage);
  }

  tocItemStatusUpdated(obj) {
    this.tocArr[obj.chapter]['items'][obj.section]['__analytics'].status = obj.status;
    if (obj.percentage) {
      this.tocArr[obj.chapter].__analytics.percentageCompletion = obj.percentage;
    }
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if (changes['activatedItem'] && !changes['activatedItem']['firstChange']) {
      if (changes['activatedItem']['currentValue']['module'] !== undefined) {
        // to disable the reopening of list containing sections of a chapter when user switches from any section of a the chapter to the chapter.
        //this.collapseList.eq(changes['activatedItem']['currentValue']['module']).collapse('show');
      }
    }
  }

  closeSideMenu() {
    this.sidebarClosed.emit(true);
  }

  selectTOCItem(itemCode) {
    var id = itemCode.replace("/", "\\/");
    var $sectionItem = jQuery(".js-sidebar-content").find("#" + id);
    $sectionItem.find("a.section-item")[0].click();
  }
}
