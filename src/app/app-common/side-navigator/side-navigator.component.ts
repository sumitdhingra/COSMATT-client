import {
  Component, OnInit, Input, Output, EventEmitter, OnChanges,
  SimpleChange, SimpleChanges, ElementRef, AfterViewInit
} from '@angular/core';

import { SideNavigatorService } from './side-navigator.service';
import { SideNavigatorItem, SideNavigatorData, SideNavigatorItemMeta } from '../models/side-navigator.model';
import { MetaStatus } from 'app/app-common/models/side-navigator.enum';
import { SizingComponentType } from '../../servo-system-sizing/shared/models/sizing.enum';

declare const jQuery: any;

@Component({
  selector: 'app-side-navigator',
  templateUrl: './side-navigator.component.html',
  styleUrls: ['./side-navigator.component.scss']
})
export class SideNavigatorComponent implements OnInit, OnChanges, AfterViewInit {

  private $el: any;
  private readonly SIDE_NAV_WIDTH_CLOSED = '50px';
  private readonly SIDE_NAV_WIDTH_OPENED = '280px';
  public SizingComponentType = SizingComponentType;

  sideNavState = {
    pinned: true,
    hovered: false
  };

  metaStatus = MetaStatus;

  @Output() onItemClicked = new EventEmitter();
  @Output() onSideNavigatorToggleOpened = new EventEmitter();
  @Output() onSideNavigatorToggleClosed = new EventEmitter();
  @Output() onSideNavigatorItemNameChanged = new EventEmitter();

  @Output() onSideNavigatorOpening = new EventEmitter();
  @Output() onSideNavigatorHoverOpened = new EventEmitter();
  @Output() onSideNavigatorClosing = new EventEmitter();
  @Output() onSideNavigatorHoverClosed = new EventEmitter();

  constructor(
    public sideNavService: SideNavigatorService,
    private elementRef: ElementRef
  ) {
  }

  ngOnInit() {
    if (!this.sideNavService.sideNavData) {
      return;
    }
    if (this.sideNavService.selectedItem == null) {
      this.sideNavService.selectedItem = this.sideNavService.sideNavData.items[0].children[0];
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log('SideNavigator: Changes');
    // const selectedItem: SimpleChange = changes.selectedItem;

    // console.log('Old selectedItem: ', selectedItem.previousValue);
    // console.log('New selectedItem: ', selectedItem.currentValue);

    // this._selectedItem = selectedItem.currentValue;
  }

  ngAfterViewInit() {
    if (!this.sideNavService.sideNavData) {
      return;
    }
    this.$el = jQuery(this.elementRef.nativeElement);
    this.$el.find('.collapse').each((i, elem) => {
      jQuery(elem).on('show.bs.collapse', (e) => {
        const chev = jQuery(elem).parent().find('.fa.float-right');
        chev.removeClass('fa fa-chevron-down');
        chev.addClass('fa fa-chevron-up');
      });

      jQuery(elem).on('hide.bs.collapse', (e) => {
        const chev = jQuery(elem).parent().find('.fa.float-right');
        chev.removeClass('fa fa-chevron-up');
        chev.addClass('fa fa-chevron-down');
      });
    });
  }

  /**
   * Methods used by HTML elements
   */
  onNameChange(newName: string) {
    this.sideNavService.itemName = newName;
    this.onSideNavigatorItemNameChanged.emit(newName);
  }
  
  onItemClick(clickedItem: SideNavigatorItem) {
    if (this.sideNavService.selectedItem !== clickedItem && clickedItem.meta.enabled ) {
      this.sideNavService.selectedItem = clickedItem;
      this.onItemClicked.emit(clickedItem);
    }
  }

  onMouseLeave() {
    if (this.sideNavState.hovered) {
      // console.log('onMouseLeave');
      this.sideNavState.hovered = false;
      if (!this.sideNavState.pinned) {
        this.onSideNavigatorClosing.emit('hover-closing');
        this.closeSideNav(() => {
          this.onSideNavigatorHoverClosed.emit('hover-closed');
        });
      }
    }
  }

  onMouseEnter() {
    // console.log('onMouseEnter');
    if (!this.sideNavState.pinned) {
      this.sideNavState.hovered = true;
      this.onSideNavigatorOpening.emit('hover-opening');
      this.openSideNav(() => {
        this.onSideNavigatorHoverOpened.emit('hover-opened');
      });
    }
  }

  toggleSideNav() {
    // console.log('toggleSideNav');
    this.sideNavState.pinned = !this.sideNavState.pinned;
    if (this.sideNavState.pinned) {
      this.onSideNavigatorOpening.emit('toggle-opening');
      this.openSideNav(() => {
        this.sideNavState.hovered = false;
        this.onSideNavigatorToggleOpened.emit('toggle-opened');
      });
    } else {
      this.onSideNavigatorClosing.emit('toggle-closing');
      this.closeSideNav(() => {
        this.sideNavState.hovered = false;
        this.onSideNavigatorToggleClosed.emit('toggle-closed');
      });
    }
  }

  onCloseBtnClick() {
    // console.log('onCloseBtnClick');
    if (this.sideNavState.pinned) {
      this.onSideNavigatorClosing.emit('toggle-closing');
      this.closeSideNav(() => {
        this.sideNavState.pinned = false;
        this.onSideNavigatorToggleClosed.emit('toggle-closed');
      });
    }
  }

  closeSideNav(cb) {
    // console.log('closeSideNav');
    this.$el.find('.sidenav-container').animate({
      width: this.SIDE_NAV_WIDTH_CLOSED
    }, cb);
  }

  openSideNav(cb) {
    // console.log('openSideNav');
    this.$el.find('.sidenav-container').animate({
      width: this.SIDE_NAV_WIDTH_OPENED
    }, cb);
  }

  isChildOf(childItem: SideNavigatorItem, parentItem: SideNavigatorItem): boolean {
    for (const child of parentItem.children) {
      if (child === childItem) {
        return true;
      }
    } return false;
  }

  // protected isCollapsed(item: SideNavigatorItem): boolean {
  //   console.log(this.selectedItem.id, item.id.split('.')[0]);
  //   return this.selectedItem.id === item.id.split('.')[0];
  // }

}

