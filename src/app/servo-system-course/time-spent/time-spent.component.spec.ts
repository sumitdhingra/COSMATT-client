import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSpentComponent } from './time-spent.component';

describe('TimeSpentComponent', () => {
  let component: TimeSpentComponent;
  let fixture: ComponentFixture<TimeSpentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSpentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSpentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
