import { BaseModel } from './../shared/models/base.model';
export class MotionTypeClass extends BaseModel {
    private _name: string;
    private _type: string;
    private _description: string;

    get name() {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }
    get type() {
        return this._type;
    }
    set type(value: string) {
        this._type = value;
    }
    get description() {
        return this._description;
    }
    set description(value: string) {
        this._description = value;
    }
}
