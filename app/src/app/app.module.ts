import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatSliderModule } from '@angular/material/slider';

import { SessionService } from './services/session.service';
import { MeetingService } from './services/meeting.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { RoomComponent } from './components/room/room.component';
import { AttendeeComponent } from './components/attendee/attendee.component';
import { AttendeePanelComponent } from './components/attendee-panel/attendee-panel.component';

import { MicIconPipe } from './pipes/MicIconPipe';
import { CameraIconPipe } from './pipes/CameraIconPipe';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomComponent,
    AttendeeComponent,
    MicIconPipe,
    CameraIconPipe,
    AttendeePanelComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    FlexLayoutModule,
    FormsModule,
    DragDropModule,
    MatSnackBarModule,
    MatDividerModule,
    MatCardModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule,
    ClipboardModule

  ],
  providers: [
    SessionService,
    MeetingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
