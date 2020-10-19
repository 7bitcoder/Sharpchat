import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StrangerInfoComponent } from './stranger-info.component';

describe('StrangerInfoComponent', () => {
  let component: StrangerInfoComponent;
  let fixture: ComponentFixture<StrangerInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StrangerInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StrangerInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
