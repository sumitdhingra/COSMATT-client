/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { EomTestComponent } from './eom-test.component';

describe('EomTestComponent', () => {
  let component: EomTestComponent;
  let fixture: ComponentFixture<EomTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EomTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EomTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
