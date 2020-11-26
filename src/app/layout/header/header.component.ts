import { ClassDataService } from './../../servo-system-course/services/class-data.service';
import { CourseDataService } from './../../servo-system-course/services/course-data.service';
import { Component, OnInit, Output, EventEmitter, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { AppDataService, UserRole, AppMode } from '../../services/app-data.service';
import { AuthService } from '../../services/auth.service';
import { ModalComponent } from '../../app-common/modal/modal.component';
import { ModalService } from './../../app-common/modal/modal.service';
// import { SaveToDiskService } from '../../file-store/services/save-to-disk.service';

declare const Userback: any;
declare const jQuery: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, AfterViewInit {

  @Input() userGuidePath: string;

  user: any;
  colorThemes = ['red', 'blue', 'green'];
  public unitSystem = { metric: 'metric', imperial: 'imperial' };
  selectedColor: Number;
  showDashboard = {
    about: false,
    progress: false,
    setting:false,
    theme: false,
    resetSection: false
  };
  showCourseLogo = false;
  dashboardRoute: string;
  AppMode = AppMode;
  appMode: string;
  $el: any;
  UserRole = UserRole;
  courseLogoPath: string;

  constructor(private router: Router,
    private activatedRoute: ActivatedRoute,
    public appDataService: AppDataService,
    private authService: AuthService,
    public location: Location,
    private courseDataService: CourseDataService,
    public modalService: ModalService,
    private el: ElementRef,
    private classDataService: ClassDataService
    // public saveToDiskService: SaveToDiskService
  ) {
    this.$el = jQuery(el.nativeElement);
    this.router.events.subscribe(() => this.routeChanged());
    appDataService.themeChanged$.subscribe(theme => this.onthemeChanged(theme));
  }

  ngOnInit(): void {
    this.user = this.appDataService.getUser();
    let themeColor = this.appDataService.getThemeColor();
    this.selectedColor = this.colorThemes.indexOf(themeColor);
  }

  ngAfterViewInit() {
    this.$el.on('click', 'a#settings-drop-down', (e) => {
      const $dropdownAnchor = jQuery(e.target);
      $dropdownAnchor.next('.dropdown-menu').toggleClass('show');
      e.stopPropagation();
    });

    this.$el.on('hidden.bs.dropdown', '.dropdown', (e) => {
      this.$el.find('.dropdown-menu.show').removeClass('show');
    });
  }

  routeChanged() {
    const url = this.location.path();
    const checkTrainingUrl = 'courses/training';
    this.appMode = this.appDataService.appMode;
    if (url.indexOf(checkTrainingUrl) != -1) {
      this.showDashboard.about = true;
      this.showDashboard.theme = true;
      this.showDashboard.setting = true;
      const checkDashboardURL = 'dashboard';
      const checkAboutURL = 'introduction';
      const checkContentURL = 'content';
      

      //check if dashboard word is present in URL
      if (url.indexOf(checkDashboardURL) != -1) {
        this.showDashboard.progress = false;
      } else {
        this.showDashboard.progress = true;
      }
      //check if introduction word is present in URL
      if (url.indexOf(checkAboutURL) != -1) {
        this.showDashboard.about = false;
        if (this.appDataService.getUserRole() == UserRole.Teacher) {
          this.showDashboard.progress = false;
        } else {
          this.showDashboard.progress = true;
        }
      } else {
        this.showDashboard.about = true;
      }
      if (url.indexOf(checkContentURL) != -1) {
        this.showDashboard.resetSection = true;
      } else {
        this.showDashboard.resetSection = false;
      }
      

    } else {
      this.showDashboard.about = false;
      this.showDashboard.progress = false;
      this.showDashboard.theme = false;
      this.showDashboard.setting = false;
      this.showDashboard.resetSection = false;
    }

    if (this.appMode === AppMode.Course) {
      const publicAssetPath = this.courseDataService.getPublicAssetsPath();
      const logoPath = this.courseDataService.getProductLogoPath();
      this.courseLogoPath = publicAssetPath + '/' + logoPath;
      this.showCourseLogo = true;
    } else if (this.appMode === AppMode.SizingApp) {
      this.courseLogoPath = this.courseDataService.getProductLogoPath();
      this.showCourseLogo = this.courseLogoPath ? true : false;
    } else {
      this.showCourseLogo = false;
    }
  }
  //Commenting the navigation on logo click temporarily and will be activated after decision 
  // In accounting course list page has been removed so it needs a new navigation page. 
  logoClicked() {
    if (!this.location.path().startsWith('/auth/login')) {
      this.router.navigate(['courses']);
    } else if (this.location.path().startsWith('/auth/forgot-password')) {
      this.router.navigate(['auth/login']);
    }
    return;
  }
  
  onLogout(): void {
    this.appDataService.gaEventTrack('LOGOUT');
    this.appDataService.screenLoader = true;
    this.authService.logout()
      .then(()=> {
        this.appDataService.screenLoader = false;
      })
      .catch((err) => {
        console.log("Error in logging out");
        this.appDataService.screenLoader = false;
      })
  }
  onResetCurrentSection(): void {
    this.appDataService.onResetCurrentSection();
  }

  applyTheme(selColor, index) {
    let courseId = this.courseDataService.getProductId();
    this.appDataService.gaEventTrack('SETTINGS_THEME_COLOR', selColor);
    this.appDataService.setThemeColor(courseId, selColor);
    // this.appDataService.setThemeIndex(index);
    this.selectedColor = index;
  }
  onthemeChanged(theme){
    this.selectedColor = this.colorThemes.indexOf(theme);
  }
  changeUnitSystem(selUnitSystem) {
    this.appDataService.gaEventTrack('SETTINGS_UNIT_SYSTEM', selUnitSystem);
    this.appDataService.setUnitSystem(selUnitSystem);
  }

  dashboardClicked() {
    // this.router.navigate(['./',"courses", "training", this.courseDataService.getProductId(),
    // "dashboard"], {relativeTo: this.activatedRoute});
    let classid = this.classDataService.ActiveClass;
    if (classid && this.appDataService.getUserRole() == UserRole.Teacher) {
      this.router.navigate(
        ['./courses/training/' + classid + '/' + this.courseDataService.getProductId() + '/classdashboard'],
        { relativeTo: this.activatedRoute }
      );
    }
    else if (classid && this.appDataService.getUserRole() == UserRole.Student) {
      this.router.navigate(
        ['./courses/training/' + classid + '/' + this.courseDataService.getProductId() + '/dashboard'],
        { relativeTo: this.activatedRoute }
      );
    }
    else if (!classid && this.appDataService.getUserRole() == UserRole.Teacher) {
      this.router.navigate(
        ['./courses/training/' + this.courseDataService.getProductId() + '/classdashboard'],
        { relativeTo: this.activatedRoute }
      );
    }
    else {
      this.router.navigate(
        ['./courses/training/' + this.courseDataService.getProductId() + '/dashboard'],
        { relativeTo: this.activatedRoute }
      );
    }
  }

  courseIntroClicked() {
    // this.router.navigate(['./',"courses", "training", this.courseDataService.getProductId(),
    // "dashboard"], {relativeTo: this.activatedRoute});
    let classid = this.classDataService.ActiveClass;
    if (classid) {
      this.router.navigate(
        ['./courses/training/' + classid + '/' + this.courseDataService.getProductId() + '/introduction'],
        { relativeTo: this.activatedRoute }
      );
    } else {
      this.router.navigate(
        ['./courses/training/' + this.courseDataService.getProductId() + '/introduction'],
        { relativeTo: this.activatedRoute }
      );
    }
  }

  myAccountClicked() {
    this.router.navigate(['./my-account'], { relativeTo: this.activatedRoute });
  }

  // onSaveToDiskClick() {
  //   this.saveToDiskService.save('new application', this.appDataService.sizingApplicationJson);
  // }

  // onSaveToGoogleDriveClicked() {

  // }
}
