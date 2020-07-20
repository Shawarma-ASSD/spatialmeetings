import { Injectable } from '@angular/core';
import { MeetingClient, MediaStreamTypes } from '../lib/meeting-client/meeting-client';
import { RequiredValidator } from '@angular/forms';

import { config } from '../../../config'; 

@Injectable()
export class MeetingService {
  address: string = config.address;
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