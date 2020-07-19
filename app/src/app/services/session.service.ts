import { Injectable, EventEmitter } from '@angular/core';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  clientId: string = '224942652925-ogd3js0pdhkonbgltb6mdr5oo06ehftp.apps.googleusercontent.com';
  ready: EventEmitter<any> = new EventEmitter();
  auth: any = null;

  constructor() {
    // Initializing the GoogleAuth API
    this.initGoogleAuth();
  }

  /**
   * isReady
   * Returns whether the SessionService is ready to be used, or
   * it is waiting the Google API SDK to be loaded and initialized.
   */
  public isReady(): boolean {
    return this.auth !== null;
  }

  /**
   * isSigned
   * Returns whether the user is logged or not.
   */
  public isSigned(): boolean {
    let status = false;
    if (this.auth) {
      status = this.auth.isSignedIn.get();
    }
    return status;
  }

  /**
   * getUser
   * Returns the BasicProfile of the user logged, if already
   * signed in, if not a null object will be returned.
   */
  public getUser(): User {
    if (this.isSigned()) {
      let profile = this.auth.currentUser.get().getBasicProfile();
      return {
        email: profile.getEmail()
      }
    }
    return null;
  }

  /**
   * signIn
   * Signs in the current account.
   */
  public async signIn() {
    await this.auth.signIn(
      {
        scope: 'profile email'
      }
    );
  }

  /**
   * signOut
   * Signs out the current account.
   */
  public async signOut() {
    await this.auth.signOut();
  }

  /**
   * gapi 
   * Wrapper to the Google SDK
   */
  private gapi() {
    return window['gapi'];
  }
  
  /**
   * initGoogleAuth
   * Initializes Google API.
   */
  private async initGoogleAuth(): Promise<void> {
    // Creates a promise on the load of the Google API
    const googleApiLoaded = new Promise((resolve) => {
      this.gapi().load('auth2', resolve);
    });

    // Call the load method and initializes with the GoogleAuth
    return googleApiLoaded.then(async () => {
      await this.gapi().auth2
        .init({ client_id: this.clientId })
        .then(auth => {
          this.auth = auth;
          this.ready.emit();
        });
    });
  }
}
