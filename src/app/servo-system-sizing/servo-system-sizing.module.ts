import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

// modules
import { ServoSystemSizingRoutingModule } from './servo-system-sizing-routing.module';
import { AppCommonModule } from '../app-common/app-common.module';
import { FileStoreModule } from '../file-store/file-store.module';

// services
import { SizingAppDataService } from './shared/services/sizing-app-data.service';
import { AxisCollectionService } from './shared/services/axis-collection.service';
import { SequencerService } from './shared/services/sequencer.service';
import { RotaryLoadCalculationsService } from './rotary-load/rotary-load-calculations.service';
import { ProfileCalculationService } from './motion-profile/profile-calculation.service';
import { SolutionAnalysisCalculationsService } from './solution-analysis/solution-analysis-calculations.service';

// components
import { AxisComponent } from './axis/axis.component';
import { ServoSystemSizingComponent } from './servo-system-sizing.component';
import { SizingAppComponent } from './sizing-app/sizing-app.component';
import { MotionProfileComponent } from './motion-profile/motion-profile.component';
import { TransmissionComponent } from './transmission/transmission.component';
import { RotaryLoadComponent } from './rotary-load/rotary-load.component';
import { SolutionAnalysisComponent } from './solution-analysis/solution-analysis.component';
import { MotionElementsComponent } from './motion-elements/motion-elements.component';
import { TransmissionCalculationService } from 'app/servo-system-sizing/transmission/transmission-calculation.service';
import { MotionTypeComponent } from './motion-type/motion-type.component';
import { SizingAppHeaderComponent } from './sizing-app-header/sizing-app-header.component';
import { SizingAppSaverComponent } from './sizing-app-saver/sizing-app-saver.component';
import { MotionElementsPopupComponent } from './motion-elements-popup/motion-elements-popup.component';
import { SummaryComponent } from './summary/summary.component';

@NgModule({
  imports: [
    CommonModule,
    ServoSystemSizingRoutingModule,
    AppCommonModule,
    FileStoreModule,
    FormsModule,
    TooltipModule,
    ModalModule.forRoot()
  ],
  declarations: [
    AxisComponent,
    ServoSystemSizingComponent,
    SizingAppComponent,
    MotionProfileComponent,
    TransmissionComponent,
    RotaryLoadComponent,
    SolutionAnalysisComponent,
    MotionElementsComponent,
    MotionTypeComponent,
    SizingAppHeaderComponent,
    SizingAppSaverComponent,
    MotionElementsPopupComponent,
    SummaryComponent
  ],
  providers: [
    SizingAppDataService,
    AxisCollectionService,
    SequencerService,
    RotaryLoadCalculationsService,
    TransmissionCalculationService,
    ProfileCalculationService,
    SolutionAnalysisCalculationsService,
    BsModalService
  ]
})
export class ServoSystemSizingModule { }
