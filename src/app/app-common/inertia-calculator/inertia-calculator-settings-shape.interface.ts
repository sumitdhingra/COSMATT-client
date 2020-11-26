export interface IInertiaCalculatorSettingsShape {
    ShapeInfo: {
        Type: string;
        Name: string;
        InnerRadius?: number;
        OuterRadius?: number;
        Radius?: number
        Mass: number;
        Material: string;
        Height: number;
        AxisofRotation: string;
        CalculationMode: string;
        FormulaString: string;
    };
    InclusionMode: string;
};