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

  /**
   * camera
   * Provisional method, for status pipe, should be replaced.
   */
  camera() {
    return this.attendee.getCameraStatus() ? 'Activada' : 'Desactivada';
  }

  /**
   * mic
   * Provisional method, fro status pipe, should be replaced.
   */
  mic() {
    return this.attendee.getMicrophoneStatus() ? 'Activado' : 'Desactivado';
  }
}
