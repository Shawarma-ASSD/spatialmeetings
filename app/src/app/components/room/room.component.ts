import { Component, OnInit, NgZone } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { SessionService } from '../../services/session.service';
import { MeetingService } from '../../services/meeting.service';
import { MediaStreamTypes } from '../../lib/meeting-client';
import { ErrorCode } from '../../interfaces/codes';
import { Attendee } from '../../interfaces/attendee';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  attendees: Array<Attendee> = [];
  local: Attendee;

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private session: SessionService,
    private meeting: MeetingService
  ) { }

  async ngOnInit() {
    let roomName = this.route.snapshot.paramMap.get('roomName');
    if (this.session.isReady()) {
      this.roomInit(roomName);
    } else {
      this.session.ready.subscribe(
        async () => { 
          this.zone.run( async () => {
            await this.roomInit(roomName); 
          });
        }
      );
    }
  }

  /**
   * onAttendeeJoined
   * Fired when a new Attendee joined the meeting room.
   */
  private onAttendeeJoined(user: string) {
    this.zone.run( () => {

    });
  }

  /**
   * onAttendeeLeft
   * Fired when a new Attendee left the meeting room.
   */
  private onAttendeeLeft(user: string) {
    this.zone.run( () => {

    });
  }

  /**
   * onStreamAdded
   * Fired when an Attendee has added a new streaming device to its producers.
   */
  private onStreamAdded(user: string, type: any, stream: any) {
    this.zone.run( () => {
      this.getAttendee(user).addStream(type, stream);
    });
  }

  /**
   * onStreamRemoved
   * Fired when an Attendee has removed a streaming device from its producers.
   */
  private onStreamRemoved(user: string, type: any) {
    this.zone.run( () => {
      this.getAttendee(user).removeStream(type);
    });
  }

  /**
   * onStreamPaused
   * Fired when an Attendee has paused some streaming device.
   */
  private onStreamPaused(user: string, type: any) {
    this.zone.run( () => {

    });
  }

  /**
   * onStreamResumed
   * Fired when an Attendee has resumed its streaming device.
   */
  private onStreamResumed(user: string, type: any) {
    this.zone.run( () => {

    });
  }

  /**
   * hasAttendee
   * Returns if exists or not the attendee.
   */
  private hasAttendee(user: string) {
    return this.attendees.find(attendee => attendee.getUser() == user) !== undefined;
  }

  /**
   * getAttendee
   * Returns the Attendee, if not found, creates a new instance.
   */
  private getAttendee(user: string) {
    let attendee = this.attendees.find(attendee => attendee.getUser() == user);
    if ( !attendee ) {
      attendee = new Attendee(user);
      this.attendees.push(attendee);
    }
    return attendee;
  }

  /**
   * roomInit
   * Initialization of the Room meeting.
   */
  private async roomInit(roomName: string) {
    // User profile information with Google OAuth
    if ( !this.session.isSigned() ) {
      this.session.signIn();
    }
    let user = this.session.getUser();

    // Verifying existence of the Room
    if ( await this.meeting.getClient().roomExists(roomName) ) {
      // Setting the local Attendee instance, and getting the media device
      // streaming instances, for both audio and video
      this.local = new Attendee(user.email);
      let videoStream = await window.navigator.mediaDevices.getUserMedia({ video: true });
      let audioStream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      this.local.addStream(MediaStreamTypes.Microphone, audioStream);
      this.local.addStream(MediaStreamTypes.WebCam, videoStream);

      // Setting the Meeting Client
      this.meeting.getClient().setUser(user.email);
      this.meeting.getClient().addStream(audioStream, MediaStreamTypes.Microphone);
      this.meeting.getClient().addStream(videoStream, MediaStreamTypes.WebCam);

      // Set the callback for each event raised by the MeetingClient
      this.meeting.getClient().setAttendeeJoined( (user) => this.onAttendeeJoined(user) );
      this.meeting.getClient().setAttendeeLeft( (user) => this.onAttendeeLeft(user) );
      this.meeting.getClient().setStreamAdded( (user, type, stream) => this.onStreamAdded(user, type, stream) );
      this.meeting.getClient().setStreamRemoved( (user, type) => this.onStreamRemoved(user, type) );
      this.meeting.getClient().setStreamPaused( (user, type) => this.onStreamPaused(user, type) );
      this.meeting.getClient().setStreamResumed( (user, type) => this.onStreamResumed(user, type) );

      // ¡Try to connect to the Meeting Room!
      this.meeting.getClient().connect(roomName);
    } else {
      this.router.navigate(['', { code: ErrorCode.RoomNotFound }]);
    }
  }
}