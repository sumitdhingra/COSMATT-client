import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetuseraccountComponent } from './resetuseraccount.component';

describe('ResetuseraccountComponent', () => {
  let component: ResetuseraccountComponent;
  let fixture: ComponentFixture<ResetuseraccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetuseraccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetuseraccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
