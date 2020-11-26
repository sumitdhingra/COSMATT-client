import { Component, OnInit } from '@angular/core';
import { SizingAppDataService } from '../shared/services/sizing-app-data.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sizing-app-header',
  templateUrl: './sizing-app-header.component.html',
  styleUrls: ['./sizing-app-header.component.scss']
})
export class SizingAppHeaderComponent implements OnInit {
  user: any;
  appName: string;
  constructor(
    public sizingAppDataService: SizingAppDataService,
    private router: Router) { }

  ngOnInit() {
    this.user = this.sizingAppDataService.user;
    this.appName = this.sizingAppDataService.name;
  }
  onInputChange(event) {
    this.sizingAppDataService.name = event.target.value.toString() || this.sizingAppDataService.name;
    this.appName = this.sizingAppDataService.name;
    this.sizingAppDataService.saveAppData();
  }

  homeIconClicked() {
    this.router.navigate(['courses']);
  }

}
