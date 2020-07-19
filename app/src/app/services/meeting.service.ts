import { Injectable } from '@angular/core';
import { MeetingClient, MediaStreamTypes } from '../lib/meeting-client';

@Injectable({
  providedIn: 'root'
})
export class MeetingService {
  clientAddress: string = 'localhost:8080';
  client: MeetingClient;

  constructor() {
    this.client = new MeetingClient(this.clientAddress);
  }
  
  /**
   * getClient
   * Returns the MeetingClient instance.
   */
  public getClient(): MeetingClient {
    return this.client;
  }
}