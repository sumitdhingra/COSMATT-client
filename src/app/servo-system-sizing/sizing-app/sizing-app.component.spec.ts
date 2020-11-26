import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SizingAppComponent } from './sizing-app.component';

describe('SizingAppComponent', () => {
  let component: SizingAppComponent;
  let fixture: ComponentFixture<SizingAppComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SizingAppComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SizingAppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
