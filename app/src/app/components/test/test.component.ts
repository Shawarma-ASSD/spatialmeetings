import { Component, OnInit } from '@angular/core';

import { SpatialService } from '../../services/spatial.service';

import { SpatialProcessorNode } from '../../lib/spatial/spatial';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
  providers: [ SpatialService ]
})
export class TestComponent implements OnInit {
  processor: SpatialProcessorNode;

  constructor(private spatial: SpatialService) { 
  }

  async ngOnInit() {
    console.log("About to fetch IRs to load processor node");
    const {hrir, brir} = await this.spatial.getContainers({ elevation: 0 });
    console.log("Got IRs! ", hrir, brir)
  }
}
