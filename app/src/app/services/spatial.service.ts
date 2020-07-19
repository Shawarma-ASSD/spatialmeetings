// Angular modules
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';


// Local modules
import { SpatialIRContainer } from '../lib/spatial/spatial';

/**
 * SpatialService
 * Service to communicate to the SpatialServer, get the HRIRs and BRIRs and
 * create the SpatialIRContainers.
 */
@Injectable({
  providedIn: 'root'
})
export class SpatialService {
  clientAddress: string = 'localhost:8080';
  hrirContainer: SpatialIRContainer;
  brirContainer: SpatialIRContainer;

  constructor(private http: HttpClient) { }

  async getContainers( {azimutal = null, elevation = null, distance = null} = {} ) {
    // If haven't requested the impulse responses yet, perform the request
    if( this.hrirContainer.size === null || this.brirContainer.size === null ) {
        let params = null;
        // If we have parameters to specify
        if(azimutal !== null || elevation !== null || distance !== null) {
            params = new HttpParams();
            if(azimutal !== null) {
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
  }
}