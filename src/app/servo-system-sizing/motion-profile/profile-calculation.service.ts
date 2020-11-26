import { Injectable } from '@angular/core';
import { ProfileElement, ProfileElementsCollection } from '../shared/models/profile-element-list.model';
import { MotionProfileFormData } from './motion-profile-form-data.model';
import { ISizingCalculations } from '../shared/interfaces/sizing-calculation-service.interface';
import { AnalysisParams } from '../shared/models/analysis-params.model';

@Injectable()
export class ProfileCalculationService implements ISizingCalculations {

  elementsArr = [];
  profileAnalysisParams;

  constructor() { }

  public setProfileWidgetOutputData(widgetOutput) {
    this.elementsArr = widgetOutput.segmentData;
    this.profileAnalysisParams = widgetOutput.analysisData;
  }

  public calculateSegmentParams(formData: MotionProfileFormData, profileElementsColl: ProfileElementsCollection) {

    for (const eleName in this.elementsArr) {
      if (this.elementsArr.hasOwnProperty(eleName)) {

        const profileElement = new ProfileElement;
        const element = this.elementsArr[eleName][0];

        profileElement.name = eleName;

        profileElement.initialVelocity = element.velocity_initial;
        profileElement.finalVelocity = element.velocity_final;

        profileElement.initialTime = element.time_initial;
        profileElement.finalTime = element.time_final;

        profileElement.initialAcceleration = element.acceleration_initial;
        profileElement.finalAcceleration = element.acceleration_final;

        profileElement.initialPosition = element.position_initial;
        profileElement.finalPosition = element.position_final;


        // calculating Segment Duration
        profileElement.segmentDuration = profileElement.finalTime - profileElement.initialTime;

        // calculating a2t value for each elemnt
        profileElement.a2t = profileElement.segmentDuration * Math.pow(profileElement.finalAcceleration, 2);

        profileElementsColl.add(profileElement);
      }
    }
  }

  public calculateAnalysisParams(formData: MotionProfileFormData, profileElementsColl: ProfileElementsCollection,
    analysisParams: AnalysisParams) {

    // let rmsAcc = this.calcuateRMSAcceleration(profileElementsColl);

    analysisParams.peakAcceleration = this.profileAnalysisParams.peakAcc;
    analysisParams.rmsAcceleration = this.profileAnalysisParams.rmsAcc;

    analysisParams.peakSpeed = this.profileAnalysisParams.peakVel;
    analysisParams.rmsSpeed = this.profileAnalysisParams.rmsVel;
  }

  private calcuateRMSAcceleration(profileElementsColl: ProfileElementsCollection) {
    let rmsAcc = 0;
    let totalProfileTime = 0;
    let totalA2t = 0;

    const elementsColl: ProfileElement[] = profileElementsColl.getAll();

    for (let index = 0; index < elementsColl.length; index++) {
      const element = elementsColl[index];

      // calculating profile time
      totalProfileTime += element.segmentDuration;

      // calculating summation of a2t
      totalA2t += element.a2t;
    }

    rmsAcc = Math.sqrt(totalA2t / totalProfileTime);

    return rmsAcc;
  }

}
