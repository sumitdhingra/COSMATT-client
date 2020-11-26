import 'jquery-slimscroll';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.component.html',
  styleUrls: ['./glossary.component.scss']
})
export class GlossaryComponent implements OnInit {
  @Output() sidebarClosed = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
  }

  closeSideMenu() {
    this.sidebarClosed.emit(true);
  }

}
