import { BaseModel } from '../shared/models/base.model';

export class TransmissionFormData extends BaseModel {
    private _transmissionRatio = 1;
    private _transmissionEfficiency = 100;
    private _transmissionInertia = 0;

    get transmissionRatio(): number{
        return this._transmissionRatio;
    }
    set transmissionRatio(value: number) {
        this._transmissionRatio = value;
    }

    get transmissionEfficiency(): number {
        return this._transmissionEfficiency;
    }
    set transmissionEfficiency(value: number) {
        this._transmissionEfficiency = value;
    }

    get transmissionInertia(): number {
        return this._transmissionInertia;
    }
    set transmissionInertia(value: number) {
        this._transmissionInertia = value;
    }
}
