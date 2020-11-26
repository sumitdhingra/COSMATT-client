export enum ViewType {
    AxisView = 'AXIS_VIEW',
    PowerSupplyView = 'POWER_SUPPLY_VIEW',
    BomView = 'BOM_VIEW'
}

export enum ComponentViewMode {
    Tabular = 'TABULAR',
    Form = 'FORM'
}

export enum UnitSystem {
    Imperial = 'IMPERIAL',
    Metric = 'METRIC'
}

export enum MotionType {
    Rotary = 'ROTARY',
    Linear = 'LINEAR'
}

export enum SizingComponentType {
    MotionType = 'motionType',
    MotionProfile = 'motionProfile',
    RotaryLoad = 'rotaryLoad',
    LinearLoad = 'linearLoad',
    Transmission = 'transmission',
    SolutionAnalysis = 'solutionAnalysis',
    Summary = 'summary'
}

export const SizingComponentTitle = {
    motionType: 'Motion Type',
    motionProfile: 'Motion Profile',
    rotaryLoad: 'Rotary Load',
    linearLoad: 'Linear Load',
    transmission: 'Transmission',
    solutionAnalysis: 'Solution Analysis',
    summary: 'Summary'
};

export const SizingComponentHeader = {
    motionType: {
        heading : 'Choose Motion Type',
        subHeading : 'Please select an appropriate motion type.'
    },
    motionProfile: {
        heading : 'Create Your Profile',
        subHeading : `A motion profile can be as simple as a movement from point A to point B on a single axis, 
                    or it may be a complex move in which multiple axes need to move precisely in coordination.`
    },
    rotaryLoad: {
        heading : 'Define Your Rotary Load',
        subHeading : `Rotary payload is generally in the form of a rotating mechanism which will have inertia. 
                    The motor which drives the axis will need to overcome some kind of resistance in order to rotate this payload. 
                    This is seen as a load torque.`
    },
    linearLoad: {
        heading : 'Define Your Linear Load',
        subHeading : 'Coming Soon!'
    },
    transmission: {
        heading : 'Add Transmission',
        subHeading : `The motors are often connected to the load mass or load inertia through a transmission system. 
        This may be a gearbox, toothed belt/pulley system or some other transmission mechanism.`
    },
    solutionAnalysis: {
        heading : 'Solution Analysis',
        subHeading : 'You should select a motor and drive which are supplied by the manufacturer as a matched pair.'
    },
    summary: {
        heading : 'Summary',
        subHeading : 'Summary details.'
    }
};

export const MotionTypeElement = {
    Rotary : {
        name: 'Rotary Motion',
        description: `Rotary (rotational) motion is physical motion that happens when an object rotates or spins on an axis.`
    },
    Linear : {
        name: 'Linear Motion',
        description: 'Linear motion also referred to as rectilinear motion is a one dimensional motion along a straight line.'
    }
};

