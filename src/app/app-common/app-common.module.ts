import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { Angulartics2Module, Angulartics2GoogleAnalytics } from 'angulartics2';
import { AlertModule } from 'ngx-bootstrap/alert';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { AboutCourseComponent } from './about-course/about-course.component';
import { TocComponent } from './toc/toc.component';
import { MdViewerComponent } from './md-viewer/md-viewer.component';
import { AssessmentComponent } from './assessment/assessment.component';
import { QuestionComponent } from './question/question.component';
import { CourseObjectiveComponent } from './course-objective/course-objective.component';
import { CourseAuthorsComponent } from './course-authors/course-authors.component';
// import { AssessmentReportComponent } from './assessment-report/assessment-report.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ProgressViewerComponent } from './progress-viewer/progress-viewer.component';
import { PieChartPlotterComponent } from './pie-chart-plotter/pie-chart-plotter.component';
// import { CourseBadgesComponent } from './course-badges/course-badges.component';
// import { CurrentStatusComponent } from './current-status/current-status.component';
import { CourseIntroComponent } from './course-intro/course-intro.component';
// import { QuestionMcsrComponent } from './question-mcsr/question-mcsr.component';
import { GlossaryComponent } from './glossary/glossary.component';
import { NotesComponent } from './notes/notes.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { FeatureNotAvailableDirective } from '../directive/feature-not-available.directive';
import { ModalComponent } from './modal/modal.component';
import { ChapterProgressViewerComponent } from './chapter-progress-viewer/chapter-progress-viewer.component';
import { SectionNameCorrectionPipe } from './chapter-progress-viewer/section-name-correction.pipe';
import { MathRoundPipe } from './chapter-progress-viewer/math-round.pipe';
import { SideNavigatorComponent } from './side-navigator/side-navigator.component';
import { UnitComboboxComponent } from './unit-combobox/unit-combobox.component';
import { SideNavigatorService } from './side-navigator/side-navigator.service';
import { PopupComponent } from 'app/app-common/popup/popup.component';
import { InertiaCalculatorComponent } from 'app/app-common/inertia-calculator/inertia-calculator.component';
import { WidgetLauncherDirective } from '../directive/widget-launcher.directive';
import { EarlyAccessComponent } from './early-access/early-access.component';
import { MDLauncherComponent } from './md-launcher/md-launcher.component';
import { MdContentService } from '../servo-system-course/services/md-content.service';
import { ProductService } from '../servo-system-course/services/product.service';

import { CourseTocComponent } from './course-toc/course-toc.component';
import { CourseForewordComponent } from './course-foreword/course-foreword.component';
import { LoViewerComponent } from './lo-viewer/lo-viewer.component';
import { UnderConstructionDirective } from '../directive/under-construction.directive';
import { CosmattTableComponent } from './cosmatt-table/cosmatt-table.component';
import { CosmattTableCellDirective } from './cosmatt-table/cosmatt-table-cell.directive';
import { SortableDirective } from './cosmatt-table/sortable.directive';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TooltipModule,
    Angulartics2Module,
    ReactiveFormsModule,
    FormsModule,
    AlertModule
  ],
  exports: [
    AboutCourseComponent,
    TocComponent,
    MdViewerComponent,
    AssessmentComponent,
    CourseObjectiveComponent,
    CourseAuthorsComponent,
    SidebarComponent,
    InertiaCalculatorComponent,
    ProgressViewerComponent,
    PieChartPlotterComponent,
    CourseIntroComponent,
    FeatureNotAvailableDirective,
    WidgetLauncherDirective,
    UnderConstructionDirective,
    ModalComponent,
    EarlyAccessComponent,
    PopupComponent,
    ChapterProgressViewerComponent,
    SideNavigatorComponent,
    UnitComboboxComponent,
    MDLauncherComponent,
    CourseTocComponent,
    CourseForewordComponent,
    LoViewerComponent,
    CosmattTableComponent,
    CosmattTableCellDirective
  ],
  declarations: [
    AboutCourseComponent,
    TocComponent,
    MdViewerComponent,
    AssessmentComponent,
    QuestionComponent,
    CourseObjectiveComponent,
    CourseAuthorsComponent,
    SidebarComponent,
    ProgressViewerComponent,
    PieChartPlotterComponent,
    InertiaCalculatorComponent,
    CourseIntroComponent,
    GlossaryComponent,
    NotesComponent,
    AnalyticsComponent,
    FeatureNotAvailableDirective,
    WidgetLauncherDirective,
    UnderConstructionDirective,
    ModalComponent,
    EarlyAccessComponent,
    PopupComponent,
    ChapterProgressViewerComponent,
    SectionNameCorrectionPipe,
    SideNavigatorComponent,
    MathRoundPipe,
    UnitComboboxComponent,
    MDLauncherComponent,
    CourseTocComponent,
    CourseForewordComponent,
    LoViewerComponent,
    CosmattTableComponent,
    CosmattTableCellDirective,
    SortableDirective
  ],
  providers: [
    TooltipModule,
    AlertModule,
    SideNavigatorService,
    MdContentService,
    ProductService
  ],
  // ng syntax to allow compilation of components beforehand, that will be later injected programmatically
  entryComponents: [AssessmentComponent]
})
export class AppCommonModule { }
