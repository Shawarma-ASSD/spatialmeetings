// Angular modules
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

// Local modules
import { SpatialProcessorNode } from '../lib/spatial/spatial';

@Injectable()
/**
 * SpatialService
 * Service to communicate to the SpatialServer, get the HRIRs and BRIRs and
 * create the SpatialProcessorNodes.
 */
export class SpatialService {

  clientAddress: string = 'localhost:8080';

  constructor(private http: HttpClient) { 

  }
}