import { Component, OnInit, Input } from '@angular/core';
import { ProfileElement, ProfileElementsCollection } from '../shared/models/profile-element-list.model';
import { AnalysisParams } from '../shared/models/analysis-params.model';

declare const Cosmatt: any;

@Component({
  selector: 'app-motion-elements',
  templateUrl: './motion-elements.component.html',
  styleUrls: ['./motion-elements.component.scss']
})
export class MotionElementsComponent implements OnInit {

  @Input() profileElements: ProfileElement[] = [];
  @Input() analysisParams: AnalysisParams = new AnalysisParams();
  numberFormatter: any;
  profileElementsHeader: any[] = [
    ['name', ''],
    ['initialVelocity', 'rad/s'],
    ['finalVelocity', 'rad/s'],
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
  analysisParamsHeader: any[] = [
    ['peakAcceleration', 'rad/s²'],
    ['rmsAcceleration', 'rad/s²'],
    ['peakTorque', 'Nm'],
    ['rmsTorque', 'Nm'],
    ['peakSpeed', 'rad/s'],
    ['rmsSpeed', 'rad/s'],
  ];


  analysisParamKeys: string[] = [];

  constructor() {
    this.numberFormatter = new Cosmatt.NumberFormatter();
  }

  ngOnInit() {
    if (!this.profileElements.length) {
      return;
    }
    this.analysisParamKeys = Object.keys(this.analysisParams);
  }

  toTitleCase(value: string) {
    const result = value.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  formatter(value) {
    return this.numberFormatter.format(value);
  }

}
