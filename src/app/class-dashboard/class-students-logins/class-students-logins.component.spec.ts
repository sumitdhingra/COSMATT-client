import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassStudentsLoginsComponent } from './class-students-logins.component';

describe('ClassStudentsLoginsComponent', () => {
  let component: ClassStudentsLoginsComponent;
  let fixture: ComponentFixture<ClassStudentsLoginsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassStudentsLoginsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassStudentsLoginsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
