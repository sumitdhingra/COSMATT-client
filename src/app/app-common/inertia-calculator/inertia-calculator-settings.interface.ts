import { IInertiaCalculatorSettingsShape } from './inertia-calculator-settings-shape.interface';

export interface IInertiaCalculatorSettings {
    ViewSettings: {
        DisplayShapeSelector: boolean
    };
    SelectedShape: number;
    Shapes: IInertiaCalculatorSettingsShape[];
}
