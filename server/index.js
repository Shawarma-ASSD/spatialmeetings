// Importing required node modules
const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');

// Importing project modules
const { MeetingServer } = require('./lib/meeting-server/meeting-server');
const { SpatialServer } = require('./lib/spatial-server/spatial-server');

// Importing server configuration
const config = require('./config');

// Global variables
let meetingServer;
let spatialServer;
let httpServer;
let app;

// Initializing the server
(async() => {

    // Creates the express app
    app = express();
    
    // Create the https server
    await runHTTPSServer(app);

    // Creates the meeting server
    meetingServer = await MeetingServer.createMeetingServer(httpServer, config.meeting);

    // Creates the spatial server
<<<<<<< HEAD
    spatialServer = await SpatialServer.createSpatialServer(config.spatial);
=======
    spatialServer = new SpatialServer(config.spatial);
>>>>>>> 5d650658f3d16c25430fd1658bef0c1dc0883749

    // Adding CORS
    app.use(cors());

    // Logging requests
    app.use((req, res, next) => {
        console.log(`[Server] HTTP - ${req.method} - ${req.path}`);
        next();
    });

    // Sets the route of the meeting server api
    app.use('/api/media', meetingServer.getRouter());

    // Sets the route of the spatial server api
    app.use('/api/spatial', spatialServer.getRouter());

    // Console message
    console.log(`[Server] The server is listening to port ${config.server.port}`);
})();

/**
 * runHTTPSServer
 * Creates the HTTPS server with the certificates
 * and listens to the server port.
 * @param {Express App} app 
 */
async function runHTTPSServer(app) {
    const tls = {
		cert : fs.readFileSync(config.server.tls.cert),
		key  : fs.readFileSync(config.server.tls.key)
    };
    
    httpServer = https.createServer(tls, app);

    await new Promise((resolve) => {
        httpServer.listen(Number(config.server.port), resolve);
	});
}