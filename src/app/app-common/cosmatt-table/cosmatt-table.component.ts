import { Component, OnInit, Input, TemplateRef, ContentChildren, QueryList, AfterContentInit, ViewChildren, Output, EventEmitter } from '@angular/core';
import { CosmattTableCellDirective } from './cosmatt-table-cell.directive';
import { SortEvent, SortableDirective, compare } from './sortable.directive';

@Component({
  selector: 'app-cosmatt-table',
  templateUrl: './cosmatt-table.component.html',
  styleUrls: ['./cosmatt-table.component.scss']
})
export class CosmattTableComponent implements OnInit, AfterContentInit {

  @Input() columns: Array<Column>;
  @Input() rows: Array<any>;
  @Input() search: boolean;
  @Input() select: boolean = false;
  @Input() selected: any;
  @Input() width: number;
  @Output() onselect = new EventEmitter<string>();

  temp: Array<any>; 
  _columnTemplates: QueryList<CosmattTableCellDirective>;
  templates: Object = {};

  @ViewChildren(SortableDirective) sortHeaders: QueryList<SortableDirective>;
  @ContentChildren(CosmattTableCellDirective)
  set columnTemplates(val: QueryList<CosmattTableCellDirective>) {
    this._columnTemplates = val;
  }
  get columnTemplates(): QueryList<CosmattTableCellDirective> {
    return this._columnTemplates;
  }

  constructor() { 
  }

  ngOnInit() {
    this.temp = [...this.rows];
  }

  onSelect(_, event) {
    if (this.selected === event) return;
    this.selected = event;
    this.onselect.emit(event);
  }

  onSearch(event) {
    const val = event.target.value.toString().toLowerCase();
    const temp = this.temp.filter(d => {
      let found: boolean = false;
      this.columns.forEach(column => {
        if (column.search) found = found || (d[column.prop].toString().toLowerCase().indexOf(val) !== -1 || !val); 
      })
      return found;
    });

    this.rows = temp;
  }

  onSort({column, direction}: SortEvent) {
      this.sortHeaders.forEach(header => {
        if (header.sortable !== column) {
          header.direction = '';
        }
      });
      let temp = [...this.rows];
      
      this.rows = temp.sort((a, b) => {
        const res = compare(a[column], b[column]);
        return direction === 'asc'? res : -res;
      });
  }

  ngAfterContentInit() {
    this.columnTemplates.forEach(cell => {
      this.templates[cell.type] = cell.template;
    });
  }
}

interface Column {
  prop: string;
  name: string;
  sort: boolean;
  search: boolean;
}
