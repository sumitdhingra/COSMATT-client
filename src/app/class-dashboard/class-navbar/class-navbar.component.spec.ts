import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClassNavbarComponent } from './class-navbar.component';

describe('ClassNavbarComponent', () => {
  let component: ClassNavbarComponent;
  let fixture: ComponentFixture<ClassNavbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClassNavbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClassNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
