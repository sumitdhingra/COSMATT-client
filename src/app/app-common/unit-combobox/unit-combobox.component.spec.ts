import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitComboboxComponent } from './unit-combobox.component';

describe('UnitComboboxComponent', () => {
  let component: UnitComboboxComponent;
  let fixture: ComponentFixture<UnitComboboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnitComboboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnitComboboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
