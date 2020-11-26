import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SizingAppDataService } from '../shared/services/sizing-app-data.service';
import { AxisCollectionService } from '../shared/services/axis-collection.service';
import { AppDataService } from '../../services/app-data.service';
import { Axis } from '../axis/axis.model';
import { SideNavigatorService } from '../../app-common/side-navigator/side-navigator.service';
import * as uuid from 'uuid';
import { ComponentViewMode } from '../shared/models/sizing.enum';
import { AxisComponent } from '../axis/axis.component';

@Component({
  selector: 'app-sizing-app',
  templateUrl: './sizing-app.component.html',
  styleUrls: ['./sizing-app.component.scss']
})
export class SizingAppComponent implements OnInit, OnDestroy {
  @ViewChild(AxisComponent) axisComponent: AxisComponent;
  sideNavClosed = false;
  selectedAxis: Axis;
  constructor(
    public sizingAppDataService: SizingAppDataService,
    public axisCollectionService: AxisCollectionService,
    public appDataService: AppDataService,
    private activatedRoute: ActivatedRoute,
    private sideNavigatorService: SideNavigatorService
  ) {
  }

  ngOnInit() {
    if (this.appDataService.isNewSizingApplication) {

      this.appDataService.isNewSizingApplication = false;
      this.sizingAppDataService.id = this.activatedRoute.snapshot.params['id'];
      this.sizingAppDataService.name = 'Untitled Application';
      this.sizingAppDataService.user = this.appDataService.getUser();
      this.sizingAppDataService.author = this.appDataService.getUser();

      this.selectedAxis = new Axis();
      this.selectedAxis.id = uuid.v4();
      this.selectedAxis.name = 'My New Axis';
      this.axisCollectionService.add(this.selectedAxis);
    } else { // load from json stored in localstorage
      this.loadFromJson(this.appDataService.sizingApplicationJson);
    }
    this.axisCollectionService.selectedAxisIndex = 0;
    this.selectedAxis = this.axisCollectionService.getSelectedAxis();
    this.sizingAppDataService.user = this.appDataService.getUser();
    this.sizingAppDataService.saveAppData();
    this.appDataService.screenLoader = false;
  }

  updateAxis(axis: Axis) {
    // console.log('axis update event');
    this.selectedAxis = axis;
    //this.updateSideNavigator();
    this.sizingAppDataService.saveAppData();
  }


 




  ngOnDestroy() {
    // clear the singleton axis collection
    this.axisCollectionService.clear();
  }

  // private saveAppData() {
  //   // stores in localstorage
  //   this.appDataService.sizingApplicationJson = this.sizingAppDataService.getJson();
  // }

  loadFromJson(json: string) {
    this.sizingAppDataService.loadJson(json);
  }

}
