import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PopMessagesComponent } from './pop-messages.component';

describe('PopMessagesComponent', () => {
  let component: PopMessagesComponent;
  let fixture: ComponentFixture<PopMessagesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PopMessagesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PopMessagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
