import { SizingComponentType } from '../models/sizing.enum';
import { ProfileElementsCollection } from '../models/profile-element-list.model';
import { AnalysisParams } from '../models/analysis-params.model';

// Interface for @Output form data EventEmitter type
export interface IComponentFormData {
    data: any;
    sizingComponentType: SizingComponentType;
}

// Interface for @Output form data EventEmitter type
export interface IComponentProfileElementData {
    profileElementsCollection: ProfileElementsCollection;
    sizingComponentType: SizingComponentType;
    analysisParams?: AnalysisParams;
}

// Interface for @Output form data EventEmitter type
export interface IComponentFormValidationData {
    sizingComponentType: SizingComponentType;
    isValid: boolean;
}

// Interface for @Output data EventEmitter type for MotionType component
export interface IComponentMotionTypeOutputData {
    motionType: string;
}
