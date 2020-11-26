import { Component, OnInit, ViewEncapsulation, Input, Output, ElementRef, OnDestroy } from '@angular/core';
import { ProfileElement, ProfileElementsCollection } from '../shared/models/profile-element-list.model';
declare const Cosmatt: any;
declare const COSMATT: any;
@Component({
  selector: 'app-motion-elements-popup',
  templateUrl: './motion-elements-popup.component.html',
  styleUrls: ['./motion-elements-popup.component.scss']
})
export class MotionElementsPopupComponent implements OnInit{
  @Input() profileElements: ProfileElement[] = []; 
  numberFormatter: any;
  angVeloConversionFactor:any;
  profileElementsClone = [];
  profileElementsHeader: any[] = [
    ['name', ''],
    ['initialVelocity', 'rpm'],
    ['finalVelocity', 'rpm'],
    ['initialTime', 's'],
    ['finalTime', 's'],
    ['initialAcceleration', 'rad/s²'],
    ['finalAcceleration', 'rad/s²'],
    ['initialPosition', 'rad'],
    ['finalPosition', 'rad'],
    ['loadInertia', 'kg-m²'],
    ['accelerationTorque', 'Nm'],
    ['frictionTorque', 'Nm'],
    ['externalTorque', 'Nm'],
    ['transmissionRatio', ''],
    ['totalTorque', 'Nm'],
    ['motorInertia', 'kg-m²'],
    ['motorAccelerationTorque','Nm'],
    ['totalMotorTorque','Nm']
  ];

  constructor(public domEle: ElementRef) {
    this.numberFormatter = new Cosmatt.NumberFormatter();
   }

  ngOnInit() {

  }

  ngOnChanges(changes: { [propName: string]: ProfileElement }) {

    this.angVeloConversionFactor =  COSMATT.UNITCONVERTER.getConversionRatioById('ANGULARVELOCITY', 'SI', 'revolutionsperminute');
    this.angVeloConversionFactor = this.numberFormatter.format(this.angVeloConversionFactor);
    this.profileElementsClone = JSON.parse(JSON.stringify(this.profileElements));

    if (this.profileElementsClone.length > 0) {
      this.profileElementsClone[0].finalVelocity = this.profileElementsClone[0].finalVelocity * this.angVeloConversionFactor;
      this.profileElementsClone[1].finalVelocity = this.profileElementsClone[1].finalVelocity * this.angVeloConversionFactor;
      this.profileElementsClone[2].finalVelocity = this.profileElementsClone[2].finalVelocity * this.angVeloConversionFactor;
      this.profileElementsClone[0].initialVelocity = this.profileElementsClone[0].initialVelocity * this.angVeloConversionFactor;
      this.profileElementsClone[1].initialVelocity = this.profileElementsClone[1].initialVelocity * this.angVeloConversionFactor;
      this.profileElementsClone[2].initialVelocity = this.profileElementsClone[2].initialVelocity * this.angVeloConversionFactor;
    }

  }

  toTitleCase(value: string) {
    const result = value.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }
  formatter(value) {
    return this.numberFormatter.format(value);
  }

}
