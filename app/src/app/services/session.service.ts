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
    // Loading the script and initializing the Google Auth API
    this.loadGoogleScript();
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
   * loadGoogleScript
   * Loads the javascript script from the Google API.
   */
  private loadGoogleScript() {
      const node = document.createElement('script');
      node.src = 'https://apis.google.com/js/api.js';
      node.type = 'text/javascript';
      node.async = false;
      node.charset = 'utf-8';
      node.onload = async () => {
        await this.initGoogleAuth();
      };
      document.getElementsByTagName('head')[0].appendChild(node);
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
