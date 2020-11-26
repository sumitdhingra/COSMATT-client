import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SizingAppHeaderComponent } from './sizing-app-header.component';

describe('SizingAppHeaderComponent', () => {
  let component: SizingAppHeaderComponent;
  let fixture: ComponentFixture<SizingAppHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SizingAppHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SizingAppHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
