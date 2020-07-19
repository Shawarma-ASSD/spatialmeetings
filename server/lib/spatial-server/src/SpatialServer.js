<<<<<<< e2e16f7acb883cbd6ab2068f365aaf568e7cc8cc
// Node modules
const fs = require('fs');
const express = require('express');
<<<<<<< 821a6b6b798792a5f92d3a567dd29e8cb2016839

// Local modules
const { ServerIRContainer } = require('./ServerIRContainer');
=======
>>>>>>> SpatialServer working

// Local modules
const { ServerIRContainer } = require('./ServerIRContainer');
=======
const fs = require('fs');
>>>>>>> Adding ServerIRContainer

/**
 * SpatialServerResponse
 * Static class, used as a namespace for static helpers. 
 * Used when building HTTP responses, during requests.
 */
class SpatialServerResponse {
    /**
     * result
     * Creates a success message returning IRs data.
     * @param {object} data 
     */
    static result(data) {
        return SpatialServerResponse.response(
            'success', 
            data
        );
    }

    /**
     * succeded
     * Creates a response message with succeded status and no result.
     */
    static succeded() {
        return SpatialServerResponse.response('success', '');
    }

    /**
     * failed
     * Creates a response message with failed status and some message.
     * @param {string} msg 
     */
    static failed(msg = '') {
        return SpatialServerResponse.response('failed', msg);
    }

    /**
     * response
     * Creates the SpatialServer response, which shall always
     * follow this format as established in the documentation
     * of the SpatialServer API.
     * @param {string} status 
     * @param {object} result 
     */
    static response(status, result) {
        return {
            status: status,
            result: result
        }
    }
}

<<<<<<< e2e16f7acb883cbd6ab2068f365aaf568e7cc8cc
=======

>>>>>>> Adding ServerIRContainer
/**
 * SpatialServer
 */
class SpatialServer {

    /**
     * SpatialServer constructor
     * @param {Paths to the IRs files} config 
     */
    constructor(config) {
<<<<<<< e2e16f7acb883cbd6ab2068f365aaf568e7cc8cc
<<<<<<< 623ca1285ee955027588b39f7960ab2efe3081e2
<<<<<<< 33b4c11b5862f81c644ff375790da8cfb0e6c687
=======
=======
>>>>>>> Adding ServerIRContainer
        // IRs files paths
        this.hrirPath = config.hrir;
        this.brirPath = config.brir;

        // IR containers
        this.hrirContainer = 
        this.brirContainer = 

<<<<<<< e2e16f7acb883cbd6ab2068f365aaf568e7cc8cc
>>>>>>> Adding ServerIRContainer
=======
>>>>>>> Coded SpatialServer, let's debug
=======
>>>>>>> Adding ServerIRContainer
        // Creates an internal HTTP Router, to attach a handler for each 
        // method requested, working as a dispatcher. An externally server 
        // Express App will route request through this Router.
        this.router = express.Router();
        this.router.use(express.urlencoded({extended: true}));
        this.router.use(express.json());
<<<<<<< e2e16f7acb883cbd6ab2068f365aaf568e7cc8cc
<<<<<<< 623ca1285ee955027588b39f7960ab2efe3081e2
<<<<<<< 33b4c11b5862f81c644ff375790da8cfb0e6c687
=======
>>>>>>> Coded SpatialServer, let's debug
        this.router.get('/hrirs', async (req, res) => this.getIRs('HRIR', req, res));
        this.router.get('/brirs', async(req, res) => this.getIRs('BRIR', req, res));


        // Read files async because we won't need immediately
        fs.readFile(config.hrir, 'utf8', (err, data) => {
            if(!err) {
                // Load HRIR Container
                this.hrirContainer = ServerIRContainer.fromJson( JSON.parse(data) );
            }
<<<<<<< 821a6b6b798792a5f92d3a567dd29e8cb2016839
<<<<<<< 623ca1285ee955027588b39f7960ab2efe3081e2
            else {
                console.log("Couldn't open HRIR file", config.hrir, err.message);
            }
=======
>>>>>>> Coded SpatialServer, let's debug
=======
            else {
                console.log("Couldn't open HRIR file", config.hrir, err.message);
            }
>>>>>>> SpatialServer working
        });

        fs.readFile(config.brir, 'utf8', (err, data) => {
            if(!err) {
                // Load BRIR Container
                this.brirContainer = ServerIRContainer.fromJson( JSON.parse(data) );
            }
<<<<<<< 821a6b6b798792a5f92d3a567dd29e8cb2016839
<<<<<<< 623ca1285ee955027588b39f7960ab2efe3081e2
=======
>>>>>>> SpatialServer working
            else {
                console.log("Couldn't open BRIR file", config.brir, err.message);
            }
        });
=======
        this.router.get('/hrirs', async (req, res) => this.getHrirs(req, res));
        this.router.get('/brirs', async(req, res) => this.brirs(req, res));
>>>>>>> Adding ServerIRContainer
=======
        });
>>>>>>> Coded SpatialServer, let's debug
=======
        this.router.get('/hrirs', async (req, res) => this.getHrirs(req, res));
        this.router.get('/brirs', async(req, res) => this.brirs(req, res));
