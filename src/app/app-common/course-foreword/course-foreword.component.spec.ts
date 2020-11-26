import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseForewordComponent } from './course-foreword.component';

describe('CourseForewordComponent', () => {
  let component: CourseForewordComponent;
  let fixture: ComponentFixture<CourseForewordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourseForewordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourseForewordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
