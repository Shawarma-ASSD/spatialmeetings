// Angular modules
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

// Local modules
import { SpatialIRContainer } from '../lib/spatial/spatial';
import { Observable } from 'rxjs';

import { config } from '../../../config'; 

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
        this.hrirContainer = SpatialIRContainer.fromJson(hrirJson);

        // Fetch BRIR data
        let brirJson = await this.getIRs('brirs', params);
        this.brirContainer = SpatialIRContainer.fromJson(brirJson);
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
        `https://${config.address}/spatial/` + type, {
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
  }
}