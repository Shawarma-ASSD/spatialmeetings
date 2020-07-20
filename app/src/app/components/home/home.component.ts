import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import {MatSnackBar} from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';

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
  userLogged: boolean = false;
  userMail: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private session: SessionService,
    private meeting: MeetingService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private snackBar: MatSnackBar
  ) {
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('assets/github.svg'));

     session.clientIsLogged.subscribe((isLogged)=>{
        this.userLogged = isLogged.valueOf();
     })

  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (queryParams: Params) => {
          let errorCode = queryParams['errorCode'];
          if (errorCode) {
            this.showSnackBar(errorCode);
          }
      }
    );
    if( this.session.isSigned() ) {
      this.userMail = this.session.getUser().email;
    }
  }

  /**
   * onButtonClicked
   * When the button is clicked, either the room is created
   * or the user wants to join the meeting.
   */
  public async onButtonClicked(){
    if(! this.userLogged) {    
      await this.onLogin();
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
      this.showSnackBar(this.method == 'Crear' ? ErrorCode.RoomAlreadyExists : ErrorCode.RoomNotFound);
    }
  }

  /**
   * showSnackBar
   * show snackbar showing a message for the user
   */
  private showSnackBar(code: ErrorCode) {
    const message = ErrorMessage[ErrorCode[code]];
    this.snackBar.open(message, 'OK', { duration: 6000, politeness: 'assertive' });
  }

  /**
   * goToUrl
   * Open a new window redirecting the user to the GitHub repository
   * of the application.
   */
  public goToUrl(url: string) {
    window.open(url);
  }
  /**
   * onLogin()
   */
  async onLogin() {
    await this.session.signIn();
    this.userMail = this.session.getUser().email;
    //this.showSnackBar('Sesión iniciada con: ' + this.session.getUser().email);
  }

  /**
   * onLogout()
   */
  onLogout() {
    let user = this.session.getUser().email;
    if (this.session.isSigned()) {
      this.session.signOut();
    }
    this.snackBar.open('Se ha cerrado la sesión de ' + user, 'OK');
  }
}
