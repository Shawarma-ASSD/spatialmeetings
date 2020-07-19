const fs = require('fs');

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
        // IRs files paths
        this.hrirPath = config.hrir;
        this.brirPath = config.brir;

        // IR containers
        this.hrirContainer = 
        this.brirContainer = 

        // Creates an internal HTTP Router, to attach a handler for each 
        // method requested, working as a dispatcher. An externally server 
        // Express App will route request through this Router.
        this.router = express.Router();
        this.router.use(express.urlencoded({extended: true}));
        this.router.use(express.json());
        this.router.get('/hrirs', async (req, res) => this.getHrirs(req, res));
        this.router.get('/brirs', async(req, res) => this.brirs(req, res));
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