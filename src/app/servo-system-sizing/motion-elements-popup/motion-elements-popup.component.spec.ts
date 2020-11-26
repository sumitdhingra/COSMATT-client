import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionElementsPopupComponent } from './motion-elements-popup.component';

describe('MotionElementsPopupComponent', () => {
  let component: MotionElementsPopupComponent;
  let fixture: ComponentFixture<MotionElementsPopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MotionElementsPopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MotionElementsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
