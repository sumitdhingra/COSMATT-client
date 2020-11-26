import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionProfileComponent } from './motion-profile.component';

describe('MotionProfileComponent', () => {
  let component: MotionProfileComponent;
  let fixture: ComponentFixture<MotionProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotionProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotionProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
