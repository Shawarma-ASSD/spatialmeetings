// Node modules
const fs = require('fs');

// Local modules
const { ServerIRContainer } = require('./ServerIRContainer');

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


/**
 * SpatialServer
 */
class SpatialServer {

    /**
     * SpatialServer constructor
     * @param {Paths to the IRs files} config 
     */
    constructor(config) {
        // Creates an internal HTTP Router, to attach a handler for each 
        // method requested, working as a dispatcher. An externally server 
        // Express App will route request through this Router.
        this.router = express.Router();
        this.router.use(express.urlencoded({extended: true}));
        this.router.use(express.json());
        this.router.get('/hrirs', async (req, res) => this.getIRs('HRIR', req, res));
        this.router.get('/brirs', async(req, res) => this.getIRs('BRIR', req, res));


        // Read files async because we won't need immediately
        fs.readFile(config.hrir, 'utf8', (err, data) => {
            if(!err) {
                // Load HRIR Container
                this.hrirContainer = ServerIRContainer.fromJson( JSON.parse(data) );
            }
        });

        fs.readFile(config.brir, 'utf8', (err, data) => {
            if(!err) {
                // Load BRIR Container
                this.brirContainer = ServerIRContainer.fromJson( JSON.parse(data) );
            }
        });
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
     * getIRs
     * Returns the requested IRs, which can be filtered by azimutal,
     * elevation and/or distance. 
     * @param {IR type} type: 'HRIR' or 'BRIR'
     * @param {HTTP Request} request 
     * @param {HTTP Response} response
     */
    getIRs(type, request, response) {
        // Request parameters
        const { azimutal, elevation, distance } = request.body;
        // Type of request
        let container = type === 'HRIR' ? this.hrirContainer : this.brirContainer;
        // Response data field
        let irs = {
            impulseResponses: new Array(),
            positions: new Array()
        };
        let positions = container.getPositions();
        // For each position check if it matches the given arguments
        for(let i = 0 ; i < positions.length ; i++) {
            if( distance === undefined || this.areClose(distance, pos[2] )) {
                if( elevation === undefined || this.areClose(elevation, pos[1]) ) {
                    if( azimutal === undefined || this.areClose(azimutal, pos[0]) ) {
                        irs.positions.push(positions[i]);
                        irs.impulseResponses.push(container.getIRs(index));
                    }    
                }
            }
        }
        // Return success with the desired information
        response.send( SpatialServerResponse.result(irs) );
    }

    /**
     * areClose
     * Returns true if x and y are closer than the given tolerance
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} tol 
     */
    static areClose(x, y, tol = 1e-6) {
        return Math.abs(x - y) < tol;
    }
}

module.exports = {
    SpatialServer
};