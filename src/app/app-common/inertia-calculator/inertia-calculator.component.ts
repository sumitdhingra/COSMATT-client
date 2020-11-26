import { Component, OnInit, ViewEncapsulation, Input, Output, ElementRef, EventEmitter } from '@angular/core';

import { IInertiaCalculatorSettings } from 'app/app-common/inertia-calculator/inertia-calculator-settings.interface';
import { IInertiaCalculatorOutput } from 'app/app-common/inertia-calculator/inertia-calculator-output.interface';
import { InertiaCalculatorSettings } from './inertia-calculator-settings.model';

import 'libs-frontend-cosmatt/libs-frontend-unitLabelControl/dist/js/unitLabelControl.min';
import 'libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/js/unitComboBox.min';
import 'libs-frontend-cosmatt/libs-frontend-ICWidget/dist/static/js/app.js';

declare const $: any;
declare const MathJax: any;

@Component({
  selector: 'app-inertia-calculator',
  templateUrl: './inertia-calculator.component.html',
  styleUrls: ['./inertia-calculator.component.scss',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitLabelControl/dist/css/unitLabelControl.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/css/unitComboBox.min.css',
    '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-ICWidget/dist/static/css/app.css'
  ],
  encapsulation: ViewEncapsulation.None,
})
export class InertiaCalculatorComponent implements OnInit {

  @Input() inertiaCalculatorSettings: InertiaCalculatorSettings;
  /**
   * TODO
   * 1. Make InertiaCalculatorOutput model/interface and add to EventEmitter
   */
  @Output() inertiaCalculatorOutput = new EventEmitter();

  private $el: any;
    /**
   * TODO
   * 2. Make WidgetOptions model/interface
   */
  private widgetOptions: any;

  constructor(
    private elemRef: ElementRef
  ) {
    this.$el = $(this.elemRef.nativeElement);
  }

  ngOnInit() {
    this.$el = $(this.elemRef.nativeElement);

    // Just a null check. Nothing special here.
    if ( !this.inertiaCalculatorSettings ) {
      this.inertiaCalculatorSettings = new InertiaCalculatorSettings().defaultSettings;
    }

    // Initialize widgetOptions
    this.widgetOptions = {
      type: 'inertia-calculator',
      options: {
        data: {
          inertiaChangedCallback: this.inertiaCalculatorOutputHandler.bind(this)
        }
      }
    };
    // Add IC settings to widgetOptions
    Object.assign(this.widgetOptions.options.data, this.inertiaCalculatorSettings);
    // Pass widget options to jQuery widget
    const icWidget = this.$el.find('#inertia-calculator-widget')[0];
    $(icWidget).CosmattPlugin(this.widgetOptions);

    var formulaUpdateInDiv = this.$el.find(".inertia-calculator-component")[0];
    //Math equations update
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, formulaUpdateInDiv], () => {
      MathJax.Hub.Queue(['Typeset', MathJax.Hub, formulaUpdateInDiv]);
    });
    
    
  }

  // IC output handler
  // Emits the outputData through the @Output
  inertiaCalculatorOutputHandler(outputData: string) {
    const outputJSON: IInertiaCalculatorOutput = JSON.parse(outputData);
    this.inertiaCalculatorOutput.emit(outputJSON);
  }


}
