import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendeePanelComponent } from './attendee-panel.component';

describe('AttendeePanelComponent', () => {
  let component: AttendeePanelComponent;
  let fixture: ComponentFixture<AttendeePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendeePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendeePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
