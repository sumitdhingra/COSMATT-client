import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassObjectiveProgressViewerComponent } from './class-objective-progress-viewer.component';

describe('ClassObjectiveProgressViewerComponent', () => {
  let component: ClassObjectiveProgressViewerComponent;
  let fixture: ComponentFixture<ClassObjectiveProgressViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassObjectiveProgressViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassObjectiveProgressViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
