import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoViewerComponent } from './lo-viewer.component';

describe('LoViewerComponent', () => {
  let component: LoViewerComponent;
  let fixture: ComponentFixture<LoViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoViewerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
