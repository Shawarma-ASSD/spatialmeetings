import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { Attendee } from '../../interfaces/attendee';
import { MediaStreamTypes } from '../../lib/meeting-client';

@Component({
  selector: 'app-attendee',
  templateUrl: './attendee.component.html',
  styleUrls: ['./attendee.component.css']
})
export class AttendeeComponent implements OnInit {
  @Input() attendee: Attendee;

  constructor() { }

  ngOnInit(): void { }
}
