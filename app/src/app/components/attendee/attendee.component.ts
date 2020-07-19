import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { Attendee } from '../../interfaces/attendee';

@Component({
  selector: 'app-attendee',
  templateUrl: './attendee.component.html',
  styleUrls: ['./attendee.component.css']
})
export class AttendeeComponent implements OnInit {
  @Input() attendee: Attendee;

  constructor() { }

  ngOnInit(): void { }

  camera() {
    return this.attendee.getCameraStatus() ? 'Activada' : 'Desactivada';
  }

  mic() {
    return this.attendee.getMicrophoneStatus() ? 'Activado' : 'Desactivado';
  }
}
