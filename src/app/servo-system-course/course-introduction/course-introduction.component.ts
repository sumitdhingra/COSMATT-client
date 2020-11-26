import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseDataService } from '../services/course-data.service';
import { AppDataService, UserType } from '../../services/app-data.service';
import { ProductService } from '../services/product.service';
import { CourseIntroductionService } from './course-introduction.service';
import { TocResolveService } from '../services/toc-resolve.service';
import { TocService } from '../services/toc.service';
declare const Stickyfill: any;
@Component({
  selector: 'app-course-introduction',
  templateUrl: './course-introduction.component.html',
  styleUrls: ['./course-introduction.component.scss']
})
export class CourseIntroductionComponent implements OnInit {
  courseJsonData: any;
  aboutCourseMdContent = "";
  forewordMdContent = '';
  courseObjective: Array<any>;
  courseAuthors: string;
  userType = UserType;
  tocArray: any;
  titleData: any;
  currentTab: string;
  courseLeftMenu: Array<any>;
  scrollCheck: boolean = false;
  constructor(private activatedRoute: ActivatedRoute,
    private courseDataService: CourseDataService,
    private router: Router,
    public appDataService: AppDataService,
    public productService: ProductService,
    private tocService: TocService,
    private courseIntroductionService: CourseIntroductionService) {
    this.tocService.fetchToc(true, true, true, this.courseDataService.getProductId())
      .then((toc) => {
        this.tocArray = toc;
      });
  }

  ngOnInit() {
    this.appDataService.setPageTitle('Introduction');
    const courseId = this.courseDataService.getProductId();
    this.aboutCourseMdContent = this.courseIntroductionService.getAboutCourseData();
    this.forewordMdContent = this.courseIntroductionService.getForewordData();
    this.courseObjective = this.productService.getObjectives();

    this.courseAuthors = this.courseIntroductionService.getAuthorsData();
    this.titleData = this.courseIntroductionService.getTitleData();
    this.courseLeftMenu = this.courseIntroductionService.getLeftMenu();
    $(window).on('scroll', () => {
      var elements = document.querySelectorAll('.sticky');
      Stickyfill.add(elements);
      if (this.scrollCheck === true) {
        this.scrollCheck = false;
        return;
      }
      else {
        const scrollDistance = $(window).scrollTop();
        // Assign active class to nav links while scolling
        $('.page-section').each(function (i) {
          if (($(this).position().top - 200) <= scrollDistance) {
           $('.left-nav-sidebar').find('a.nav-link.active').removeClass('active');
           $('.left-nav-sidebar').find('a.nav-link').eq(i).addClass('active');
           $('.left-nav-sidebar').find('li.active').removeClass('active');
           $("a.active").parents('li').addClass('active');
          }
        });
      }

    });
  };

  getStartedBtnClicked(e) {
    if (this.appDataService.getUserType() === UserType.NewUser) {
      this.appDataService.gaEventTrack('SERVO_SYSTEM_LETS_BEGIN');
    } else if (this.appDataService.getUserType() === UserType.ExistingUser) {
      this.appDataService.gaEventTrack('SERVO_SYSTEM_CONTINUE');
    }
    const courseId = this.courseDataService.getProductId();
    this.courseDataService.getLastActivity(courseId)
      .then((lastVisited) => {
        if (!lastVisited) {
          lastVisited = {
            chapter: 0,
            section: 0
          }
        }
        this.appDataService.selectedModule = lastVisited.chapter;
        this.appDataService.selectedChapter = lastVisited.section;
        this.router.navigate(['../content', lastVisited.chapter, lastVisited.section], { relativeTo: this.activatedRoute });
      })
    
  }
  switchSection(e) {
    this.scrollCheck = true;
    this.currentTab = e.target.id;

    const target = document.getElementById(jQuery(e.target).attr('data-target'));

    jQuery('html, body').animate({
      scrollTop: jQuery(target).offset().top - 150
    }, 0, function () {
      jQuery('.nav-link').each((i, elem) => jQuery(elem).removeClass('active'));
      jQuery(e.target).addClass('active');

     $('.left-nav-sidebar').find('li.active').removeClass('active');
     $("a.active").parents('li').addClass('active');
    });


  }


}
