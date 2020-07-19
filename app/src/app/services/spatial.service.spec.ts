import { TestBed } from '@angular/core/testing';

import { SpatialService } from './spatial.service';

describe('SpatialService', () => {
  let service: SpatialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpatialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
