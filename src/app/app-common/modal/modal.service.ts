import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class ModalService {
  public dialogOpened: EventEmitter<any>;
  constructor() {
    this.dialogOpened = new EventEmitter();
  }

  public open(): void {
    this.dialogOpened.emit();
  }

  public getDialogOpenEvent(): EventEmitter<any> {
    return this.dialogOpened;
  }
}
