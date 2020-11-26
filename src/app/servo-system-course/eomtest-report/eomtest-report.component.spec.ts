/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EomtestReportComponent } from './eomtest-report.component';

describe('EomtestReportComponent', () => {
  let component: EomtestReportComponent;
  let fixture: ComponentFixture<EomtestReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EomtestReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EomtestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
