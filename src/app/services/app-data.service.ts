import { Injectable, EventEmitter } from '@angular/core';
import { CookieService, CookieOptions } from 'ngx-cookie';
import { Router, NavigationEnd } from '@angular/router';
import 'rxjs/add/operator/pairwise';
import { Title } from '@angular/platform-browser';
import { Angulartics2 } from 'angulartics2';

declare const Userback: any;

export const UserType = {
  NewUser: 'new',
  ExistingUser: 'existing'
}

export const UserRole = {
  Student: 'student',
  Teacher: 'teacher'
}
export const AppMode = {
  Course: 'Course',
  SizingApp: 'SizingApp',
  None: 'none'
};

export enum ContentMode {
  Normal = 'normal',
  View = 'content-view'
};

export enum THEME_COLORS {
  RED = 'red',
  BLUE = 'blue',
  GREEN = 'green',
  DEFAULT = "red"
}

export enum AUTH_SCENARIO {
  SOCIAL = 'SOCIAL',
  NONE = 'NONE'
}

export const ChapterWiseHardCodedCheck = {

  Chapter5: '4',
  Chapter5Section: {
    'Section5.1': '0',
    'Section5.2': '1',
  }
}

@Injectable()
export class AppDataService {
  defaultTheme = THEME_COLORS.DEFAULT;
  // defaultThemeIndex = "1";
  defaultUnitSystem = 'metric';
  pretestFlag = true;
  userSkipPretest = false;
  getClassDummyData = false;
  // selectedCourseId = '';
  public themeChanged$: EventEmitter<string>;
  public unitSystemChanged$: EventEmitter<string>;
  public pretestFlagUpdated$: EventEmitter<string>;
  public cookiesSet$ = new EventEmitter<boolean>();
  courseProgress: number;
  private currentGoogleAnalyticsPage: string;
  lastVisited: any;
  userType: string;
  courseContentDisplayed = false;
  startDate = null;
  public screenLoader = false;
  selectedChapter: any;
  selectedModule: any;
  loginErrorMessage = '';
  itemTimeSpentPostInterval: number = 30000; // interval in milliseconds
  numberFormatterOptions: any;
  private _appMode = AppMode.None;
  private _skipCourseHomePage = false;
  private _isNewSizingApplication = false;
  private _previousUrl = './courses';
  private _previousPageTitle = '';
  private _displayMDContent = true;
  private _displayLOContent = true;
  public resetCurrentSection: EventEmitter<any>;

  // Content mode variable for displaying ContentPage's UI
  private _contentMode;

  constructor(
    private cookieService: CookieService,
    private titleService: Title,
    private angulartics2: Angulartics2,
    private router: Router) {
    console.log('DEBUG | AppDataService contructor called...');
    this.themeChanged$ = new EventEmitter();
    this.unitSystemChanged$ = new EventEmitter();
    this.pretestFlagUpdated$ = new EventEmitter();
    this.numberFormatterOptions = {
      significantDigits: 3,
      maxPositiveExponent: 6,
      minNegativeExponent: -4
    };
    this.resetCurrentSection = new EventEmitter();

    this.router.events
      .filter(e => e instanceof NavigationEnd)
      .pairwise()
      .subscribe(
        (e: any[]) => {
          this._previousUrl = e[0].urlAfterRedirects;
          this._previousPageTitle = document.title;
        },
        (err: Error) => {
          console.log('Error in getting previousUrl: ' + err);
        }
      );

    // Skip current angular life cycle so that subscribers get time to attach to this observable
    setTimeout(() => {
      if (this.getUser()) {
        this.cookiesSet$.emit(true);
      } else {
        this.cookiesSet$.emit(false);
      }
    }, 0);
  }

  public get contentMode(): ContentMode {
    return this._contentMode;
  }

  public onResetCurrentSection() {
    this.resetCurrentSection.emit();
  }
  public set contentMode(contentMode: ContentMode) {
    // Run-time check to see if `contentMode` is an allowed value
    const values = Object.keys(ContentMode)
      .map(key => ContentMode[key]);
    // Only set the value if it's valid
    if (values.includes(contentMode)) {
      this._contentMode = contentMode;
    } else {
      this._contentMode = ContentMode.Normal;
    }
  }

  public get previousUrl() {
    return this._previousUrl;
  }

  public get previousPageTitle() {
    return this._previousPageTitle;
  }

  public set gaPage(page) {
    this.currentGoogleAnalyticsPage = page;
  }

  public get gaPage() {
    return this.currentGoogleAnalyticsPage;
  }

  public gaEventTrack(action: string, label: string = '', category: string = '') {
    const properties: any = { page: this.currentGoogleAnalyticsPage };
    if (label) {
      properties.label = label;
    }
    if (category) {
      properties.category = category;
    }
    this.angulartics2.eventTrack.next({ action, properties });
  }

