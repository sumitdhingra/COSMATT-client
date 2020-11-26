import { BaseModel } from './base.model';
import { ViewType, UnitSystem } from './sizing.enum';

export class AppViewSettings  extends BaseModel {
    activeView: string = ViewType.AxisView;
    unitSystem: string = UnitSystem.Imperial;
}
