/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SizingAppSaverComponent } from './sizing-app-saver.component';

describe('AboutCourseComponent', () => {
  let component: SizingAppSaverComponent;
  let fixture: ComponentFixture<SizingAppSaverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SizingAppSaverComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SizingAppSaverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
