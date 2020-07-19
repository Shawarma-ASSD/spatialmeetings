import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { SessionService } from '../../services/session.service';
import { MeetingService } from '../../services/meeting.service';

import {ErrorCode, ErrorMessage} from '../../interfaces/codes';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  method: string = 'Crear';
  room: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private session: SessionService,
    private meeting: MeetingService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('assets/github.svg'));
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (queryParams: Params) => {
          let errorMessage = queryParams['errorCode'] ? ErrorMessage[ErrorCode[+queryParams['errorCode']]] : null;
          
          if (errorMessage) {
            // ¡ERROR! Message needs to be displayed
            console.log(errorMessage);
          }
      }
    );
  }

  /**
   * onButtonClicked
   * When the button is clicked, either the room is created
   * or the user wants to join the meeting.
   */
  public async onButtonClicked(){
    // Verifying if the user has not signed in
    if (!this.session.isSigned()) {
      await this.session.signIn();
    }

    // Setup the meeting client with the current user mail
    let user = this.session.getUser();
    this.meeting.getClient().setUser(user.email);

    // Execute method calls, to verify whether it can be created, or joined
    let result;
    if (this.method == 'Crear') {
      result = await this.meeting.getClient().createRoom(this.room);
    } else if (this.method == 'Unirse') {
      result = await this.meeting.getClient().roomExists(this.room);
    }

    // Routing, or showing error message
    if (result) {
      this.router.navigate(['room', this.room]);
    } else {
      // ¡ERROR! Room not found, message needs to be displayed
    }
  }

  /**
   * goToUrl
   * Open a new window redirecting the user to the GitHub repository
   * of the application.
   */
  public goToUrl(url: string) {
    window.open(url);
  }
}