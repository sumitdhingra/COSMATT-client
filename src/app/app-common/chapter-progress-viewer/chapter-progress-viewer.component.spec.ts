import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChapterProgressViewerComponent } from './chapter-progress-viewer.component';

describe('ChapterProgressViewerComponent', () => {
  let component: ChapterProgressViewerComponent;
  let fixture: ComponentFixture<ChapterProgressViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChapterProgressViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChapterProgressViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
