import { BaseModel } from '../shared/models/base.model';

export class RotaryLoadFormData extends BaseModel {
    private _loadInertia: number = 0;
    private _frictionTorque: number = 0;
    private _externalTorque: number = 0;

    get loadInertia() {
        return this._loadInertia;
    }
    set loadInertia(value: number) {
        this._loadInertia = value;
    }

    get frictionTorque() {
        return this._frictionTorque;
    }
    set frictionTorque(value: number) {
        this._frictionTorque = value;
    }

    get externalTorque() {
        return this._externalTorque;
    }
    set externalTorque(value: number) {
        this._externalTorque = value;
    }
}
