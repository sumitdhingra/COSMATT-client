import { Injectable } from '@angular/core';
import { ProfileElement, ProfileElementsCollection } from '../shared/models/profile-element-list.model';
import { RotaryLoadFormData } from "./rotary-load-form-data.model";
import { ISizingCalculations } from "../shared/interfaces/sizing-calculation-service.interface";
import { AnalysisParams } from "../shared/models/analysis-params.model";

@Injectable()
export class RotaryLoadCalculationsService implements ISizingCalculations {

  constructor() { }

  public calculateSegmentParams(formData: RotaryLoadFormData, profileElementsColl: ProfileElementsCollection) {
    let elementsColl: ProfileElement[] = profileElementsColl.getAll();

    for (let index = 0; index < elementsColl.length; index++) {
      let element = elementsColl[index];

      element.loadInertia = formData.loadInertia;
      element.frictionTorque = formData.frictionTorque;
      element.externalTorque = formData.externalTorque;

      //Calculating accleration torque
      element.accelerationTorque = element.finalAcceleration * element.loadInertia;

      // calculating total torque
      element.totalTorque = element.frictionTorque + element.externalTorque + element.accelerationTorque;

      //calculation tq2Time = (totalTorque)^2 x segmentDuration
      element.tq2Time = Math.pow(element.totalTorque, 2) * element.segmentDuration;
    }
  }

  public calculateAnalysisParams(formData: RotaryLoadFormData, profileElementsColl: ProfileElementsCollection, analysisParams:AnalysisParams) {    
    let totalTq2Time = 0;
    let totalProfileTime = 0;
    let peakTorque = 0;
    let elementsColl: ProfileElement[] = profileElementsColl.getAll();

    for (let index = 0; index < elementsColl.length; index++) {
      let element = elementsColl[index];

      // calculating profile time
      totalProfileTime += element.segmentDuration;
      
      peakTorque = Math.max(peakTorque, element.totalTorque);

      // calculating summation of tq2Time
      totalTq2Time += element.tq2Time;
    }
    analysisParams.peakTorque = peakTorque;
    analysisParams.rmsTorque = Math.sqrt((totalTq2Time / totalProfileTime));
  }

}
