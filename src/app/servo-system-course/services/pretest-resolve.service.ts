import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { PretestService } from './pretest.service';

@Injectable()
export class PretestResolve implements Resolve<any> {

  constructor(private pretestService: PretestService) { }

  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
    return this.pretestService.getAssessmentContent();
  }
}
