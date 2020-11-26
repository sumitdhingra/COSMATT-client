import { BaseModel } from '../shared/models/base.model';
import { ComponentsFormData, ComponentsValidityStatus } from './components-form-data.model';
import { ComponentViewMode } from '../shared/models/sizing.enum';
export class Axis extends BaseModel {
    private _id: string;
    private _name: string;
    private _motionType: string;
    private _selectedSizingComponent: string;
    private _componentsFormData = new ComponentsFormData();
    private _sizingComponentsSequence: string[] = [];
    private _componentsValidityStatus = new ComponentsValidityStatus();
    private _componentViewMode: string = ComponentViewMode.Form;

    get id() {
        return this._id;
    }
    set id(value: string) {
        this._id = value;
    }
    get name() {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
    }

    get motionType() {
        return this._motionType;
    }
    set motionType(value: string) {
        this._motionType = value;
    }

    get selectedSizingComponent() {
        return this._selectedSizingComponent;
    }
    set selectedSizingComponent(value: string) {
        this._selectedSizingComponent = value;
    }

    get componentsFormData(): ComponentsFormData {
        return this._componentsFormData;
    }
    set componentsFormData(value: ComponentsFormData) {
        this._componentsFormData = value;
    }

    get componentViewMode(): string {
        return this._componentViewMode;
    }
    set componentViewMode(value: string) {
        this._componentViewMode = value;
    }

    get sizingComponentsSequence(): string[] {
        return this._sizingComponentsSequence;
    }
    set sizingComponentsSequence(value: string[]) {
        this._sizingComponentsSequence = value;
    }

    get componentsValidityStatus(): ComponentsValidityStatus {
        return this._componentsValidityStatus;
    }
    set componentsValidityStatus(value: ComponentsValidityStatus) {
        this._componentsValidityStatus = value;
    }

}
