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

  buttonLabel = 'hola';

  errorMessage = '';

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
          this.errorMessage = queryParams['errorCode'] ? ErrorMessage[ErrorCode[+queryParams['errorCode']]] : 'papa';
          console.log(this.errorMessage);
      }
    );
  }

  onButtonClicked(){
    //chequar que el campo no este vacio
    //guardar el id de la llamada en el service
    this.router.navigate(['room','hola']);
  }

  goToUrl(url:string){
    window.open(url);
  }
}
