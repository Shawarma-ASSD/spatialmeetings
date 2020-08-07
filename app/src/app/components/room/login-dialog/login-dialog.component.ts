import { Component, OnInit, Inject } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']

})
export class LoginDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private session:SessionService

  ) { }

  ngOnInit(): void {
  }

  public async onLogin() {
    await this.session.signIn();
    this.dialogRef.close();
  }
}
