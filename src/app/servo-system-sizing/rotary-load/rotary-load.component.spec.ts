import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RotaryLoadComponent } from './rotary-load.component';

describe('RotaryLoadComponent', () => {
  let component: RotaryLoadComponent;
  let fixture: ComponentFixture<RotaryLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RotaryLoadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RotaryLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
