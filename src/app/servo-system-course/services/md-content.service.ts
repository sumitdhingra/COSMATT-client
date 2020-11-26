import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';
import { environment } from '../../../environments/environment';
import { ActivityService } from '../services/activity.service';
import { ProductService } from '../services/product.service';
import { TocService } from '../services/toc.service';
import { AppDataService, ChapterWiseHardCodedCheck } from '../../services/app-data.service';
import { Independent_Module_MD_URL } from '../constants/constants';


@Injectable()
export class MdContentService {
  public activityIds: Array<string>;
  private publicAssetsPath: string;
  private tocArray: any;
  constructor(
    private http: Http,
    private productService: ProductService,
    private activityService: ActivityService,
    private tocService: TocService,
    private appDataService: AppDataService
  ) {
    this.publicAssetsPath = this.productService.getPublicAssetsPath() + '/';
    this.tocArray = this.tocService.getToc();
    this.activityIds = [];
  }

  public fetchContent(selectedModule: any, selectedChapter: any) {
    
    let isCompleted = true;
    clearTimeout(this.tocService.sectionloadIntervalRef)
    let visibleUnlockRule: any = this.tocService.getVisibleUnlockRule(selectedModule, selectedChapter)
    if (visibleUnlockRule && visibleUnlockRule.items && visibleUnlockRule.items.length > 0) {
      isCompleted = this.tocService.checkStatusOfItems(visibleUnlockRule);
    }
    if(!isCompleted){
      this.tocService.checkStatusOfItemsOnInterval(visibleUnlockRule)
    }
    return this.fetchMDContent(selectedModule, selectedChapter, isCompleted)
  }

  public fetchMDContent(selectedModule: any, selectedChapter: any, isCompleted){
    this.publicAssetsPath = this.productService.getPublicAssetsPath() + '/';
    this.tocArray = this.tocService.getToc();
    const contentPromises = [];
    if (this.tocArray && this.tocArray[selectedModule]['items'][selectedChapter] && this.tocArray[selectedModule]['items'][selectedChapter]['md']) {
      let mdFileLink = '';
      if (isCompleted) {
        mdFileLink = this.publicAssetsPath + this.tocArray[selectedModule]['items'][selectedChapter]['md']['url'];
      } else {
        mdFileLink = this.publicAssetsPath + 'NotCompleted.md';
      }

      const unitMdFileLink = mdFileLink; //.replace('.md', `-${this.appDataService.getUnitSystem()}.md`);
      const options = new RequestOptions({ withCredentials: false });
      this.activityIds = [];

      const mdFilePromise = this.http.get(unitMdFileLink, options).toPromise().catch(error => {
        return this.http.get(mdFileLink, options).toPromise();
      });
      contentPromises.push(mdFilePromise);
      if (this.tocArray[selectedModule]['items'][selectedChapter].embedded && isCompleted) {
        this.tocArray[selectedModule]['items'][selectedChapter].embedded.forEach(embeddedItem => {
          this.activityIds.push(embeddedItem['item-code']);
          contentPromises.push(this.activityService.getActivity(embeddedItem['item-code']));
        });
        // if (this.tocArray[selectedModule]['items'][selectedChapter].embedded.length){
        //   this.activityId = this.tocArray[selectedModule]['items'][selectedChapter].embedded[0]['item-code'];
        //   this.activityId = this.activityId;
        //   contentPromises.push(this.activityService.getActivity(this.activityId));
        // }
      }
    }
    return Promise.all(contentPromises);
  }

  public fetchIndependentModuleContent(publicAssetsPath, moduleName) {
    const mdFileLink = publicAssetsPath + Independent_Module_MD_URL[moduleName];
    const options = new RequestOptions({ withCredentials: false });
    return this.http.get(mdFileLink, options).toPromise();
  }
}
