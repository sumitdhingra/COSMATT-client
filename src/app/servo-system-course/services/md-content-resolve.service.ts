import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { MdContentService } from './md-content.service';
import { UtilsService } from '../../services/utils.service';

@Injectable()
export class MdContentResolveService {

  constructor(private mdContentService: MdContentService,
  private utilsService: UtilsService) { }
  resolve(route: ActivatedRouteSnapshot): Promise<any> | boolean {
    const selectedModule =  +this.utilsService.stripQueryParams(route.params['module']);
    const selectedChapter = +this.utilsService.stripQueryParams(route.params['chapter']);
    if(selectedChapter != undefined && selectedChapter != -1){
      return this.mdContentService.fetchContent(selectedModule, selectedChapter);
    }
    else{
      return true;
    }
  }

}
