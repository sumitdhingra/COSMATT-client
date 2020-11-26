import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionAnalysisComponent } from './solution-analysis.component';

describe('SolutionAnalysisComponent', () => {
  let component: SolutionAnalysisComponent;
  let fixture: ComponentFixture<SolutionAnalysisComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolutionAnalysisComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionAnalysisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
