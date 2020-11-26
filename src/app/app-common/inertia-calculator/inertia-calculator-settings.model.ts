import { IInertiaCalculatorSettings } from './inertia-calculator-settings.interface';
import { IInertiaCalculatorSettingsShape } from './inertia-calculator-settings-shape.interface';

export class InertiaCalculatorSettings {

  /**
   * This class is for testing only. Need to implement this model.
   *
   * TODO
   * 1. Improve this to a class/interface
   */

  private _defaultSettings: IInertiaCalculatorSettings = {
    ViewSettings: {
      DisplayShapeSelector: false
    },
    SelectedShape: 0,
    Shapes: [
      {
        ShapeInfo: {
          Type: 'SolidCylinder',
          Name: 'Solid Cylinder',
          Radius: 0.001,
          Mass: 19,
          Material: 'Aluminium (1060 Alloy)',
          Height: 0.001,
          AxisofRotation: 'X',
          CalculationMode: 'Mass',
          FormulaString: 'I = \\frac{1}{2}{M \\left(\\frac{D}{2} \\right)^2}'
        },
        InclusionMode: '+'
      },
      {
        ShapeInfo: {
          Type: 'HollowCylinder',
          Name: 'Hollow Cylinder',
          InnerRadius: 0.0005,
          OuterRadius: 0.001,
          Mass: 19,
          Material: 'Aluminium (1060 Alloy)',
          Height: 0.001,
          AxisofRotation: 'X',
          CalculationMode: 'Mass',
          FormulaString: 'I = \\frac{1}{2}{M \\left(\\frac{D_{1}}{2} \\right)^2 + \\left(\\frac{D_{2}}{2} \\right)^2}'
        },
        InclusionMode: '+'
      }
    ]
  };

  private _settings: IInertiaCalculatorSettings;

  constructor(settings?: IInertiaCalculatorSettings) {
    if ( settings ) {
      this._settings = settings;
    } else {
      this._settings = this._defaultSettings;
    }
  }

  get defaultSettings(): any {
    return this._defaultSettings;
  }

  get settings(): any {
    return this._settings;
  }
  set settings(settings: any) {
    this._settings = settings;
  }

  addShape(shapeInfo: IInertiaCalculatorSettingsShape) {
    this._settings.Shapes.push(shapeInfo);
  }
}
