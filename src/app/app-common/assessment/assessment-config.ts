import { AssessmentType } from './assessment-type.enum';
import { AssessmentSubType } from './assessment-subtype.enum';

/**
 * Defines options for setting different assessment modes concerning -
 * 1. UI
 * 2. Functionality.
 */
export interface IAssessmentConfig {
  // UI
  useMinimalUI?: boolean;
  useFullPageView?: boolean;

  // Functionality
  showQuestionNavigator?: boolean;
  showCMWButton?: boolean;
  showSubmitButton?: boolean;
  showHintButton?:boolean;
  showResetButton?:boolean
}

/**
 * Config for assessment component to set different modes
 * as defined in IAssessmentConfig
 */
export class AssessmentConfig {

  private _type: AssessmentType = AssessmentType.Formative;
  private _subType: AssessmentSubType = AssessmentSubType.EndOfSection;

  // Set defaults for AssessmentConfig
  private _config: IAssessmentConfig;

  public get config(): IAssessmentConfig  {
    return this._config;
  }
  public set config(value: IAssessmentConfig ) {
    this._config = value;
  }

  public get type(): AssessmentType  {
    return this._type;
  }
  public set type(value: AssessmentType ) {
    this._type = value;
  }

  public get subType(): AssessmentSubType  {
    return this._subType;
  }
  public set subType(value: AssessmentSubType ) {
    this._subType = value;
  }

  /**
   * Returns an object of type IAssessmentConfig for UI and functionality setting
   * @param subType : AssessmentSubType - Used to set the UI and functionality on a defined basis
   */
  private _getConfig(type: AssessmentType, subType: AssessmentSubType): IAssessmentConfig {
    switch (type) {
      case AssessmentType.Formative:
        if ( subType === AssessmentSubType.InSection ) {
          return {
            useMinimalUI: true,
            useFullPageView: false,
            showQuestionNavigator: false,
            showCMWButton: false,
            showSubmitButton: true,
            showHintButton: true,
            showResetButton: true,
          };
        } else if ( subType === AssessmentSubType.EndOfSection ) {
          return {
            useMinimalUI: false,
            useFullPageView: false,
            showQuestionNavigator: true,
            showCMWButton: true,
            showSubmitButton: false,
            showHintButton: true,
            showResetButton: true,
          };
        }
        break;

      case AssessmentType.Summative:
        if ( subType === AssessmentSubType.InSection ) {
          return {
            useMinimalUI: true,
            useFullPageView: false,
            showQuestionNavigator: true,
            showCMWButton: true,
            showSubmitButton: true,
            showHintButton: true,
            showResetButton: true,
          };
        } else if ( subType === AssessmentSubType.EndOfSection ) {
          return {
            useMinimalUI: false,
            useFullPageView: true,
            showQuestionNavigator: true,
            showCMWButton: true,
            showSubmitButton: true,
            showHintButton: true,
            showResetButton: true,
          };
        }
        break;

      default:
        throw new Error('Invalid AssessmentType value');
    }
  }

  /**
   * Returns an instance of AssessmentConfig class.
   * @param type : AssessmentType
   * @param subType : AssessmentSubType
   * @param config : IAssessmentConfig - Passing this value will override the internal config setting logic
   */
  constructor(type: AssessmentType, subType: AssessmentSubType, config?: IAssessmentConfig) {
    this.type = type;
    this.subType = subType;
    this.config = this._getConfig(type, subType);

    // If config is present, override own logic of setting config
    if ( config ) {
      Object.assign(this.config, config);
    }
  }
}
