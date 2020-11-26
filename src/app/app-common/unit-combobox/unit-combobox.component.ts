import { Component, OnInit, ElementRef, ViewEncapsulation, Input } from '@angular/core';
import 'libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/js/unitComboBox.min';

@Component({
  selector: 'app-unit-combobox',
  templateUrl: './unit-combobox.component.html',
  styleUrls: ['./unit-combobox.component.scss', '../../../../node_modules/libs-frontend-cosmatt/libs-frontend-unitcombobox/dist/css/unitComboBox.min.css'],
  encapsulation: ViewEncapsulation.None,
})
export class UnitComboboxComponent implements OnInit {

  @Input() configData: any;

  private $domEle: any;
  private $unitComboBox: any;

  constructor(public domEle: ElementRef) {
  }

  ngOnInit() {
    this.$domEle = jQuery(this.domEle.nativeElement);
    const unitCombo = this.$domEle.find('#unit-combo');
    $(unitCombo).unitsComboBox(this.configData);

    // Initialize the combo box with configData
    this.$unitComboBox = $(unitCombo).data('unitsComboBox');
  }

  // Update the SI value of comboBox
  public setSIValue(value: any) {
    this.$unitComboBox.setSIValue(value);
  }

  // Udpate the textBox value
  public setTextBoxValue(value: any) {
    this.$unitComboBox.setTextBoxValue(value);
  }
}
