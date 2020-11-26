/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { ServoSystemCourseComponent } from './servo-system-course.component';

describe('ServoSystemCourseComponent', () => {
  let component: ServoSystemCourseComponent;
  let fixture: ComponentFixture<ServoSystemCourseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServoSystemCourseComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServoSystemCourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
