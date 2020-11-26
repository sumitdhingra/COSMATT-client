import { AnalysisParams } from '../shared/models/analysis-params.model';

export class ComponentsAnalysisParamsData {
    motionProfile: AnalysisParams = new AnalysisParams();
    rotaryLoad: AnalysisParams = new AnalysisParams();
    linearLoad: AnalysisParams = new AnalysisParams();
    transmission: AnalysisParams = new AnalysisParams();
    solutionAnalysis: AnalysisParams = new AnalysisParams();
    summary: AnalysisParams = new AnalysisParams();
}
