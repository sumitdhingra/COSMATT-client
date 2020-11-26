/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MDLauncherComponent } from './md-launcher.component';

describe('MDLauncherComponent', () => {
  let component: MDLauncherComponent;
  let fixture: ComponentFixture<MDLauncherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MDLauncherComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MDLauncherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