  // sets user data in localStorage
  setUser(user, rememberMe) {
    const options: CookieOptions = {};
    if (rememberMe) {
      let date = new Date();
      // add 7 days to today
      date.setTime(date.getTime() + 7 * 86400000);
      options.expires = date;
    }
    this.cookieService.putObject('userDetails', {
      email: user.email,
      name: user.name,
      userId: user.userId,
      userRoles: user.role
    }, options);

    // Populate the e-mail field of Userback
    Userback.email = user.email;

    this.cookiesSet$.emit(true);
  }

  getUser(): any {
    return this.cookieService.getObject('userDetails');
  }
  getUserRole(): any {
    return (this.getUser().userRoles && this.getUser().userRoles.teacher) ? UserRole.Teacher : UserRole.Student;
  }
  deleteUser() {
    this.cookieService.remove('userDetails');
    // De-populate the Userback email field
    Userback.email = '';
    this.cookiesSet$.emit(false);
  }

  getThemeColor(productId?) {
    if(productId){
      return localStorage.getItem(productId);
    }
    else{
      return this.defaultTheme;
    }
  }

  setThemeColor(productId, theme) {
    localStorage.setItem(productId, theme);
    this.themeChanged$.emit(theme);
  }

  // getThemeIndex() {
  //   return localStorage.getItem('color-index') || this.defaultThemeIndex;
  // }

  // setThemeIndex(index) {
  //   localStorage.setItem('color-index', index);
  // }

  getUnitSystem() {
    return localStorage.getItem('unit-system') || this.defaultUnitSystem;
  }

  setUnitSystem(unitSystem) {
    localStorage.setItem('unit-system', unitSystem);
    this.unitSystemChanged$.emit(unitSystem);
  }

  setPretestFlag(val) {
    this.pretestFlag = val;
    this.pretestFlagUpdated$.emit(val);
  }

  getPretestFlag() {
    return this.pretestFlag;
  }

  setUserSkipPretestFlag(val) {
    this.userSkipPretest = val;
  }

  getUserSkipPretestFlag() {
    return this.userSkipPretest;
  }

  // setSelectedCourseId(id) {
  //   this.selectedCourseId = id;
  // }

  // getSelectedCourseId() {
  //   return this.selectedCourseId;
  // }

  setCourseProgress(progress: number): void {
    this.courseProgress = progress;
  }

  getCourseProgress(): number {
    return this.courseProgress;
  }

  setUserType(type: string): void {
    this.userType = type;
  }

  getUserType(): string {
    return this.userType || UserType.ExistingUser;
  }

  setLastVisited(obj: any): void {
    this.lastVisited = JSON.parse(JSON.stringify(obj));
  }

  getLastVisited(): any {
    console.log('getting...', this.lastVisited);
    // if(this.lastVisited){
    //   this.lastVisited.section = "-1";
    // }
    return this.lastVisited;
  }

  setCourseContentDisplayed(displayed) {
    this.courseContentDisplayed = displayed;
  }

  getCourseContentDisplayed() {
    return this.courseContentDisplayed;
  }

  setStartDate(startDate: number) {
    this.startDate = startDate;
  }

  getStartDate(): number {
    return this.startDate;
  }

  setPageTitle(title: string) {
    this.titleService.setTitle(`${title}`);
  }

  getitemTimeSpentInterval(): number {
    return this.itemTimeSpentPostInterval;
  }

  get isNewSizingApplication() {
    return this._isNewSizingApplication;
  }
  set isNewSizingApplication(value: boolean) {
    this._isNewSizingApplication = value;
  }

  get sizingApplicationJson() {
    return localStorage.getItem('sizing-app');
  }
  set sizingApplicationJson(json: string) {
    localStorage.setItem('sizing-app', json);
  }

  get appMode() {
    return this._appMode;
  }
  set appMode(value: string) {
    this._appMode = value;
  }

  get googlePickerConfig() {
    return {
      clienId: '451085000024-oif1gfob090prelkmnkv1fmkdsd0g8mt.apps.googleusercontent.com',
      appId: 'cosmatt-190505',
      apiKey: 'AIzaSyA7QaiPMX_6IU8yeEtH6DOP66dlp-C-mVo'
    };
  }

  get skipCourseHomePage() {
    return this._skipCourseHomePage;
  }
  set skipCourseHomePage(value: boolean) {
    this._skipCourseHomePage = value;
  }

  get DisplayMDContent() {
    return this._displayMDContent;
  }
  set DisplayMDContent(value: boolean) {
    this._displayMDContent = value;
  }

  get DisplayLOContent() {
    return this._displayLOContent;
  }
  set DisplayLOContent(value: boolean) {
    this._displayLOContent = value;
  }
}
