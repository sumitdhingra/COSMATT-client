import { Injectable } from '@angular/core';
import { SizingComponentType } from '../models/sizing.enum';

@Injectable()
export class SequencerService {

  constructor() { }

  get sizingComponentsSequence(): string[] {
    return [
      SizingComponentType.MotionType,
      SizingComponentType.MotionProfile,
      SizingComponentType.RotaryLoad,
      SizingComponentType.Transmission,
      SizingComponentType.SolutionAnalysis
      //SizingComponentType.Summary
    ];
  }


}
