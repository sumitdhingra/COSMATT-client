import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { TocService } from './toc.service';

@Injectable()
export class TocResolveService implements Resolve<any> {

  constructor(private tocService: TocService) { }
  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
    return this.tocService.fetchToc();
  }
}
