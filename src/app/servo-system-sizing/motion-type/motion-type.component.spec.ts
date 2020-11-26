import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionTypeComponent } from './motion-type.component';

describe('MotionTypeComponent', () => {
  let component: MotionTypeComponent;
  let fixture: ComponentFixture<MotionTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotionTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotionTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
