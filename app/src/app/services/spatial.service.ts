// Angular modules
import { Injectable } from '@angular/core';
<<<<<<< f47d69f97c8bcdeeb89d368089da7b6d536bde56
<<<<<<< 80bbb054754e824381991ddaf3a9fcb76ae83bef
import { HttpClient, HttpParams } from '@angular/common/http';
<<<<<<< 1b0a15b571a414f608698a4c88970afdd343cfd0
<<<<<<< be7fe00844678d21044e5b8aab0bf3b10965fa64
<<<<<<< bb1cf1a63d1202c2b705ac4b0655c64d0a8f98ed
<<<<<<< 3803a4c61d07cb2cc9b927215433920e51806f50
import { map } from 'rxjs/operators';
=======
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
>>>>>>> SpatialService in progress


// Local modules
import { SpatialIRContainer } from '../lib/spatial/spatial';
<<<<<<< 3803a4c61d07cb2cc9b927215433920e51806f50
import { Observable } from 'rxjs';
=======
>>>>>>> SpatialService in progress
=======
import { map } from 'rxjs/operators';
=======
>>>>>>> Adding Spatial sound...

// Local modules
import { SpatialIRContainer } from '../lib/spatial/spatial';
import { Observable } from 'rxjs';
>>>>>>> SpatialService working!

import { config } from '../../../config'; 

/**
 * SpatialService
 * Service to communicate to the SpatialServer, get the HRIRs and BRIRs and
 * create the SpatialIRContainers.
 */
<<<<<<< bb1cf1a63d1202c2b705ac4b0655c64d0a8f98ed
<<<<<<< 3803a4c61d07cb2cc9b927215433920e51806f50
@Injectable()
export class SpatialService {
  hrirContainer: SpatialIRContainer;
  brirContainer: SpatialIRContainer;

  constructor(
    private http: HttpClient
  ) { 
      this.hrirContainer = new SpatialIRContainer();
      this.brirContainer = new SpatialIRContainer();
  }
=======
@Injectable({
  providedIn: 'root'
})
=======
@Injectable()
>>>>>>> SpatialService working!
export class SpatialService {
  hrirContainer: SpatialIRContainer;
  brirContainer: SpatialIRContainer;

<<<<<<< bb1cf1a63d1202c2b705ac4b0655c64d0a8f98ed
  constructor(private http: HttpClient) { }
>>>>>>> SpatialService in progress
=======
  constructor(
    private http: HttpClient
  ) { 
      this.hrirContainer = new SpatialIRContainer();
      this.brirContainer = new SpatialIRContainer();
  }
>>>>>>> SpatialService working!

  async getContainers( {azimutal = null, elevation = null, distance = null} = {} ) {
    // If haven't requested the impulse responses yet, perform the request
    if( this.hrirContainer.size === null || this.brirContainer.size === null ) {
        let params = null;
        // If we have parameters to specify
        if(azimutal !== null || elevation !== null || distance !== null) {
            params = new HttpParams();
            if(azimutal !== null) {
<<<<<<< bb1cf1a63d1202c2b705ac4b0655c64d0a8f98ed
<<<<<<< 3803a4c61d07cb2cc9b927215433920e51806f50
                params = params.append('azimutal', `${azimutal}`);
            }
            if(elevation !== null) {
                params = params.append('elevation', `${elevation}`);
            }
            if(distance !== null) {
                params = params.append('distance', `${distance}`);
            }    
        }
        // Fetch HRIR data
        let hrirJson = await this.getIRs('hrirs', params); 
        console.log("Got HRIR, ", hrirJson);
        this.hrirContainer = SpatialIRContainer.fromJson(hrirJson);

        // Fetch BRIR data
        let brirJson = await this.getIRs('brirs', params);
        this.brirContainer = SpatialIRContainer.fromJson(brirJson);
        console.log("Got BRIR, ", brirJson);
    }
    return {
        hrir: this.hrirContainer, 
        brir: this.brirContainer
    };
  }

  private async getIRs(type: string, params = null) {
    // Perform the request
    let reqObservable;
    let options = {
      observe: 'response' as 'body',
      responseType: 'json'
    }
    // Horrible if/else because the options can't be in an Object
    if(params) {
      reqObservable = this.http.get<Observable<any>>(
        'https://localhost:8080/api/spatial/' + type, {
          observe: 'body',
          responseType: 'json',
          params: params
        }
      );
    }
    else {
      reqObservable = this.http.get(
        'https://localhost:8080/api/spatial/' + type, {
          observe: 'response',
          responseType: 'json'
        }
      );
    }
    // Pipe to check success status and return just the result field  
    const { status, result } = await reqObservable.toPromise();
    if (status == 'success') {
      return result;
    }
    else {
      throw new Error("Error while fetching " + type);
    }
=======
                params = params.set('azimutal', `${azimutal}`);
=======
                params = params.append('azimutal', `${azimutal}`);
>>>>>>> SpatialService working!
            }
            if(elevation !== null) {
                params = params.append('elevation', `${elevation}`);
            }
            if(distance !== null) {
                params = params.append('distance', `${distance}`);
            }    
        }
        // Fetch HRIR data
        let hrirJson = await this.getIRs('hrirs', params); 
        this.hrirContainer = SpatialIRContainer.fromJson(hrirJson);

