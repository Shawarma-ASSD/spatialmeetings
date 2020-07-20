import { Component, OnInit, Input } from '@angular/core';

import { Attendee } from '../../interfaces/attendee';

@Component({
  selector: 'app-attendee-panel',
  templateUrl: './attendee-panel.component.html',
  styleUrls: ['./attendee-panel.component.css']
})
export class AttendeePanelComponent implements OnInit {
  @Input() attendee: Attendee;

  constructor() { }

  ngOnInit(): void {
  }
}
