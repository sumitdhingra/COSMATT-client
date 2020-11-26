import { Component, OnInit, ElementRef } from '@angular/core';
import { PopupService } from 'app/app-common/popup/popup.service';
import { HostMode, ComponentType } from 'app/app-common/popup/popup-config.enum';
import { PopupOutput } from 'app/app-common/popup/popup-output.model';
import { WidgetType } from '../../directive/widgets-info.enum';
/**
 * To use PopupComponent inject the PopupService in your component
 * and call popupService.open() when needed.
 */
@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {

  private $el: any;

  // Enums for use in HTML
  hostMode = HostMode;
  widgetType = WidgetType;
  componentType = ComponentType;

  constructor(
    private el: ElementRef,
    public popupService: PopupService
  ) {
    this.$el = jQuery(el.nativeElement);
  }

  ngOnInit() {
    // Clear the data of PopupService on save and dismiss.
    // This needs to be done in setTimeout, so that subscribers of these observables get executed first.
    this.popupService.onPopupDismiss.subscribe((data, err) => {
      setTimeout(() => {
        this.popupService.clearData();
      }, 0);
    });
    this.popupService.onPopupSave.subscribe((data, err) => {
      setTimeout(() => {
        this.popupService.clearData();
      }, 0);
    });
  }

  show() {
    this.$el.find('#appPopup').modal('show');
    this.$el.find("#appPopup .modal-content").removeClass("md-launcher-component");

    switch (this.popupService.popupConfig.componentType) {

      case this.componentType.MdViewerLauncher:
        this.$el.find("#appPopup .modal-content").addClass("md-launcher-component");
        break;

      default:
        break;
    }

  }

  onPopupSave() {
    this.popupService.onPopupSave.emit(this.popupService.popupOutput);
  }

  onPopupDismiss() {
    this.popupService.onPopupDismiss.emit(null);
  }

  componentOutputHandler(outputData: any) {
    this.popupService.popupOutput = new PopupOutput(outputData);
  }
}
