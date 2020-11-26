import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassOverallAnalyticsComponent } from './class-overall-analytics.component';

describe('ClassOverallAnalyticsComponent', () => {
  let component: ClassOverallAnalyticsComponent;
  let fixture: ComponentFixture<ClassOverallAnalyticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassOverallAnalyticsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassOverallAnalyticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
