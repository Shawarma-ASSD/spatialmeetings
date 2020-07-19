import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button'
import {MatIconModule} from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SessionService } from './services/session.service';
import { MeetingService } from './services/meeting.service';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { RoomComponent } from './components/room/room.component';
import { AttendeeComponent } from './components/attendee/attendee.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    RoomComponent,
    AttendeeComponent
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
    FormsModule
  ],
  providers: [
    SessionService,
    MeetingService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
