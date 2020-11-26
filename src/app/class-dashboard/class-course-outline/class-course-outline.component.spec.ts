import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassCourseOutlineComponent } from './class-course-outline.component';

describe('ClassCourseOutlineComponent', () => {
  let component: ClassCourseOutlineComponent;
  let fixture: ComponentFixture<ClassCourseOutlineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassCourseOutlineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassCourseOutlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
