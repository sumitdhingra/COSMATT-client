import { BaseModel } from '../shared/models/base.model';

export class MotionProfileFormData extends BaseModel {
    private _moveDistance: number = 0;
    private _moveTime: number = 0;
    private _velocityFactor: number = 0;
    private _dwellTime: number = 0;
    private _smoothness: number;

    get moveDistance() {
        return this._moveDistance;
    }
    set moveDistance(value: number) {
        this._moveDistance = value;
    }

    get moveTime() {
        return this._moveTime;
    }
    set moveTime(value: number) {
        this._moveTime = value;
    }

    get velocityFactor() {
        return this._velocityFactor;
    }
    set velocityFactor(value: number) {
        this._velocityFactor = value;
    }

    get dwellTime() {
        return this._dwellTime;
    }
    set dwellTime(value: number) {
        this._dwellTime = value;
    }
    get smoothness() {
        return this._smoothness;
    }
    set smoothness(value: number) {
        this._smoothness = value;
    }
}
