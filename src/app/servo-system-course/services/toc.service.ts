import { ClassDataService } from './class-data.service';
import { Injectable, EventEmitter } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { environment } from '../../../environments/environment';
import { AppDataService } from '../../services/app-data.service';
import { CourseDataService } from './course-data.service';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class TocService {
  tocJSON: { [key: string]: any };
  sectionloadIntervalRef:any;
  loadSectionOnItemComplete: EventEmitter<string>;
  constructor(private http: Http,
    private appDataService: AppDataService,
    private courseDataService: CourseDataService,
    private authService: AuthService,
    private classDataService: ClassDataService) {
    this.loadSectionOnItemComplete = new EventEmitter();
    this.authService.loggedOut.subscribe(() => this.clearData());
  }
  /**
   * Resolves to return a TOC JSON. Either new or existing.
   * @param details : Usage unknown
   * @param fetchNew : Gets new TOC data from server
   * @param saveToc : Saves the newly fetched TOC data to the existing tocJSON
   * @param productId : Product ID to be used
   */
  public fetchToc(details: boolean = true, fetchNew: boolean = false, saveToc: boolean = true, productId: string = null, userId?: string): Promise<any> {
    if (this.tocJSON !== undefined && !fetchNew) {
      return Promise.resolve(this.tocJSON);
    } else {
      let toc = {};
      const params = new URLSearchParams();
      userId = userId ? userId : this.appDataService.getUser()['userId']
      params.set('userid', userId);
      if (productId !== null) {
        params.set('productid', productId);
      } else {
        params.set('productid', this.courseDataService.getProductId());
      }

      // (passed classId parameter if present)

      if (this.classDataService.ActiveClass) {
        params.set('classid', this.classDataService.ActiveClass);
      }
      return this.http.get(environment.API_URL + 'product/toc', { search: params }).toPromise().then(res => {
        if (typeof res['_body'] === 'string') {
          toc = JSON.parse(res['_body']);
        } else {
          toc = res['_body'];
        }
        if (saveToc) {
          this.tocJSON = toc;
        }
        return Promise.resolve(toc);
      }).catch(err => {
        console.error(err);
      });
    }
  }

  public getToc() {
    if (this.tocJSON) {
      return this.tocJSON;
    }
  }
  public setToc(tocJSON) {
    if(tocJSON){
      this.tocJSON =tocJSON;
    }
    
  }


  public getItemCode(chapterNo: number, sectionNo: number): string {
    if (this.tocJSON) {
      if (this.tocJSON[chapterNo].items[sectionNo]) {
        return this.tocJSON[chapterNo].items[sectionNo]['item-code'];
      } {
        return "";
      }
    }
    return "";
  }

  public getTimeSpentOnItem(chapterNo: number, sectionNo: number): number {
    if (this.tocJSON) {
      return this.tocJSON[chapterNo].items[sectionNo]['__analytics'].timespent;
    }
  }

  public getItemStatus(chapterNo: number, sectionNo: number): string {
    if (this.tocJSON && sectionNo != -1) {
      return this.tocJSON[chapterNo].items[sectionNo]['__analytics'].status;
    } else {
      return this.tocJSON[chapterNo];
    }
  }

  public getMarkAsCompleteOptions(chapterNo: number, sectionNo: number): { [key: string]: any } {
    if (!this.tocJSON) {
      return;
    }
    let selectedChapterObj = this.tocJSON[chapterNo].items[sectionNo];
    if (!selectedChapterObj.attribs) {
      selectedChapterObj.attribs = {
        'mark-as-complete': {
          delay: 0,
          visible: false
        }
      }
    }
    return selectedChapterObj.attribs['mark-as-complete'];
  }

  public updateChapterAnalytics(chapterNo: number): Promise<any> {
    if (this.tocJSON) {
      return this.fetchToc(true, true, true).then(toc => {
        this.tocJSON[chapterNo] = toc[chapterNo];
        return Promise.resolve();
      });
    }
    return this.fetchToc(true, true, true).then(toc => {
      return Promise.resolve();
    })
  }

  public updateAnalytics(chapterNo: number, sectionNo: number): Promise<any> {
    if (this.tocJSON) {
      return this.fetchToc(true, true, true).then(toc => {
        return Promise.resolve(toc);
      });
    }
  }

  public getChapterPercentageCompletion(chapterNo: number): number {
    if (this.tocJSON) {
      return this.tocJSON[chapterNo].__analytics.percentageCompletion;
    }
  }

  public getItemTrackingStatus(chapterNo: number, sectionNo: number): boolean {
    if (this.tocJSON) {
      if (sectionNo != undefined && sectionNo != -1) {
        return this.tocJSON[chapterNo].items[sectionNo].tracking || false;
      }
    }
  }

  public isOnlyChapterSelected(chapter: any){
    if(chapter == null || chapter == undefined || chapter == -1){
      return null;
    }
      return chapter;
  }

  public getChapterSectionName(chapterNo: number, sectionNo: number): any {
    if (sectionNo != undefined && sectionNo != -1) {
      if (this.tocJSON && this.tocJSON[chapterNo] && this.tocJSON[chapterNo].items[sectionNo]) {
        return {
          chapter: this.tocJSON[chapterNo].name,
          section: this.tocJSON[chapterNo].items[sectionNo].name
        }
      }
    }
    else {
      if (this.tocJSON && this.tocJSON[chapterNo]) {
        return {
          chapter: this.tocJSON[chapterNo].name
        }
      }
    }
  }
  public clearData() {
    this.tocJSON = undefined;
    this.sectionloadIntervalRef = undefined;
  }

  public getVisibleUnlockRule(chapterNo: number, sectionNo: number) {
    let visibleUnlockRule: any;
    if (this.tocJSON[chapterNo].items[sectionNo].attribs && this.tocJSON[chapterNo].items[sectionNo].attribs['visible-unlock-rule']) {
      visibleUnlockRule = this.tocJSON[chapterNo].items[sectionNo].attribs['visible-unlock-rule'];
    }
    return visibleUnlockRule;
  }
  public checkStatusOfItems(visibleUnlockRule: any) {
    let result = true;
    const tocJSON = this.getToc();
    let counter = 0;
    for (let chapterIndex = 0; chapterIndex < tocJSON.length; chapterIndex++) {
      const chapter = tocJSON[chapterIndex];
      for (let sectionIndex = 0; sectionIndex < chapter.items.length; sectionIndex++) {
        const section = tocJSON[chapterIndex].items[sectionIndex];
        const itemInVisibleUnlockRuleList = visibleUnlockRule.items.find(function(element) {
          return (element['item-code'] === section['item-code']);
        });
        if (itemInVisibleUnlockRuleList) {

           if(section['__analytics'][itemInVisibleUnlockRuleList.key] && 
           (itemInVisibleUnlockRuleList.value === section['__analytics'][itemInVisibleUnlockRuleList.key])) {
           counter++;
          }
          else {
            //Return false as all items should full fill the condition 
            //Applying the AND rule (default Rule)
            return false;
          }
        }
      }
    }
    if (counter !== visibleUnlockRule.items.length) {
      result = false;
    }
    return result;
  }
  public checkStatusOfItemsOnInterval(visibleUnlockRule){
    this.sectionloadIntervalRef = setInterval(() => {
      let isCompleted = this.checkStatusOfItems(visibleUnlockRule);
      if(isCompleted){
        clearTimeout(this.sectionloadIntervalRef)
        //fire Event
        this.loadSectionOnItemComplete.emit()
      }
     }, 5000);
  }
  public getEmbededAttribs(chapterNo, sectionNo, activityid){
    if (!this.tocJSON) {
      return;
    }
    let selectedChapterObj = this.tocJSON[chapterNo].items[sectionNo];
    if (selectedChapterObj.embedded && selectedChapterObj.embedded.length> 0) {
      let embeddedItem = selectedChapterObj.embedded.find(element=> element['item-code'] == activityid)
      return embeddedItem['attribs'];  
    }
    return;
  }
}
