import { Injectable, EventEmitter } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Router } from '@angular/router';
import { AppDataService, ContentMode } from '../services/app-data.service';
import { User } from '../auth/model/user.model';
import { environment } from '../../environments/environment';
import { UserProfile, TokenAuthParams, AuthEndPoints } from './auth.service.model';
import { UtilsService } from './utils.service';
const promiseFinally = require('promise.prototype.finally');
promiseFinally.shim();

@Injectable()
export class AuthService {
  public redirectUrl = '/';
  public loggedOut: EventEmitter<any>;
  private userModel: User;

  // Query params passed in URL
  private _queryParamAccessToken: string;
  private _queryParamOrgId: string;

  // Identity Variables
  private comproDLSIdentity = window['comprodls-identity-client-sdk'];
  private authConfig = {
    appID: environment.identityService.appID,
    appENV: environment.identityService.appENV,
    urls: {
      redirectSignIn: environment.identityService.urls.redirectSignIn,
      redirectSignOut: environment.identityService.urls.redirectSignOut
    }
  }
  // Initialize & save for future use
  private identity;
  private identityAuthUser;

  constructor(
    private http: Http,
    public router: Router,
    private appDataService: AppDataService,
    private utilsService: UtilsService
  ) {
    this.loggedOut = new EventEmitter();
    this.identity = new this.comproDLSIdentity.DLSAuth(this.authConfig);
    this.identityAuthUser = this.comproDLSIdentity.AuthUser;
    
  }

  login(username, password) {
    return this.identity.signInWithCredentials(username, password);
  }
  public registerUser(user, rememberMe){
    
    const accessToken = user.signInUserSession.accessToken.jwtToken;
    let userAttributes = {
      uuid: user.username,
      name: user.attributes.name,
      email: user.attributes.email
    }
   return this.autoRegistration(userAttributes, rememberMe, accessToken)
    .then((response) => {
      this.userModel = new User(response.uuid, response.name,
        response.email, response.roles);
      this.appDataService.setUser(this.userModel, rememberMe);
      // Remove screen loader and login message
      this.appDataService.screenLoader = false;
      this.appDataService.loginErrorMessage = '';
      return;
    })
    .catch(error => {
      this.appDataService.screenLoader = false;
      this.appDataService.loginErrorMessage = 'Invalid email or password!';
      console.log(error);
      //Bugsnag.notifyException(error);
    });
  }

  logout() {
    return this.identity.signOut().finally(() => {
      this.loggedOut.emit();
      this.appDataService.deleteUser();
    })
  }

  /**
   * Determines if there is any user currently logged in
   * @returns boolean : Indicating the logged in status, if any, of a user
   */
  public isLoggedIn(): boolean {
    // Check if a user already exists in cookies
    return this.appDataService.getUser() ? true : false;
  }

  public authorizeUser() {
    return this.identity.authorizeUser();
  }

  public forgotPassword() {
    this.identity.forgotPasswordViaStockUI();
  }

  public changePassword(currentPassword: string, newPassword: string) {
    return this.identity.changePassword(currentPassword, newPassword);
  }

  /**
   * Tries to login a user with tokenAuthParams
   * @param authParams : Object of type TokenAuthParams
   */
  public async loginWithToken(authParams?: TokenAuthParams): Promise<boolean> {
    let accessToken = this._queryParamAccessToken;
    let orgId = this._queryParamOrgId;
    // Use the auth params if they are provided in parameters
    // Otherwise, use the class variables as default
    if (authParams && authParams.accessToken && authParams.orgId) {
      accessToken = authParams.accessToken;
      orgId = authParams.orgId;
    }
    try {
      this.appDataService.screenLoader = true;
      const userProfile: UserProfile = await this._isValidToken(accessToken, orgId);
      if (userProfile) {
        this.userModel = new User(userProfile.uuid, userProfile.name, userProfile.email, userProfile.roles);
        this.setUserAfterLogin(this.userModel);
        this.appDataService.screenLoader = false;
        return Promise.resolve(true);
      } else {
        throw new Error('UserProfile could not be fetched from server');
      }
    } catch (err) {
      this.appDataService.screenLoader = false;
      return Promise.reject(err);
    }
  }

  /**
   * Determines if an (accessToken, orgId) combination is valid via a backend call
   * - Use await while calling this method
   * @param accessToken : Value of encrypted accessToken
   * @param orgId : Value of org_id
   * @returns Promise<UserProfile> : Object of type UserProfile
   */
  private async _isValidToken(accessToken, orgId): Promise<UserProfile> {
    const queryParams = { accessToken, orgId };
    const validationResult = await this.http
      .post(environment.API_URL + AuthEndPoints.VALIDATE_TOKEN, queryParams)
      .toPromise();

    if (validationResult.status === 200) {
      // Resolve promise with result JSON
      return Promise.resolve(validationResult.json());
    } else {
      // Token in invalid
      return Promise.reject('Token is invalid');
    }
  }

  /**
   * Determines if a URL is activated using an (accessToken, orgId) combo
   * @returns boolean : true or false
   */
  public isActivatedWithToken(): boolean {
    // Fetch the queryParams
    const queryParams = this.utilsService.getQueryParams(['access_token', 'org_id']);
    // Check if accessToken & orgId exists
    if (queryParams && queryParams['access_token'] && queryParams['org_id']) {
      // set the properties
      this._queryParamAccessToken = queryParams['access_token'];
      this._queryParamOrgId = queryParams['org_id'];
      return true;
    } else {
      return false;
    }
  }

  /**
   * Sets / Registers a user in current app's state
   * @param user : Object of class User
   * @param rememberMe : boolean value indicating whether or not to remember the user for N days
   */
  public setUserAfterLogin(user: User, rememberMe: boolean = false) {
    this.appDataService.setUser(user, rememberMe);
    Bugsnag.user = {
      id: user.userId,
      name: user.name,
      email: user.email
    };
  }

  public autoRegistration(userAttributes, rememberMe, accessToken) {
    const authUrl = environment.API_URL + AuthEndPoints.AUTO_REGISTRATION;
    let options = new RequestOptions();
    return this.http
      .post(authUrl, { userAttributes, rememberMe, accessToken, products: environment.products }, options)
      .toPromise()
      .then(res => res.json());
  }

  public signUp() {
    this.identity.signUpViaStockUI();
  }
  //Login via social IDPs
  public socialSignIn(site) {
    this.identity.federatedSignIn({ 'provider': site });
  }
  //Check if user is authenticated
  public isUserAuthenticated(){
    return this.identityAuthUser.isUserAuthenticated();
  }
  //get authenticated user details
  public getAthenticatedUser(){
    return this.identityAuthUser.getAuthenticatedUser();
  }
  //get login scenario - SOCAIL or NONE
  public getAuthScenario(){
    return this.identity.getAuthScenario();
  }
  
}
