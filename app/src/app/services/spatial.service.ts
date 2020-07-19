// Angular modules
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

/**
 * SpatialService
 * Service to communicate to the SpatialServer, get the HRIRs and BRIRs and
 * create the SpatialIRContainers.
 */
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
export class SpatialService {
  clientAddress: string = 'localhost:8080';
  hrirContainer: SpatialIRContainer;
  brirContainer: SpatialIRContainer;

  constructor(private http: HttpClient) { }
>>>>>>> SpatialService in progress

  async getContainers( {azimutal = null, elevation = null, distance = null} = {} ) {
    // If haven't requested the impulse responses yet, perform the request
    if( this.hrirContainer.size === null || this.brirContainer.size === null ) {
        let params = null;
        // If we have parameters to specify
        if(azimutal !== null || elevation !== null || distance !== null) {
            params = new HttpParams();
            if(azimutal !== null) {
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
            }
            if(elevation !== null) {
                params = params.set('elevation', `${elevation}`);
            }
            if(distance !== null) {
                params = params.set('distance', `${distance}`);
            }    
        }
        let options = {
            observe: 'body',
            responseType: 'json'
        };
        if(params) {
            Object.assign(options, { params });
        }
        
        // Fetch HRIR data
        const { result: hrirJson } = await this.http.get(
            'api/spatial/hrirs',
            options
        ).toPromise();
        this.hrirContainer = SpatialIRContainer.fromJson(hrirJson);

        // Fetch BRIR data
        const { result: brirJson } = await this.http.get(
            'api/spatial/brirs',
            options
        ).toPromise();
        this.brirContainer = SpatialIRContainer.fromJson(brirJson);
    }
    return {
        hrir: this.hrirContainer, 
        brir: this.brirContainer
    };
>>>>>>> SpatialService in progress
  }
}