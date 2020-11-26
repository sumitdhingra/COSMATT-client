import { Injectable } from '@angular/core';
import { Axis } from '../../axis/axis.model';

@Injectable()
export class AxisCollectionService {

  private _axes: Axis[] = [];
  private _selectedAxisIndex: number;

  constructor() { }

  add(axis: Axis) {
    this._axes.push(axis);
  }

  delete(index: number) {
    this._axes.splice(index, 1);
  }

  getAxis(index: number): Axis {
    if (index < this._axes.length) {
      return this._axes[index];
    }
    return null;
  }

  set selectedAxisIndex(index: number) {
    if (index < this._axes.length) {
      this._selectedAxisIndex = index;
    }
    // throw new Error('invalid axis index!');
  }

  getSelectedAxis(): Axis {
    return this._axes[this._selectedAxisIndex];
  }

  update(index: number, axis: Axis) {
    this._axes[index] = axis;
  }

  get axes(): Axis[] {
    return this._axes;
  }

  set axes(axes: Axis[]) {
    this._axes = axes;
  }

  clear() {
    this._axes = [];
  }
}
