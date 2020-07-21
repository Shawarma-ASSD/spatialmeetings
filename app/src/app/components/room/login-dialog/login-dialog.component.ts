import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']

})
export class LoginDialogComponent implements OnInit {

  constructor(
    private session:SessionService
  ) { }

  ngOnInit(): void {
  }

  public async onLogin() {
    await this.session.signIn();
  }
}
