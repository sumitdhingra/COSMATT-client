import { BaseModel } from '../shared/models/base.model';

export class ComponentsDataState {
    motionProfile = new DataState();
    rotaryLoad = new DataState();
    linearLoad = new DataState();
    transmission = new DataState();
}

export class DataState {
    formValidity = false;
    // in case calculation validity state needs to be stored
    // calculationsValidity = false;
}
