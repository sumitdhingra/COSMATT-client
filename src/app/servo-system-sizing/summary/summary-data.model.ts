import {
  SizingComponentType,
  SizingComponentTitle
} from './../shared/models/sizing.enum';

export const SummaryDataModel = [
  {
    id: SizingComponentType.MotionType,
    number: '1',
    name: SizingComponentTitle.motionType + ' Inputs',
    imgPath: './assets/img/MotionType.svg',
    propertyList: [
      {
        id: 'selectedMotionType',
        name: 'Selected Motion Type',
        value: 'Rotary Load',
        unit: ''
      }
    ]
  },
  {
    id: SizingComponentType.MotionProfile,
    number: '2',
    name: SizingComponentTitle.motionProfile + ' Inputs',
    imgPath: './assets/img/MotionProfile.svg',
    propertyList: [
      {
        id: 'moveDistance',
        name: 'Move Distance',
        value: 0,
        unit: 'rev'
      },
      {
        id: 'velocityFactor',
        name: 'Crest Factor',
        value: 0,
        unit: ''
      },
      {
        id: 'moveTime',
        name: 'Move Time',
        value: 0,
        unit: 'sec'
      },
      {
        id: 'dwellTime',
        name: 'Dwell Time',
        value: 0,
        unit: 'sec'
      }
    ]
  },
  {
    id: SizingComponentType.RotaryLoad,
    number: '3',
    name: SizingComponentTitle.rotaryLoad + ' Inputs',
    imgPath: './assets/img/RotaryLoad.svg',
    propertyList: [
      {
        id: 'loadInertia',
        name: 'Load Inertia',
        value: 0,
        unit: 'kg-m',
        superValue: '2'
      },
      {
        id: 'externalTorque',
        name: 'External Torque',
        value: 0,
        unit: 'N-m'
      },
      {
        id: 'frictionTorque',
        name: 'Friction Torque',
        value: 0,
        unit: 'N-m'
      }
    ]
  },
  {
    id: SizingComponentType.Transmission,
    number: '4',
    name: SizingComponentTitle.transmission + ' Inputs',
    imgPath: './assets/img/Transmission.svg?v2',
    propertyList: [
      {
        id: 'transmissionRatio',
        name: 'Transmission Ratio',
        value: 0,
        unit: ''
      },
      {
        id: 'transmissionInertia',
        name: 'Transmission Inertia',
        value: 0,
        unit: 'N-m'
      },
      {
        id: 'transmissionEfficiency',
        name: 'Transmission Efficiency',
        value: 0,
        unit: 'N-m'
      }
    ]
  },
  {
    id: SizingComponentType.SolutionAnalysis,
    number: '5',
    name: SizingComponentTitle.solutionAnalysis,
    imgPath: './assets/img/Solution.svg?v2',
    propertyList: [
      {
        id: 'selectedMotor',
        name: 'Selected Motor',
        value: 'CPB-1-01',
        unit: '',
      },
      {
        id: 'motorInertia',
        name: 'Inertia',
        value: 0,
        unit: 'kg-m',
        superValue: '2'
      },
      {
        id: 'maxSpeed',
        name: 'Maximum Speed',
        value: 0,
        unit: 'rpm'
      },
      {
        id: 'peakStallTorque',
        name: 'Peak Stall Torque',
        value: 0,
        unit: 'N-m'
      },
      {
        id: 'contStallTorque',
        name: 'Continuous Stall Torque',
        value: 0,
        unit: 'N-m'
      }
    ]
  }
];

export const SolutionAnalysisAdditionalData  = {

    applicationTSRequirement: [
      {
        id: 'peakTorque',
        name: 'Peak Torque',
        value: {
          loadSide: 0,
          motorSide: 0
        },
        unit: 'N-m'
      },
      {
        id: 'rmsTorque',
        name: 'RMS Torque',
        value: {
          loadSide: 0,
          motorSide: 0
        },
        unit: 'N-m'
      },
      {
        id: 'peakSpeed',
        name: 'Peak Speed',
        value: {
          loadSide: 0,
          motorSide: 0
        },
        unit: 'rpm'
      },
      {
        id: 'peakAcceleration',
        name: 'Peak Acceleration',
        value: {
          loadSide: 0,
          motorSide: 0
        },
        unit: 'rad/sec',
        superValue : '2'
      },
      {
        id: 'rmsAcceleration',
        name: 'RMS Acceleration',
        value: {
          loadSide: 0,
          motorSide: 0
        },
        unit: 'rad/sec',
        superValue : '2'
      }
    ],
    EnvironmentFactors: [
      {
        id: 'temperature',
        name: 'Temperature',
        value: 0,
        unit: 'C'
      },
      {
        id: 'altitude',
        name: 'Altitude',
        value: 0,
        unit: 'm'
      }
    ]
  };

