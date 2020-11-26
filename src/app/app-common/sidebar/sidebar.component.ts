import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { TocComponent } from '../toc/toc.component';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @ViewChild(TocComponent)
  private tocComponent: TocComponent;
  @Input() tocArr: any;
  @Input() tocSelectedItem: any;
  @Input() sidebarState: any;
  @Output() sideBarToggle = new EventEmitter<any>();
  @Output() tocSectionClicked = new EventEmitter<any>();
  @Output() clickedTOCChapter = new EventEmitter<any>();
  constructor() { }

  ngOnInit() {

  }

  sidebarItemClicked(item) {
    if (this.sidebarState.selected === item && this.sidebarState.clickedItem === item && this.sidebarState.clicked) {
      this.sidebarState.clicked = false;
      this.sidebarState.selected = 'none';
      this.sidebarState.clickedItem = 'none';
    }
    else {
      this.sidebarState.selected = item;
      this.sidebarState.clicked = true;
      this.sidebarState.clickedItem = item;
    }
    this.sidebarState.hovered = false;
    this.sideBarToggle.emit(this.sidebarState);
  }

  sidebarItemHovered(item) {
    if (this.sidebarState.clickedItem === 'none') {
      if (!this.sidebarState.clicked) {
        this.sidebarState.hovered = true;
      }
      this.sidebarState.selected = item;
      this.sideBarToggle.emit(this.sidebarState);
    }

  }

  hideSideBar() {

    if (this.sidebarState.selected !== 'none') {
      if (this.sidebarState.clickedItem !== 'none') {
        this.sidebarState.selected = this.sidebarState.clickedItem;
      }
      else{
        this.sidebarState.selected = 'none';
      }
      this.sidebarState.hovered = false;
      
      this.sideBarToggle.emit(this.sidebarState);
    }
  }

  closeSidebar(e){
    if(e){
      this.sidebarState.clickedItem = "none";
      this.hideSideBar();
    }
  }

  sidebarTocUpdated(obj) {
    this.tocComponent.tocItemStatusUpdated(obj);
  }

  tocItemClicked(obj) {
    this.tocSectionClicked.emit(obj);
  }

  tocChapterClicked(obj) {
    this.clickedTOCChapter.emit(obj);
  }

  selectTOCItem(itemCode) {
    this.tocComponent.selectTOCItem(itemCode);
  }
}
