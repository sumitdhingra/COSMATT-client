import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassTimeSpentComponent } from './class-time-spent.component';

describe('ClassTimeSpentComponent', () => {
  let component: ClassTimeSpentComponent;
  let fixture: ComponentFixture<ClassTimeSpentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassTimeSpentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassTimeSpentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
