import { BaseModel } from '../shared/models/base.model';

export class MotionTypeFormData extends BaseModel {
    private _selectedMotionType = '';

    get selectedMotionType() {
        return this._selectedMotionType;
    }
    set selectedMotionType(value: string) {
        this._selectedMotionType = value;
    }
}