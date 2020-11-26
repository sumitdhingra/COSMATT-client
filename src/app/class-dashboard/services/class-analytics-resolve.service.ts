import { ClassDataService } from './../../servo-system-course/services/class-data.service';

import { Injectable } from '@angular/core';
import { Router, Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { ClassAnalyticsService } from './class-analytics.service';



@Injectable()
export class ClassAnalyticsResolveService implements Resolve<any> {

  constructor(private classDataService: ClassDataService,
    private classAnalyticsService: ClassAnalyticsService) { }

  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
    if (!this.classDataService.ActiveClass && route.params.class) {
      this.classDataService.ActiveClass = route.params.class;
    }
    return Promise.all([this.classAnalyticsService.getClassProductAnalytics()
      , this.classAnalyticsService.getUserClassData()]);
  }
}
