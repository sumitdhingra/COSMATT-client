import { BaseModel } from '../shared/models/base.model';

export class SolutionAnalysisFormData extends BaseModel {
   
    private _temperature: number = 1;
    private _altitude: number = 40;
    private _motorIndex: number = 3;
    private _transmissionRatio: number = 1;
    

    get temperature() {
        return this._temperature;
    }
    set temperature(value: number) {
        this._temperature = value;
    }

    get altitude() {
        return this._altitude;
    }
    set altitude(value: number) {
        this._altitude = value;
    }

    get motorIndex() {
        return this._motorIndex;
    }
    set motorIndex(value: number) {
        this._motorIndex = value;
    }
   
    get transmissionRatio() {
        return this._transmissionRatio;
    }
    set transmissionRatio(value: number) {
        this._transmissionRatio = value;
    }
}