>>>>>>> Adding ServerIRContainer
    }

    /**
     * getRouter
     * Returns the HTTP Router instance configured by the SpatialServer,
     * used for handling SpatialServer related http requests.
     */
    getRouter() {
        return this.router;
    }

    /**
<<<<<<< e2e16f7acb883cbd6ab2068f365aaf568e7cc8cc
<<<<<<< 623ca1285ee955027588b39f7960ab2efe3081e2
<<<<<<< 33b4c11b5862f81c644ff375790da8cfb0e6c687
     * getIRs
     * Returns the requested IRs, which can be filtered by azimutal,
     * elevation and/or distance. 
     * @param {IR type} type: 'HRIR' or 'BRIR'
     * @param {HTTP Request} request 
     * @param {HTTP Response} response
     */
    getIRs(type, request, response) {
        // Request parameters
        const { azimutal, elevation, distance } = request.query;
        console.log('req: ', request.query);
        console.log('azimutal: ', azimutal);
        console.log('elevation: ', elevation);
        console.log('distance: ', distance);
<<<<<<< 821a6b6b798792a5f92d3a567dd29e8cb2016839
        // Type of request
        let container = type === 'HRIR' ? this.hrirContainer : this.brirContainer;
        // Response data field
        let irs = {
            impulseResponses: new Array(),
            positions: new Array(),
            sampleRate: container.sampleRate,
            size: container.size
        };
        let positions = container.getPositions();
        // For each position check if it matches the given arguments
        for(let i = 0 ; i < positions.length ; i++) {
            if( distance === undefined || this.areClose(distance, positions[i][2] )) {
                if( elevation === undefined || this.areClose(elevation, positions[i][1]) ) {
                    if( azimutal === undefined || this.areClose(azimutal, positions[i][0]) ) {
                        irs.positions.push(positions[i]);
                        irs.impulseResponses.push(container.getIRs(i));
                    }    
                }
            }
        }
        // Return success with the desired information
        response.send( SpatialServerResponse.result(irs) );
=======
     * hrirs
=======
     * getIRs
>>>>>>> Coded SpatialServer, let's debug
     * Returns the requested IRs, which can be filtered by azimutal,
     * elevation and/or distance. 
     * @param {IR type} type: 'HRIR' or 'BRIR'
     * @param {HTTP Request} request 
     * @param {HTTP Response} response
     */
    getIRs(type, request, response) {
        // Request parameters
        const { azimutal, elevation, distance } = request.body;
=======
>>>>>>> SpatialServer working
        // Type of request
        let container = type === 'HRIR' ? this.hrirContainer : this.brirContainer;
        // Response data field
        let irs = {
            impulseResponses: new Array(),
            positions: new Array(),
            sampleRate: container.rate,
            size: container.size
        };
        let positions = container.getPositions();
        // For each position check if it matches the given arguments
        for(let i = 0 ; i < positions.length ; i++) {
            if( distance === undefined || this.areClose(distance, positions[i][2] )) {
                if( elevation === undefined || this.areClose(elevation, positions[i][1]) ) {
                    if( azimutal === undefined || this.areClose(azimutal, positions[i][0]) ) {
                        irs.positions.push(positions[i]);
                        irs.impulseResponses.push(container.getIRs(i));
                    }    
                }
            }
<<<<<<< 623ca1285ee955027588b39f7960ab2efe3081e2
        });

>>>>>>> Adding ServerIRContainer
=======
        }
        // Return success with the desired information
        response.send( SpatialServerResponse.result(irs) );
>>>>>>> Coded SpatialServer, let's debug
=======
     * hrirs
     * Returns the requested IRs, which can be filtered by azimutal,
     * elevation and/or distance. 
     * @param {HTTP Request} request 
     * @param {HTTP Response} response
     */
    getHrirs(request, response) {
        const { azimutal, elevation, distance } = request.body;

        let hrirs = {
            impulseResponses: new Array(),
            positions: new Array()
        };

        this.hrirSources.forEach( (source, index) => {
            if( distance === undefined || this.areClose(distance, source[2] )) {
                if( elevation === undefined || this.areClose(elevation, source[1]) ) {
                    if( azimutal === undefined || this.areClose(azimutal, source[0]) ) {
                        hrirs.positions.push(source);
                        hrirs.impulseResponses.push(this.hrir[index].);
                    }    
                }
            }
        });

>>>>>>> Adding ServerIRContainer
    }

    /**
     * areClose
     * Returns true if x and y are closer than the given tolerance
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} tol 
     */
<<<<<<< e2e16f7acb883cbd6ab2068f365aaf568e7cc8cc
<<<<<<< 821a6b6b798792a5f92d3a567dd29e8cb2016839
<<<<<<< 33b4c11b5862f81c644ff375790da8cfb0e6c687
    areClose(x, y, tol = 1e-6) {
=======
    static areClose(x, y, tol = 1e-6) {
>>>>>>> Adding ServerIRContainer
=======
    areClose(x, y, tol = 1e-6) {
>>>>>>> SpatialServer working
=======
    static areClose(x, y, tol = 1e-6) {
>>>>>>> Adding ServerIRContainer
        return Math.abs(x - y) < tol;
    }
}

module.exports = {
    SpatialServer
};