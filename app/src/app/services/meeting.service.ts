import { Injectable } from '@angular/core';
import { MeetingClient, MediaStreamTypes } from '../lib/meeting-client/meeting-client';

@Injectable()
export class MeetingService {
  address: string = 'localhost:8080';
  client: MeetingClient;

  constructor() {
    this.client = new MeetingClient(this.address);
  }
  
  /**
   * getClient
   * Returns the MeetingClient instance.
   */
  public getClient(): MeetingClient {
    return this.client;
  }
}