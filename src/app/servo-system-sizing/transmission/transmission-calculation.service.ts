import { Injectable } from '@angular/core';

import { TransmissionFormData } from 'app/servo-system-sizing/transmission/transmission-form-data.model';
import { ProfileElementsCollection, ProfileElement } from 'app/servo-system-sizing/shared/models/profile-element-list.model';
import { AnalysisParams } from 'app/servo-system-sizing/shared/models/analysis-params.model';
import { ISizingCalculations } from 'app/servo-system-sizing/shared/interfaces/sizing-calculation-service.interface';

@Injectable()
export class TransmissionCalculationService implements ISizingCalculations {

  /**
   * Calculation:
   * The distance moved, speed and acceleration are multiplied by the ratio, while the torque is divided by the ratio.
   * The inertia of the load as reflected to the motor is reduced by the square of the ratio.
   */
  calculateSegmentParams(formData: TransmissionFormData, profileElementsColl?: ProfileElementsCollection ) {
    if ( !profileElementsColl || !formData ) {
      return;
    }
    const elementsColl: ProfileElement[] = profileElementsColl.getAll();
    if ( !elementsColl ) {
      return;
    }
    for ( const element of elementsColl ) {
      /**
       * TODO
       * 1. What to do with efficiency?
       */
      element.transmissionRatio *= (formData.transmissionEfficiency / 100);
      // Add the formData to element
      element.transmissionEfficiency = formData.transmissionEfficiency;
      element.transmissionInertia = formData.transmissionInertia;
      element.transmissionRatio = formData.transmissionRatio;

      // Update velocity
      element.initialVelocity *= formData.transmissionRatio;
      element.finalVelocity *= formData.transmissionRatio;

      // Update acceleration
      // element.initialAcceleration *= formData.transmissionRatio;
      // element.finalAcceleration *= formData.transmissionRatio;
      element.finalAcceleration = element.finalAcceleration * formData.transmissionRatio;

      // Calc the reflected total load torque
      element.reflectedLoadTorque = element.totalTorque / formData.transmissionRatio;

      // Update load inertia/reflected load inertia
      element.reflectedLoadInertia = element.loadInertia / Math.pow(formData.transmissionRatio, 2);

      // Update acceleration torque
      // element.accelerationTorque *= formData.transmissionRatio;

      // Calc the transmission acc torque
      // const transmissionAccTorque = element.finalAcceleration * formData.transmissionInertia;

      // Update total torque
      // totalTorque = reflectedLoadTorque + transmissionAccTorque + motorAccTorque
      // element.totalTorque = reflectedLoadTorque + transmissionAccTorque;
      element.totalTorque = element.reflectedLoadTorque;
    }
  }


  calculateAnalysisParams(formData: TransmissionFormData, profileElementsColl: ProfileElementsCollection): AnalysisParams {
    if ( !profileElementsColl || !formData ) {
      return;
    }
    const elementsCol: ProfileElement[] = profileElementsColl.getAll();
    const analysisParams = new AnalysisParams();

    // Acc^2 * Time, Torq^2 * Time
    let accSqTime = 0, torqSqTime = 0;
    // Peak points
    let peakVelocity = 0, peakAcceleration = 0, peakTorque = 0;
    // Total time for calculation
    let totalTime = 0;

    for ( const element of elementsCol ) {
      const duration = element.finalTime - element.initialTime;
      const accSquare = element.finalAcceleration * element.finalAcceleration;
      const torqSquare = element.totalTorque * element.totalTorque;

      peakVelocity = Math.max(peakVelocity, element.initialVelocity, element.finalVelocity);
      peakAcceleration = Math.max(peakAcceleration, element.initialAcceleration, element.finalAcceleration);
      peakTorque = Math.max(peakTorque, element.totalTorque);

      accSqTime += accSquare * duration;
      torqSqTime += torqSquare * duration;

      totalTime = totalTime + duration;
    }

    // Set the values in analysisParams
    analysisParams.rmsAcceleration = Math.sqrt(accSqTime / totalTime);
    analysisParams.rmsTorque = Math.sqrt(torqSqTime / totalTime);
    analysisParams.peakSpeed = peakVelocity;
    analysisParams.peakAcceleration = peakAcceleration;
    analysisParams.peakTorque = peakTorque;

    return analysisParams;
  }

  constructor() {
  }

}
