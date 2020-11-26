import { Component, SimpleChange, OnInit, Input, ElementRef, ContentChild } from '@angular/core';
import { TocService } from '../../servo-system-course/services/toc.service';
import { AppDataService } from '../../services/app-data.service';
import { ProductService } from 'app/servo-system-course/services/product.service';
import { UtilsService } from 'app/services/utils.service';

@Component({
  selector: 'app-lo-viewer',
  templateUrl: './lo-viewer.component.html',
  styleUrls: ['./lo-viewer.component.scss']
})
export class LoViewerComponent implements OnInit {
  objectKeys = Object.keys;
  @Input() selectedChapterNumber: any;
  @Input() selectedModuleNumber: any;
  loaderForLOComponent: any = false;
  LearinigObjectivesMap = [];
  selectedChapterObj: any = [];
  sourceArray: any = [];
  matchingLOFound = false;
  @ContentChild('whiteBackground') whiteBackgroundForLOLoader: ElementRef;

  constructor(
    public tocService: TocService,
    public appDataService: AppDataService,
    private productService: ProductService,
    private utilsService: UtilsService
  ) { }

  ngOnInit() {
    //this.extractObjectiveChapterMap();
  }
  ngAfterViewInit() {
  }

  ngOnChanges(changes: { [propName: string]: SimpleChange }) {
    if ((changes['selectedChapterNumber'] && changes['selectedChapterNumber']['currentValue']) ||
      (changes['selectedModuleNumber'] && changes['selectedModuleNumber']['currentValue'])) {
      this.extractObjectiveChapterMap();
    }
  }

  extractObjectiveChapterMap() {
    this.LearinigObjectivesMap = [];
    this.matchingLOFound = false;
    let tocArray = this.tocService.getToc();
    this.selectedChapterObj = [];
    if (this.appDataService.selectedChapter != undefined && this.appDataService.selectedChapter != -1) {
      // Getting id of all the LOs present in the selected chapter
      this.selectedChapterObj = tocArray[this.appDataService.selectedModule]['items'][this.appDataService.selectedChapter]['learning-objectives'];
    } else {
      // Getting id of all the LOs present in the selected module
      let selectedModuleItemList: any = tocArray[this.appDataService.selectedModule]['items'];
      for (let moduleIndex = 0; moduleIndex < selectedModuleItemList.length; moduleIndex++) {
        for (let checkID of selectedModuleItemList[moduleIndex]['learning-objectives']) {
          this.selectedChapterObj.push(checkID);
        }
      }
    }
    if (this.selectedChapterObj) {
      for (let index = 0; index < this.selectedChapterObj.length; index++) {
        if (this.selectedChapterObj[index].includes('/')) {
          this.selectedChapterObj[index] = this.selectedChapterObj[index].split('/')[1];
        }
      }
    }
    let learningObjectivesObj = this.productService.getObjectives();
    let mappedLOs: any[] = [];
    if(learningObjectivesObj){
       mappedLOs = this.utilsService.getMappedLOs(this.selectedChapterObj, learningObjectivesObj);
    }
    if(mappedLOs && mappedLOs.length > 0){
      this.matchingLOFound = true;
      this.LearinigObjectivesMap = mappedLOs;
    }else{
      this.matchingLOFound = false;
    }
    this.whiteBackgroundForLOLoader.nativeElement.style.height = 0 + 'px';
    this.whiteBackgroundForLOLoader.nativeElement.style.display = "none";
    this.loaderForLOComponent = false;

    //delete learningObjectivesObj.server;
  }
}
