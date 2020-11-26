import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CosmattTableComponent } from './cosmatt-table.component';

describe('CosmattTableComponent', () => {
  let component: CosmattTableComponent;
  let fixture: ComponentFixture<CosmattTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CosmattTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CosmattTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
