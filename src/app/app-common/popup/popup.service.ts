import { Injectable, EventEmitter } from '@angular/core';
import { PopupConfig } from 'app/app-common/popup/popup-config.model';
import { PopupOutput } from 'app/app-common/popup/popup-output.model';
import { PopupInput } from 'app/app-common/popup/popup-input.model';

@Injectable()
export class PopupService {

  // Emitted when popup is opened.
  private _popupOpened = new EventEmitter<null>();

  // Popup configuration
  private _popupConfig: PopupConfig;

  // Popup Input and Output data
  private _popupInput: PopupInput;
  private _popupOutput: PopupOutput;

  // Event emitted when "Ok" is clicked
  public onPopupSave = new EventEmitter<PopupOutput>();
  // Event emitted when "Cancel" or "Cross" button is clicked
  public onPopupDismiss = new EventEmitter<null>();


  get popupOpened() {
    return this._popupOpened;
  }

  get popupConfig() {
    return this._popupConfig;
  }
  set popupConfig(popupConfig: PopupConfig) {
    this._popupConfig = popupConfig;
  }

  get popupInput() {
    return this._popupInput;
  }
  set popupInput(popupInput: PopupInput) {
    this._popupInput = popupInput;
  }

  get popupOutput() {
    return this._popupOutput;
  }
  set popupOutput(popupOutput: PopupOutput) {
    this._popupOutput = popupOutput;
  }

  constructor() {
  }

  public open(): void {
    this._popupOpened.emit();
  }

  public clearData(): void {
    this.popupConfig = undefined;
    this.popupInput = undefined;
    this.popupOutput = undefined;
  }
}
