import { Component, OnInit, Input, Pipe, PipeTransform } from '@angular/core';

import { Attendee } from '../../interfaces/attendee';

@Pipe( { name: 'micicon' } )
export class MicIconPipe implements PipeTransform {
  transform(status: boolean) {
    return status ? 'mic' : 'mic_off';
  }
}

@Pipe( { name: 'cameraicon' } )
export class CameraIconPipe implements PipeTransform {
  transform(status: boolean) {
    return status ? 'videocam' : 'videocam_off';
  }
}

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
