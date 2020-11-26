import { BaseModel } from '../shared/models/base.model';
import { MotionProfileFormData } from '../motion-profile/motion-profile-form-data.model';
import { RotaryLoadFormData } from '../rotary-load/rotary-load-form-data.model';
import { MotionTypeFormData } from 'app/servo-system-sizing/motion-type/motion-type-form-data.model';

export class ComponentsFormData extends BaseModel {
    motionType: MotionTypeFormData;
    motionProfile: MotionProfileFormData;
    rotaryLoad: RotaryLoadFormData;
    linearLoad: any;
    transmission: any;
    solutionAnalysis: any;
    summary: any;
}

export class ComponentsValidityStatus {
    motionType = false;
    motionProfile = false;
    rotaryLoad = false;
    linearLoad = false;
    transmission = false;
    solutionAnalysis = false;
    summary = false;
}
