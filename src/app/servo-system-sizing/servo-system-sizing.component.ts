import { Component, OnInit } from '@angular/core';
import { AppDataService, AppMode } from '../services/app-data.service';

@Component({
  selector: 'app-servo-system-sizing',
  templateUrl: './servo-system-sizing.component.html',
  styleUrls: ['./servo-system-sizing.component.scss']
})
export class ServoSystemSizingComponent implements OnInit {

  constructor(private appDataService: AppDataService) { }

  ngOnInit() {
    this.appDataService.appMode = AppMode.SizingApp;
    this.appDataService.setPageTitle('Servo Motor Sizing');
  }

}
