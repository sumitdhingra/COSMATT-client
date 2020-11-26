import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss']
})
export class NotesComponent implements OnInit {
  @Output() sidebarClosed = new EventEmitter<any>();
  constructor() {
  }

  ngOnInit() {
  }

  closeSideMenu() {
    this.sidebarClosed.emit(true);
  }

}
