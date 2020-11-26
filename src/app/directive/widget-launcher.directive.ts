import { Directive, ElementRef, HostListener, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { PopupService } from '../app-common/popup/popup.service';
import { InertiaCalculatorSettings } from 'app/app-common/inertia-calculator/inertia-calculator-settings.model';
import { PopupConfig } from 'app/app-common/popup/popup-config.model';
import { WidgetType, WidgetTitle, WidgetIcon } from './widgets-info.enum';
import { PopupInput } from 'app/app-common/popup/popup-input.model';
import { PopupOutput } from 'app/app-common/popup/popup-output.model';
import { HostMode } from '../app-common/popup/popup-config.enum';

declare const jQuery: any;

@Directive({
  selector: '[appWidgetLauncher]'
})

export class WidgetLauncherDirective {

  // The settings of the widget
  @Input('widgetSettings') private widgetSettings: InertiaCalculatorSettings;

  // The type of widget
  @Input('widgetType') private widgetType: WidgetType;

  // Output event fired when popup is clicked "Ok"
  @Output() private widgetOutput = new EventEmitter<any>();

  private $el: any;
  private widgetTitle: WidgetTitle;
  private widgetIcon: WidgetIcon;

  constructor(
    private elemRef: ElementRef,
    private popupService: PopupService
  ) {
  }

  ngOnInit() {
  }

  /**
   * Sets the popup configuration in PopupService
   * TODO - Find a better way to call this instead of onClick!
   */
  private setPopupConfig() {
    // Configure popupService
    this.popupService.popupConfig = new PopupConfig(HostMode.Component);
    this.popupService.popupConfig.componentType = this.widgetType;

    // Set the widget title and icon property accordingly
    switch (this.widgetType) {
      case WidgetType.InertiaCalculator:
        this.widgetIcon = WidgetIcon.InertiaCalculator;
        this.widgetTitle = WidgetTitle.InertiaCalculator;
        break;

      case WidgetType.MotionProfile:
        this.widgetIcon = WidgetIcon.MotionProfile;
        this.widgetTitle = WidgetTitle.MotionProfile;
        break;

      case WidgetType.TorqueSpeedCurve:
        this.widgetIcon = WidgetIcon.TorqueSpeedCurve;
        this.widgetTitle = WidgetTitle.TorqueSpeedCurve;
        break;
    }

    // Set popup's input
    this.popupService.popupInput = new PopupInput(this.widgetTitle, '', this.widgetIcon, this.widgetSettings);


    // Listen for popup's "save" dialog changes
    // Emit the output data of IC to @Output
    this.popupService.onPopupSave.subscribe((popupOutput: PopupOutput) => {
      this.widgetOutput.emit(popupOutput.outputData);
    });
  }

  @HostListener('click') onLauncherClick() {
    // Open the popup on clicking the host
    this.setPopupConfig();
    this.popupService.open();
  }

}
