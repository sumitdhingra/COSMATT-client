
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {
  @Output() sidebarClosed = new EventEmitter<any>();
  constructor() {
  }

  ngOnInit() {
  }

  closeSideMenu() {
    this.sidebarClosed.emit(true);
  }
}
