import { Injectable } from '@angular/core';

import { SideNavigatorData, SideNavigatorItem, SideNavigatorItemMeta } from '../models/side-navigator.model';
import { MetaStatus } from '../models/side-navigator.enum';
import { SizingComponentTitle } from '../../servo-system-sizing/shared/models/sizing.enum';

@Injectable()
export class SideNavigatorService {

  private _sideNavData: SideNavigatorData;
  private _selectedItem: SideNavigatorItem = null;
  private _itemName: string;

  constructor() { }

  get sideNavData() { return this._sideNavData; }
  set sideNavData(sideNavData: SideNavigatorData) { this._sideNavData = sideNavData; }

  get selectedItem() { return this._selectedItem; }
  set selectedItem(selectedItem: SideNavigatorItem) { this._selectedItem = selectedItem; }

  get itemName() { return this._itemName; }
  set itemName(itemName: string) { this._itemName = itemName; }

  private getItem(items: SideNavigatorItem[], selectedItem: SideNavigatorItem): SideNavigatorItem | null {
    for (const item of items) {
      if (item === selectedItem) {
        return item;
      } else if (item.children) {
        const subItem = this.getItem(item.children, item);
        if (subItem !== null) {
          return subItem;
        }
      }
    }
    return null;
  }

  public updateItemMetaStatus(itemToUpdate: SideNavigatorItem, newStatus: MetaStatus): SideNavigatorItem | null {
    if (!this.selectedItem) {
      return null;
    }
    if (this.selectedItem === itemToUpdate) {
      this.selectedItem.meta.status = newStatus;
      return this.selectedItem;
    } else {
      const target = this.getItem(this.sideNavData.items, itemToUpdate);
      if (target !== null) {
        target.meta.status = newStatus;
        return target;
      } else {
        return null;
      }
    }
  }

  public updateItemMetaStatusById(id: string, newStatus: MetaStatus): SideNavigatorItem | null {
    return null;
  }
  // To Do create separate function to set data of single axis.
  public setAxesData(appName, axes: any[]) {
    this.sideNavData = new SideNavigatorData(appName);
    let index = 0, childIndex = 0;
    for (const axis of axes) {
      index++;
      childIndex = 0;
      this.itemName = appName;
      const item = new SideNavigatorItem(index.toString(), axis.name);
      for (const key of axis.sizingComponentsSequence) {
        const childItem = new SideNavigatorItem(key, SizingComponentTitle[key]);
        const isValid = axis.componentsValidityStatus[key];
        if (isValid === true) {
          childItem.meta.status = MetaStatus.Completed;
          childItem.meta.enabled = true;
        } else {
          childItem.meta.status = MetaStatus.Incomplete;
          // if previous element is completed, enable next element
          if (childIndex > 0 && item.children[childIndex - 1].meta.status === MetaStatus.Completed) {
            childItem.meta.enabled = true;
          } else {
            childItem.meta.enabled = false;
          }
        }
        item.children.push(childItem);
        if (key === axis.selectedSizingComponent) {
          this.selectedItem = childItem;
        }
        childIndex++;
      }
      this.sideNavData.items.push(item);
    }
  }

  public setAxisData(axisName, axis: any) {
  }

}
