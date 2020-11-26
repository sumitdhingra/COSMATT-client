import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ViewEncapsulation } from '@angular/core';
import { SidebarComponent } from '../../app-common/sidebar/sidebar.component';
import { ClassDataService } from 'app/servo-system-course/services/class-data.service';
import * as classDashboardOptions from '../classDashboardOptions.json';
@Component({
  selector: 'app-class-navbar',
  templateUrl: './class-navbar.component.html',
  styleUrls: ['./class-navbar.component.scss']
})
export class ClassNavbarComponent implements OnInit {
  @Output() classSidebarClosed = new EventEmitter<any>();
  @Output() classSidebarStatus = new EventEmitter<any>();
  @Output() clickedItemId = new EventEmitter<any>();
  $class_navbar: any;
  class_sidebarStatus = {
    selected: window.innerWidth > 1024 ? 'class-analytics' : 'none',
    clicked: window.innerWidth > 1024 ? true : false,
    clickedItem: window.innerWidth > 1024 ? 'class-analytics' : 'none',
    hovered: false,
    open: () => this.class_sidebarStatus.selected !== 'none'
  };
  $sidebar_item: any;
  options: any;
  className: any;
  selectedItemIndex: number;
  hoveredItemIndex: number;
  classDashboardOptions:any = classDashboardOptions
  constructor(
    private classDataService: ClassDataService
  ) { }

  ngOnInit() {
    this.selectedItemIndex = 0; 
    this.$class_navbar = $("#class-navbar");
    this.$sidebar_item = $(".sidebar-item");
    this.options = this.classDashboardOptions;
    this.className = this.classDataService.ActiveClassData.title;
    this.hoveredItemIndex = -1; 
  }

  classNavOptionClicked(option) {
    this.selectedItemIndex = option;
    this.class_sidebarStatus.selected = option;
    this.clickedItemId.emit(this.selectedItemIndex);
  }

  sidebarItemClicked() {
    if (this.$sidebar_item.hasClass('clicked')) {
      this.class_sidebarStatus.clicked = false;
      this.class_sidebarStatus.selected = 'none';
      this.class_sidebarStatus.clickedItem = 'none';
      this.$class_navbar.removeClass("display clicked");
      this.$sidebar_item.removeClass("clicked");
      this.classSidebarClosed.emit(true);
    }
    else {
      this.class_sidebarStatus.clicked = true;
      this.class_sidebarStatus.clickedItem = 'bar';
      this.class_sidebarStatus.selected = "selected";
      this.$sidebar_item.addClass('clicked');
      this.$class_navbar.addClass("display clicked");
      this.classSidebarClosed.emit(false);
    }
    this.class_sidebarStatus.hovered = false;
    this.classSidebarStatus.emit(this.class_sidebarStatus);
    
  }

  sidebarItemHovered() {
    if (!this.$sidebar_item.hasClass('clicked')) {
        this.class_sidebarStatus.hovered = true;
        this.class_sidebarStatus.selected = "selected";
        this.class_sidebarStatus.clickedItem = 'none';
        this.$class_navbar.addClass("display");
        this.classSidebarClosed.emit(false);
        this.classSidebarStatus.emit(this.class_sidebarStatus);
    }
  }

  hideSideBar() {
      if (this.class_sidebarStatus.clickedItem === 'cross' || this.class_sidebarStatus.clickedItem === 'none') {
        this.class_sidebarStatus.selected = 'none';
        this.$class_navbar.removeClass("display clicked");
        this.$sidebar_item.removeClass("clicked");
        this.classSidebarClosed.emit(true);
      }
      this.class_sidebarStatus.hovered = false;
      this.classSidebarStatus.emit(this.class_sidebarStatus);
 }

  closeSideMenu(e){
      this.class_sidebarStatus.clickedItem = "cross";
      this.hideSideBar();
  }
}
