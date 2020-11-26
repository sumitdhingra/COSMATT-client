import { ProfileElementsCollection } from "../models/profile-element-list.model";
import { BaseModel } from '../models/base.model';
import { AnalysisParams } from '../models/analysis-params.model';

// interface which must be implemented by all sizing components
export interface ISizingCalculations {
    calculateSegmentParams(formData: BaseModel, profileElementsColl?: ProfileElementsCollection );
    calculateAnalysisParams(formData: BaseModel, profileElementsColl: ProfileElementsCollection, analysisParams:AnalysisParams);
}