import { Injectable } from '@angular/core';
import { ProfileElement, ProfileElementsCollection } from '../shared/models/profile-element-list.model';
import { ISizingCalculations } from '../shared/interfaces/sizing-calculation-service.interface';
import { AnalysisParams } from "../shared/models/analysis-params.model";
import { SolutionAnalysisFormData } from "./solution-analysis-form-data.model";
@Injectable()

export class SolutionAnalysisCalculationsService implements ISizingCalculations{
  
  solutionAnalysisMotorData: any;
  constructor() { }
  motorInertia = 0;

  public setMotorInertia(motorInertia) {
    this.motorInertia = motorInertia;
  }
  public calculateSegmentParams(formData: SolutionAnalysisFormData, profileElementsColl: ProfileElementsCollection) {

    let elementsColl: ProfileElement[] = profileElementsColl.getAll();

    for (const element of elementsColl) {

      //Calculating motor accleration torque
      element.motorAccelerationTorque = element.finalAcceleration * this.motorInertia;
      //Calculating motor total torque
      element.totalMotorTorque = element.motorAccelerationTorque + element.totalTorque;
      element.motorInertia = this.motorInertia;
      element.transmissionRatio = formData.transmissionRatio;
    }

  }
  public calculateAnalysisParams(formData: SolutionAnalysisFormData, profileElementsColl: ProfileElementsCollection) {
    let analysisParams = new AnalysisParams();
    return analysisParams;
  }
  public updateSolutionAnalysisMotorData(data: any) {
    this.solutionAnalysisMotorData = data;
  }

}
