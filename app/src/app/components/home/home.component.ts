import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import {ErrorCode, ErrorMessage} from '../../interfaces/codes'

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  buttonLabel: string = 'Crear';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
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
          
          // Code here, snack...
      }
    );
  }

  /**
   * onButtonClicked
   * When the button is clicked, either the room is created
   * or the user wants to join the meeting.
   */
  onButtonClicked(){
    // Code here...
  }

  /**
   * goToUrl
   * Open a new window redirecting the user to the GitHub repository
   * of the application.
   */
  goToUrl(url: string){
    window.open(url);
  }
}