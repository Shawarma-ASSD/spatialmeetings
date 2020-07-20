import { Component, OnInit, NgZone, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { CdkDragMove } from '@angular/cdk/drag-drop'

import { ResonanceAudio, RoomDimensions, RoomMaterials } from 'resonance-audio';

import { SessionService } from '../../services/session.service';
import { MeetingService } from '../../services/meeting.service';
import { SpatialService } from '../../services/spatial.service';

import { MediaStreamTypes } from '../../lib/meeting-client/meeting-client';
import { ErrorCode } from '../../interfaces/codes';
import { Attendee } from '../../interfaces/attendee';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  @ViewChild('attendeesContainer') attendeesContainer;
  @ViewChild('localContainer') localContainer;

  /* Room's Attendees */
  attendees: Array<Attendee> = [];
  local: Attendee = null;

  // context: AudioContext;
  // volume: GainNode;
  // rate: number;
  // hrir: any;
  // brir: any;

  /* ResonanceAudio components */ 
  audioContext: AudioContext;
  resonanceRoom: ResonanceAudio;
  roomDimensions: RoomDimensions;
  roomMaterials: RoomMaterials;

  constructor(
    private zone: NgZone,
    private router: Router,
    private route: ActivatedRoute,
    private session: SessionService,
    private meeting: MeetingService,
    private spatial: SpatialService,
    private snackbar: MatSnackBar,
    private clipboard: Clipboard
    //private streamNode: MediaStreamAudioDestinationNode
  ) { }

  async ngOnInit() {
    // Initializing correcly the RoomComponent variables
    this.attendees = [];
    this.local = null;

    // Creating the ResonanceAudio handler for the Room
    this.audioContext = new AudioContext();
    this.resonanceRoom = new ResonanceAudio(this.audioContext);
    this.resonanceRoom.output.connect(this.audioContext.destination);

    // Setting the Room properties for the spatial sound processor
    this.roomDimensions = {
      width: 4.0,
      height: 4.0,
      depth: 4.0,
    };
    this.roomMaterials = {
      // Room wall materials
      left: 'brick-bare',
      right: 'curtain-heavy',
      front: 'marble',
      back: 'glass-thin',
      // Room floor
      down: 'grass',
      // Room ceiling
      up: 'grass',
    };
    this.resonanceRoom.setRoomProperties(this.roomDimensions, this.roomMaterials);    


    // Run the initialization method for the room,
    // but first we need to verify the SessionService status,
    // and subscribe to its onReady event, if it is not available yet.
    // Only done because of the Google API Library (needs to be loaded...)
    let roomName = this.route.snapshot.paramMap.get('roomName');
    if (this.session.isReady()) {
      await this.roomInit(roomName);
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
   * setPosition
   * Fired whenever the position of any Attendee (except the Local Attendee),
   * has been changed.
   */
  public setPosition(attendee: Attendee, event: CdkDragMove) {
    // Getting data of size and position of interest elements
    let containerRect = this.attendeesContainer.nativeElement.getBoundingClientRect();
    let localRect = this.localContainer.nativeElement.getBoundingClientRect();
    let attendeePosition = event.source.getFreeDragPosition();

    // Normalizing position
    let x = (attendeePosition.x * (this.roomDimensions.width / 2)) / (containerRect.width / 2);
    let y = ((localRect.y - attendeePosition.y) * this.roomDimensions.height) / containerRect.height;

    // Setting position
    attendee.setPosition(x, y);
  }

  /**
   * setVolume
   * Sets the current value of the audio system
   */
  public setVolume(value: number) {
    // Code here to control the volume of the Room...
  }

  /**
   * hangOut
   * Hangs out, exits the meeting room.
   */
  public hangOut() {
    this.meeting.getClient().disconnect();
    this.router.navigate(['']);
  }

  /**
   * toggleCamera
   * Toggle the local attendee's camera status.
   */
  public toggleCamera() {
    if (this.local) {
      this.local.toggleCamera();
      if (this.local.getCameraStatus()) {
        this.meeting.getClient().resumeStream(MediaStreamTypes.WebCam);
      } else {
        this.meeting.getClient().pauseStream(MediaStreamTypes.WebCam);
      }
    }
  }

  /**
   * toggleMicrophone
   * Toggle the local attendee's microphone status.
   */
  public toggleMicrophone() {
    if (this.local) {
      this.local.toggleMicrophone();
      if (this.local.getMicrophoneStatus()) {
        this.meeting.getClient().resumeStream(MediaStreamTypes.Microphone);
      } else {
        this.meeting.getClient().pauseStream(MediaStreamTypes.Microphone);
      }
    }
  }

  /**
   * shareLink()
   * copy current page link to clipboard, useful to share it!
   */
  public shareLink() {
    this.clipboard.copy(location.href);
    this.snackbar.open('Enlace copiado!', 'OK', {duration: 3000, verticalPosition:'top', horizontalPosition:'center'});
  }

  /**
   * origin
   * Returns the origin position.
   */
  public origin() {
    return {
      x: this.localContainer.nativeElement.getBoundingClientRect().x,
      y: this.localContainer.nativeElement.getBoundingClientRect().y
    };
  }

  /**
   * onAttendeeJoined
   * Fired when a new Attendee joined the meeting room.
   */
  private onAttendeeJoined(user: string) {
    this.zone.run( () => {
      this.addAttendee(user);
      this.snackbar.open(user + ' ha entrado a la llamada', 'OK', {duration: 3000, verticalPosition:'top', horizontalPosition:'center'});
    });
  }

  /**
   * onAttendeeLeft
   * Fired when a new Attendee left the meeting room.
   */
  private onAttendeeLeft(user: string) {
    this.zone.run( () => {
      this.removeAttendee(user); 
      this.snackbar.open(user + ' ha salido de la llamada', 'OK', {duration: 3000, verticalPosition:'top', horizontalPosition:'center'});
    });
  }

  /**
   * onStreamAdded
   * Fired when an Attendee has added a new streaming device to its producers.
   */
  private onStreamAdded(user: string, type: any, stream: any) {
    this.zone.run( () => {
      this.getAttendee(user).addStream(type, stream);

      // When stream has been added, if Microphone, a Source must be created in the
      // ResonanceRoom, fed by the streaming input from WebRTC
      if (type == MediaStreamTypes.Microphone) {
        let mediaSource = this.audioContext.createMediaStreamSource(stream);
        let source = this.resonanceRoom.createSource();
        mediaSource.connect(source.input);
        this.getAttendee(user).setSource(source);
      }
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
      let attendee = this.getAttendee(user);
      if (type == MediaStreamTypes.Microphone) {
        attendee.setMicrophoneStatus(false);
      } else if (type == MediaStreamTypes.WebCam) {
        attendee.setCameraStatus(false);
      }
    });
  }

  /**
   * onStreamResumed
   * Fired when an Attendee has resumed its streaming device.
   */
  private onStreamResumed(user: string, type: any) {
    this.zone.run( () => {
      let attendee = this.getAttendee(user);
      if (type == MediaStreamTypes.Microphone) {
        attendee.setMicrophoneStatus(true);
      } else if (type == MediaStreamTypes.WebCam) {
        attendee.setCameraStatus(true);
      }
    });
  }

  /**
   * addAttendee
   * Adds a new Attendee.
   */
  private addAttendee(user: string) {
    let attendee = null;
    if ( !this.hasAttendee(user) ) {
      // Instance a new Attendee
      attendee = new Attendee(user);
      // Add it to the attendee list
      this.attendees.push(attendee);
    }
    return attendee;
  }

  /**
   * hasAttendee
   * Returns if Attendee exists.
   */
  private hasAttendee(user: string) {
    return this.attendees.find(a => a.user === user) !== undefined;
  }

  /**
   * getAttendee
   * Returns the Attendee, if not found, creates a new instance.
   */
  private getAttendee(user: string) {
    let attendee = this.attendees.find(attendee => attendee.getUser() == user);
    if ( !attendee ) {
      attendee = this.addAttendee(user);
    }
    return attendee;
  }

  /**
   * removeAttendee
   * Removes an attendee.
   */
  private removeAttendee(user: string) {
    let attendee = this.attendees.find(attendee => attendee.getUser() == user);
    let index = this.attendees.indexOf(attendee);
    this.attendees.splice(index, 1);
  }

  /**
   * roomInit
   * Initialization of the Room meeting.
   */
  private async roomInit(roomName: string) {
    // User profile information with Google OAuth
    if ( !this.session.isSigned() ) {
      await this.session.signIn();
    }
    let user = this.session.getUser();

    // Verifying existence of the Room
    if ( await this.meeting.getClient().roomExists(roomName) ) {
      // Setting the local Attendee instance, and getting the media device
      // streaming instances, for both audio and video
      this.local = new Attendee(
        user.email,
        {
          context: this.context,
          hrir: this.hrir,
          brir: this.brir
        }
      );
      let videoStream = await window.navigator.mediaDevices.getUserMedia({ video: true });
      let audioStream = await window.navigator.mediaDevices.getUserMedia({ audio: true });
      this.local.addStream(MediaStreamTypes.WebCam, videoStream);
      this.local.setMicrophoneStatus(true);

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
      await this.meeting.getClient().connect(roomName);

      // Get the meeting room attendees, verifying if we missed
      // some because it did not have stream devices
      let users = this.meeting.getClient().getAttendees();
      for ( let user of users ) {
        this.addAttendee(user.id);
      }
    } else {
      this.router.navigate([''], { queryParams: {errorCode: ErrorCode.RoomNotFound } });
    }
  }
}