        // Fetch BRIR data
        let brirJson = await this.getIRs('brirs', params);
        this.brirContainer = SpatialIRContainer.fromJson(brirJson);
    }
    return {
        hrir: this.hrirContainer, 
        brir: this.brirContainer
    };
>>>>>>> SpatialService in progress
  }

  private async getIRs(type: string, params = null) {
    // Perform the request
    let reqObservable;
    let options = {
      observe: 'response' as 'body',
      responseType: 'json'
    }
    // Horrible if/else because the options can't be in an Object
    if(params) {
      reqObservable = this.http.get<Observable<any>>(
        `https://${config.address}/api/spatial/` + type, {
          observe: 'body',
          responseType: 'json',
          params: params
        }
      );
    }
    else {
      reqObservable = this.http.get(
        `https://${config.address}/api/spatial/` + type, {
          observe: 'response',
          responseType: 'json'
        }
      );
    }
    // Pipe to check success status and return just the result field  
    const { status, result } = await reqObservable.toPromise();
    if (status == 'success') {
      return result;
    }
    else {
      throw new Error("Error while fetching " + type);
    }
=======
import { HttpClient } from '@angular/common/http';
=======
import { HttpClient, HttpParams } from '@angular/common/http';
>>>>>>> SpatialService in progress
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

=======
import { map } from 'rxjs/operators';
>>>>>>> SpatialService working!


// Local modules
import { SpatialIRContainer } from '../lib/spatial/spatial';
import { Observable } from 'rxjs';

/**
 * SpatialService
 * Service to communicate to the SpatialServer, get the HRIRs and BRIRs and
 * create the SpatialIRContainers.
 */
@Injectable()
export class SpatialService {
  hrirContainer: SpatialIRContainer;
  brirContainer: SpatialIRContainer;

  constructor(
    private http: HttpClient
  ) { 
      this.hrirContainer = new SpatialIRContainer();
      this.brirContainer = new SpatialIRContainer();
  }

  async getContainers( {azimutal = null, elevation = null, distance = null} = {} ) {
    // If haven't requested the impulse responses yet, perform the request
    if( this.hrirContainer.size === null || this.brirContainer.size === null ) {
        let params = null;
        // If we have parameters to specify
        if(azimutal !== null || elevation !== null || distance !== null) {
            params = new HttpParams();
            if(azimutal !== null) {
                params = params.append('azimutal', `${azimutal}`);
            }
            if(elevation !== null) {
                params = params.append('elevation', `${elevation}`);
            }
            if(distance !== null) {
                params = params.append('distance', `${distance}`);
            }    
        }
        // Fetch HRIR data
        let hrirJson = await this.getIRs('hrirs', params); 
        console.log("Got HRIR, ", hrirJson);
        this.hrirContainer = SpatialIRContainer.fromJson(hrirJson);

<<<<<<< f47d69f97c8bcdeeb89d368089da7b6d536bde56
>>>>>>> Brought sound processing modules from spatial-hearing
=======
        // Fetch BRIR data
        let brirJson = await this.getIRs('brirs', params);
        this.brirContainer = SpatialIRContainer.fromJson(brirJson);
        console.log("Got BRIR, ", brirJson);
    }
    return {
        hrir: this.hrirContainer, 
        brir: this.brirContainer
    };
>>>>>>> SpatialService in progress
  }

  private async getIRs(type: string, params = null) {
    // Perform the request
    let reqObservable;
    let options = {
      observe: 'response' as 'body',
      responseType: 'json'
    }
    // Horrible if/else because the options can't be in an Object
    if(params) {
      reqObservable = this.http.get<Observable<any>>(
        'https://localhost:8080/api/spatial/' + type, {
          observe: 'body',
          responseType: 'json',
          params: params
        }
      );
    }
    else {
      reqObservable = this.http.get(
        'https://localhost:8080/api/spatial/' + type, {
          observe: 'response',
          responseType: 'json'
        }
      );
    }
    // Pipe to check success status and return just the result field  
    const { status, result } = await reqObservable.toPromise();
    if (status == 'success') {
      return result;
    }
    else {
      throw new Error("Error while fetching " + type);
    }
  }
}