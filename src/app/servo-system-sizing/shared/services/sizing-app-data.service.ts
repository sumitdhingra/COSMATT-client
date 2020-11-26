import { AppDataService } from './../../../services/app-data.service';
import { Injectable } from '@angular/core';
import { AxisCollectionService } from './axis-collection.service';
import { User } from '../../../auth/model/user.model';
import { AppViewSettings } from '../models/app-view-settings.model';
import { SideNavigatorData, SideNavigatorItem, SideNavigatorItemMeta } from '../../../app-common/models/side-navigator.model';
import { SizingComponentTitle } from '../models/sizing.enum';

@Injectable()
export class SizingAppDataService {
  private _id: string;
  private _name: string;
  private _saveLocation: string;
  private _viewSettings: AppViewSettings;
  private _user: User;
  private _author: User;

  constructor(public axisCollectionService: AxisCollectionService,
    public appDataService: AppDataService ) { }

  get id() {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  get name() {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }

  get saveLocation() {
    return this._saveLocation;
  }
  set saveLocation(value: string) {
    this._saveLocation = value;
  }

  get viewSettings(): AppViewSettings {
    return this._viewSettings;
  }
  set viewSettings(value: AppViewSettings) {
    this._viewSettings = value;
  }

  get user() {
    return this._user;
  }
  set user(value: User) {
    this._user = value;
  }

  get author() {
    return this._author;
  }
  set author(value: User) {
    this._author = value;
  }

  get sizingAppData() {
    const object: any = {
      id: this.id,
      name: this.name,
      user: this.user,
      author: this.author,
      viewSettings: this.viewSettings,
      axes: this.axisCollectionService.axes,
    };
    return JSON.stringify(object);
  }

  getJson() {
    const object: any = {
      id: this.id,
      name: this.name,
      user: this.user,
      author: this.author,
      viewSettings: this.viewSettings,
      axes: this.axisCollectionService.axes,
    };
    return JSON.stringify(object);
  }

  loadJson(json: string) {
    const appData = JSON.parse(json);
    this.id = appData.id;
    this.name = appData.name;
    this.user = appData.user;
    this.author = appData.author;
    this.viewSettings = appData.viewSettings;
    this.axisCollectionService.axes = appData.axes;
  }

  saveAppData() {
    // stores in localstorage
    this.appDataService.sizingApplicationJson = this.getJson();
  }
}
