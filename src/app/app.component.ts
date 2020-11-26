import { Component, OnInit, HostBinding, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { Angulartics2GoogleAnalytics, Angulartics2 } from 'angulartics2';
import { Location } from '@angular/common';
import {
  Router, Event as RouterEvent,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  ActivatedRoute
} from '@angular/router';
import { AuthService } from './services/auth.service';
import { AppDataService, ContentMode, AUTH_SCENARIO } from './services/app-data.service';
import { ModalService } from './app-common/modal/modal.service';
import { ServoSystemSizingComponent } from './servo-system-sizing/servo-system-sizing.component';
import { environment } from '../environments/environment';

// For use in scroll position save
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/first';
import 'rxjs/add/operator/retry';

import 'bugsnag-js';
import { PopupService } from 'app/app-common/popup/popup.service';
import { Http } from '@angular/http';
import { ProductService } from './servo-system-course/services/product.service';
import { UtilsService } from './services/utils.service';
import { CourseRedirectService } from './services/course-redirect.service';

declare var ga: any;
declare const Userback: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  @HostBinding('class') colorTheme = this.getThemeName();

  loading = true;
  releaseDate = 'July 10, 2020';
  copyrightYear = '2020';
  appVersion = '1.5 (beta)';
  @ViewChild('comingSoonModal') comingSoonModal;
  @ViewChild('popupComponent') popupComponent;
  @ViewChild(ServoSystemSizingComponent) servoSystemSizingComponent: ServoSystemSizingComponent;

  private _subscriptions: Subscription[] = [];

  public contentMode = ContentMode;
  constructor(private router: Router,
    private authService: AuthService,
    private activatedRoute: ActivatedRoute,
    public appDataService: AppDataService,
    private modalService: ModalService,
    private angulartics2: Angulartics2,
    private popupService: PopupService,
    private location: Location,
    private http: Http,
    public productService: ProductService,
    private utilService: UtilsService,
    private courseRedirectService: CourseRedirectService) {

    appDataService.themeChanged$.subscribe(theme => this.onthemeChanged(theme));

    this._subscriptions.push(
      modalService.getDialogOpenEvent().subscribe(() => {
        this.comingSoonModal.show();
      })
    );
    this._subscriptions.push(
      popupService.popupOpened.subscribe(() => {
        this.popupComponent.show();
      })
    );
    ga('create', environment.gaKey, 'auto');
    // to prevent auto page track
    angulartics2.developerMode(true);

    // Register access_token in Userback
    Userback.access_token = environment.userbackAccessToken;

    console.log('DEBUG | AppComponent constructor called...');
  }

  onthemeChanged(theme) {
    this.colorTheme = 'theme-'+theme;
  }

  getThemeName(): string {
    return 'theme-'+this.appDataService.getThemeColor();
  }

  ngOnInit(): void {
    this.appDataService.screenLoader = true;
    Bugsnag.apiKey = 'f62b68a8f79ce31daf63fb258d72da5e';
    Bugsnag.enableNotifyUnhandledRejections();
    Bugsnag.notifyReleaseStages = ['development', 'staging', 'production'];
    Bugsnag.releaseStage = environment.name;
    Bugsnag.autoNotify = true;
    const user: any = this.appDataService.getUser();
    if (user) {
      Bugsnag.user = {
        id: user.userId,
        name: user.name,
        email: user.email
      };
    }

    // Handle `after_send` event of Userback
    // Refer - https://help.userback.io/hc/en-us/articles/115005681028-Javascript-API
    Userback.after_send = (data) => {
      this.userbackAfterSendHandler(data);
    };
    // Set the content mode if any param is there `mode=content-view`
    // Otherwise, set to default
    console.log('DEBUG | AppComponent - ngOnInit - Checking for mode param now...');
    console.log('DEBUG | AppComponent - ngOnInit - ', 'appDataService.contentMode: ', this.appDataService.contentMode);
    const queryParams = this.utilService.getQueryParams(['mode']);
    console.log('DEBUG | AppComponent - ngOnInit - queryParams: ', queryParams);
    if (queryParams && queryParams['mode']) {
      this.appDataService.contentMode = queryParams['mode'];
      console.log('DEBUG | AppComponent - ngOnInit - appDataService.contentMode set to "content-view"');
    } else {
      this.appDataService.contentMode = ContentMode.Normal;
      console.log('DEBUG | AppComponent - ngOnInit - No queryParam mode found... - Setting it to Normal');
    }
    console.log('DEBUG | AppComponent - ngOnInit - ', 'appDataService.contentMode: ', this.appDataService.contentMode);
    
    // Add all the subscriptions to array
    this._subscriptions.push(
      // Subscribe to show/hide loaders
      this.navigationInterceptor()
    );
   
    document.body.addEventListener("FEDERATED_AUTH_SUCCESS", (data:any)=>{

      let isAthenticated = this.authService.isUserAuthenticated();

      if(isAthenticated){
        let user =  this.authService.getAthenticatedUser()
        //redirect to registration
        this.authService.registerUser(user, false)
        .then((response)=>{
          this.redirectToURL();
        })
        .catch(error => {	
          console.log(error);
        });
      }else{
        this.redirectToLogin();
      }
    })
    document.body.addEventListener("FEDERATED_AUTH_FAILURE", (data)=>{
      console.log("FEDERATED_AUTH_FAILURE", data)
    })



    // Navigates the user according to authentication
    this.authService.authorizeUser().then(()=>{
      this.navigateBasedOnUserAuth();
    }).catch((err) => {
      let getAuthScenario = this.authService.getAuthScenario(); 
      if(getAuthScenario !== AUTH_SCENARIO.SOCIAL){
        this.redirectToLogin();
      }
    })
  }

  ngOnDestroy() {
    // Unsubscribe the subscriptions
    this._subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  // Shows and hides the loading spinner during RouterEvent changes
  // reference: http://stackoverflow.com/questions/37069609/show-loading-screen-when-navigating-between-routes-in-angular-2
  navigationInterceptor(): Subscription {
    return this.router.events.subscribe((event: RouterEvent) => {
      if (event && event['url'] && (event['url'].toLowerCase()).search('servo-system') > -1) {
        this.router.navigate(['courses']);
      }
      if (event instanceof NavigationStart) {
        // Removing Sizing app check as loader should come while sizing app loading.
        // if (!event.url.startsWith('/sizing-app/')) {
        this.appDataService.screenLoader = true;
        // }
        Bugsnag.refresh();
      }
      if (event instanceof NavigationEnd) {
        this.appDataService.screenLoader = false;
      }

      // Set loading state to false in both of the below events to hide the spinner in case a request fails
      if (event instanceof NavigationCancel) {
        this.loading = false;
      }
      if (event instanceof NavigationError) {
        this.loading = false;
      }
    });
  }

  // redirect based on whether user is authenticated or not when root page is hit
  async navigateBasedOnUserAuth() {
    // window.location.pathname includes base href i.e "app" in url that cuase in unexpected routing of angular app.
    // Replacing it by Location.path().
    // Issue Ref: COSMATT-1359
    try {
      // Check if route is activated using (access_token, org_id) combo
      if (!this.authService.isLoggedIn() && this.authService.isActivatedWithToken()) {
        // try to login with token
        await this.authService.loginWithToken();
      }
    } catch (err) {
      console.log(err);
    }
      if (this.authService.isLoggedIn()) {
        // if (window.location.pathname === '/' || window.location.pathname.startsWith('/auth')) {
        this.redirectToURL();
      } else {
          let isAthenticated = this.authService.isUserAuthenticated();
          if(isAthenticated){
            let user =  this.authService.getAthenticatedUser()
            let isSocialProvider = user.attributes.identities ? JSON.parse(user.attributes.identities) : undefined;
            if(isSocialProvider){
              this.authService.registerUser(user, false)
              .then((response)=>{
                this.redirectToURL();
              })
              .catch(error => {	
                console.log(error);
              });
            }else{
              this.redirectToLogin();
            }
          }else{
            this.redirectToLogin();
          }
        }
  }

  /**
  * Handler called by userback after it submits the feedback.
  * @param data : Userback's data with key-value pairs
  */
  userbackAfterSendHandler(data) {
    return this.http
      .post(`${environment.API_URL}common/feedback`, {
        /* `data.email` will always be present as it is a required field. */
        email: data.email,
        /* `name` can be fetched from appData or blank if user is at login page */
        name: this.appDataService.getUser() ? this.appDataService.getUser()['name'] : ''
      })
      .retry(1)
      .toPromise()
      .then(res => {
        // console.log(res);
      })
      .catch(err => {
        console.log(err);
      });
  }
  redirectToLogin(){
    // if (!window.location.pathname.startsWith('/auth')) {
    if (!this.location.path().startsWith('/auth')) {
      // this.authService.redirectUrl = window.location.pathname;
      this.authService.redirectUrl = this.location.path();
    } else if (this.location.path().startsWith('/auth/forgot-password')) {
      this.router.navigate(['auth/forgot-password']);
      return;
    }
    this.router.navigate(['auth/login']);
  }
  redirectToURL(){
    //Redirect to course content page if skipCourseHomePage is true as per requirement in accounting course.
    if (this.appDataService.skipCourseHomePage && (this.location.path() === '' || this.location.path() === '/' || this.location.path().startsWith('/auth'))) {
      this.courseRedirectService.redirectOnUserRoleBasis().catch((error) => {
        console.error(error);
      });
    }
    else if (this.location.path() === '/' || this.location.path().startsWith('/auth')) {
      this.router.navigate(['courses']);
    }
    else {
      // this.router.navigate([window.location.pathname]);
      // Remove any query params attached by auth tokens
      const queryParams = this.utilService.getQueryParams();
      if (queryParams) {
        this.router.navigate([decodeURIComponent(this.location.path())], { queryParams: queryParams });
      } else {
        this.router.navigate([this.location.path()]);
      }
    }
  }
}
