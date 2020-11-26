import { HostMode } from './popup-config.enum';

// Used to hide or show the Ok and Cancel button in popup footer
// Note - Cross button on the header will ALWAYS show.
export interface IPopupUIConfig {
  // Whether or not to show cancel button
  showCancelButton: boolean;

  // Whether or not to show ok button
  showOkButton: boolean;

  // Whether or not to show close button
  showCloseButton: boolean;

  // Whether or not to show footer info
  showFooterInfo: boolean;

}

// Configuration for Popup component.
// Defaults to a hostMode of HTML input and showing both Ok and Cancel button.
export class PopupConfig {

    // Required property to set popup hostmode
    private _hostMode: HostMode;
    // Optional property to be set later, if hostMode is component
    // TODO - Make a structure definition for this property
    private _componentType: any;
    // UI Config which decides which UI buttons / info to show or hide
    private _popupUIConfig: IPopupUIConfig = {
      showCancelButton: true,
      showOkButton: true,
      showCloseButton: false,
      showFooterInfo: true
    };

    get hostMode() {
        return this._hostMode;
    }
    set hostMode(hostMode: HostMode) {
        this._hostMode = hostMode;
    }

    get componentType() {
        return this._componentType;
    }
    set componentType(componentType: any) {
        if ( this.hostMode === HostMode.Component ) {
            this._componentType = componentType;
        }
    }

    get popupUIConfig(): IPopupUIConfig {
      return this._popupUIConfig;
    }
    set popupUIConfig(popupUIConfig: IPopupUIConfig) {
      this._popupUIConfig = popupUIConfig;
    }

    constructor(
        hostMode: HostMode = HostMode.HTML,
        popupUIConfig?: IPopupUIConfig
    ) {
        this._hostMode = hostMode;
        if ( popupUIConfig ) {
          this._popupUIConfig = popupUIConfig;
        }
    }
};
