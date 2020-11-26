import { Component, OnInit, ElementRef, ViewChild, Input, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, NavigationStart, NavigationEnd } from '@angular/router';

import { MdContentService } from './../../servo-system-course/services/md-content.service';
import { AppDataService } from '../../services/app-data.service';
import { MdViewerComponent } from '../../app-common/md-viewer/md-viewer.component';


@Component({
  selector: 'app-md-launcher',
  templateUrl: './md-launcher.component.html',
  styleUrls: ['./md-launcher.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class MDLauncherComponent implements OnInit {

  mdContent: any;
  loading : boolean = true;
  @Input() publicAssetsPath: any;

  constructor(
    private mdContentService: MdContentService,
    public appDataService: AppDataService,
    public activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.mdContentService.fetchIndependentModuleContent(this.publicAssetsPath, "advanced_course").then((responses: any) => {
      this.mdContent = responses._body;
      this.loading = false;
    }).catch((er) => {
    });

  }

  public onCheckMyWorkClicked(activityId: string) {
    //do nothing
  }

  eomTestCompleted(activityObj) {
    //do nothing
  }

  navigateToSection(itemCode) {
    //do nothing for now
  }

}
