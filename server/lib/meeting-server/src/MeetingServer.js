const express = require('express');
const mediasoup = require('mediasoup');
const protoo = require('protoo-server');
const url = require('url');

const { Room } = require('./Room');

/**
 * MediaServerResponse
 * Static class, used as a namespace for static helpers. 
 * Used when building HTTP responses, during requests.
 */
class MediaServerResponse {
    /**
     * result
     * Creates a success message returning mediasoup and application related data.
     * @param {object} data 
     */
    static result(data) {
        return MediaServerResponse.response(
            'success', 
            data
        );
    }

    /**
     * succeded
     * Creates a response message with succeded status and no result.
     */
    static succeded() {
        return MediaServerResponse.response('success', '');
    }

    /**
     * failed
     * Creates a response message with failed status and some message.
     * @param {string} msg 
     */
    static failed(msg = '') {
        return MediaServerResponse.response('failed', msg);
    }

    /**
     * response
     * Creates the MediaServer response, which shall always
     * follow this format as established in the documentation
     * of the MediaServer API.
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
 * MeetingServer
 */
class MeetingServer {

    /**
     * createMeetingServer
     * Creates an instance of a MediaServer.
     * @param {HTTP Server} server 
     * @param {Configuration needed for the mediasoup server} config
     */
    static async createMeetingServer(server, config) {
        let worker = await mediasoup.createWorker(config.worker);
        return new MeetingServer(server, worker, config);
    }
    
    /**
     * MeetingServer constructor, uses the given http server
     * to connect the web socket server, and the MediaSoup worker
     * to manage meeting real-time communication resources.
     * @param {HTTP Server} server 
     * @param {MediaSoup Worker} worker 
     * @param {Configuration needed for the mediasoup server} config
     */
    constructor(server, worker, config) {
        // MeetingServer members
        this.rooms = new Map();
        this.worker = worker;
        this.config = config;

        // Creates an internal HTTP Router, to attach a handler for each 
        // method requested, working as a dispatcher. An externally server 
        // Express App will route request through this Router.
        this.router = express.Router();
        this.router.use(express.urlencoded({extended: true}));
        this.router.use(express.json());
        this.router.get('/rooms/producers', async (req, res) => await this.producers(req, res));
        this.router.get('/rooms/attendees', async(req, res) => await this.attendees(req, res));
        this.router.get('/rooms/exists', async(req, res) => await this.roomExists(req, res));
        this.router.post('/rooms/createRoom', async (req, res) => await this.createRoom(req, res));
        this.router.post('/rooms/createAttendee', async (req, res) => await this.createAttendee(req, res));
        this.router.post('/rooms/connectSender', async (req, res) => await this.connectSender(req, res));
        this.router.post('/rooms/createProducer', async (req, res) => await this.createProducer(req, res));
        this.router.post('/rooms/connectReceiver', async (req, res) => await this.connectReceiver(req, res));
        this.router.post('/rooms/createConsumer', async (req, res) => await this.createConsumer(req, res));
    
        // Creates an internal WebSocket server and handles new connections
        this.server = new protoo.WebSocketServer(server, this.config.socket);
        this.server.on('connectionrequest', async (info, accept, reject) => await this.connectionRequest(info, accept, reject));
    }

    /**
     * connectionRequest
     * Handles a new connection to the WebSocket server.
     * @param {Information about the socket connection} info 
     * @param {Function to be called when accepted} accept 
     * @param {Function to be called when rejected} reject 
     */
    async connectionRequest(info, accept, reject) {
        // On connection request, parses the URL to get parameters
        const { roomName, userMail } = url.parse(info.request.url, true).query;
        let transport;


        // Verifies connection parameters
        if (roomName !== undefined && userMail !== undefined) {
            if (this.rooms.has(roomName)) {
                transport = accept();
                await this.rooms.get(roomName).handleAttendeeConnection(userMail, transport);
            } else {
                reject(404, 'Room not found');
            }
        } else {
            reject(400, 'Invalid parameters, room and user are needed.');
        }
    }
    
    /**
     * getRouter
     * Returns the HTTP Router instance configured by the MediaServer,
     * used for handling MediaServer related http requests.
     */
    getRouter() {
        return this.router;
    }

    /**
     * hasRoom
     * Returns whether the Room with the given name exists.
     * @param {string} name 
     */
    hasRoom(name) {
        return this.rooms.has(name);
    }

    /**
     * attendees
     * Returns a list with the attendees registered in the room.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async attendees(request, response) {
        // Unwrapping the http request parameters
        const { roomName } = request.query;
        let room;
        let info;

        if (roomName !== undefined) {
            if (this.rooms.has(roomName)) {
                room = this.rooms.get(roomName);
                info = room.getAttendees();
                // HTTP Response, return success with list of attendees
                response.send(MediaServerResponse.result(info));
            } else {
                // HTTP Response, return failed, room not found
                response.send(MediaServerResponse.failed('Room not found'));
            }
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }

    /**
     * roomExists
     * Returns whether the given room exists or not.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async roomExists(request, response) {
        // Unwrapping the http request parameters
        const { roomName } = request.query;
        let exists;
        
        if (roomName !== undefined) {
            exists = this.rooms.has(roomName);
            // HTTP Response, return success with the result of whether the room exists or not
            response.send(MediaServerResponse.result({ exists: exists }));
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }
    
    /**
     * createRoom
     * Handles a request to create a room, if it has not
     * been created already, creates the Room instance and
     * pushes the records into the database.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async createRoom(request, response) {
        // Unwrapping the http request parameters
        let { roomName, userMail } = request.body;

        if (roomName !== undefined && userMail !== undefined) {
            let wasCreated = false;
            let router;
            let protooRoom;
            let room;
    
            // Verifiying if the room already exists
            if (!this.hasRoom(roomName)) {
                // Creates an instance of a MediaSoup router required by the Room
                // then, creates the instance of the new Room, and changes the flag
                router = await this.worker.createRouter({ mediaCodecs: this.config.router.mediaCodecs });
                room = new Room(roomName, userMail, router);
                this.rooms.set(roomName, room);
                wasCreated = true;            

                // Listening for the closure of the Room...
                room.on('close', () => {
                    this.rooms.delete(roomName);
                });
            }
    
            // HTTP Response, return success with the creation status
            response.send(MediaServerResponse.result({ created: wasCreated }));
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }

    /**
     * createAttendee
     * Handles a request to create an attendee instance,
     * this is done when executing the networking protocol
     * to join to the meeting. Creates the transports,
     * and sends them back to the user with the RTPCapabilities.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async createAttendee(request, response) {
        // Unwrapping the http request parameters...
        let { roomName, userMail } = request.body;
        let info;
        let room;

        if (roomName !== undefined && userMail !== undefined) {
            if (this.hasRoom(roomName)) {
                room = this.rooms.get(roomName);
                if (!room.hasAttendee(userMail)) {
                    info = await room.createAttendee(userMail, this.config.transport.options);
                    // HTTP Response, return sucess with the transports information
                    response.send(MediaServerResponse.result(info));
                } else {
                    // HTTP Response, return failed, attendee already created
                    response.send(MediaServerResponse.failed('Attendee already created'));
                }
            } else {
                // HTTP Response, return failed, room not found
                response.send(MediaServerResponse.failed('Room not found'));
            }
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }

    /**
     * connectSender
     * Handles the connection between the local and remote
     * transport for the Sender WebRTCTransport, done when
     * producing for the first time from the client side.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async connectSender(request, response) {
        // Unwrapping the http request parameters
        let { roomName, userMail, dtlsParameters } = request.body;
        let room;

        if (roomName !== undefined && userMail !== undefined && dtlsParameters !== undefined) {
            if (this.hasRoom(roomName)) {
                room = this.rooms.get(roomName);
                if (room.hasAttendee(userMail)) {
                    await room.connectSender(userMail, dtlsParameters);

                    // HTTP Response, return success
                    response.send(MediaServerResponse.succeded());
                } else {
                    // HTTP Response, return failed, attendee not found
                    response.send(MediaServerResponse.failed('Attendee not found'));
                }
            } else {
                // HTTP Response, return failed, room not found
                response.send(MediaServerResponse.failed('Room not found'));
            }
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }

    /**
     * connectReceiver
     * Connects local and remote instances of the transport
     * used as receiver, when the Attendee starts consuming
     * for the first time.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async connectReceiver(request, response) {
        // Unwrapping the http request parameters
        let { roomName, userMail, dtlsParameters } = request.body;
        let room;

        if (roomName !== undefined && userMail !== undefined && dtlsParameters !== undefined) {
            if (this.hasRoom(roomName)) {
                room = this.rooms.get(roomName);
                if (room.hasAttendee(userMail)) {
                    await room.connectReceiver(userMail, dtlsParameters);

                    // HTTP Response, return success
                    response.send(MediaServerResponse.succeded());
                } else {
                    // HTTP Response, return failed, attendee not found
                    response.send(MediaServerResponse.failed('Attendee not found'));
                }
            } else {
                // HTTP Response, return failed, room not found
                response.send(MediaServerResponse.failed('Room not found'));
            }
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }

    /**
     * createConsumer
     * Creates the server-side resources needed for the Attendee/User
     * to start Consuming from streaming transports.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async createConsumer(request, response) {
        // Unwrap the htpp request parameters
        let { roomName, userMail, id, rtpCapabilities, producerMail } = request.body;
        let room;
        let consumerInfo;

        if (roomName !== undefined && userMail !== undefined && id !== undefined && rtpCapabilities !== undefined && producerMail !== undefined) {
            if (this.hasRoom(roomName)) {
                room = this.rooms.get(roomName);
                if (room.hasAttendee(userMail)) {
                    consumerInfo = await room.createConsumer(userMail, producerMail, id, rtpCapabilities);
                    if (consumerInfo !== null) {
                        // HTTP Response, return success, with the producer's id
                        response.send(MediaServerResponse.result(consumerInfo));
                    } else {
                        // HTTP Response, return failed, cannot consume for the given producer
                        response.send(MediaServerResponse.failed('Cannot consume from the given producer'));
                    }
                } else {
                    // HTTP Response, return failed, attendee not found
                    response.send(MediaServerResponse.failed('Attendee not found'));
                }
            } else {
                // HTTP Response, return failed, room not found
                response.send(MediaServerResponse.failed('Room not found'));
            }
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }

    /**
     * createProducer
     * Creates the Producer server-side instance in MediaSoup
     * whenever requested by the client, if a new Stream
     * has started producing.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async createProducer(request, response) {
        // Unwrap the htpp request parameters
        let { roomName, userMail, type, rtpParameters } = request.body;
        let room;
        let id;

        if (roomName !== undefined && userMail !== undefined && type !== undefined && rtpParameters !== undefined) {
            if (this.hasRoom(roomName)) {
                room = this.rooms.get(roomName);
                if (room.hasAttendee(userMail)) {
                    id = await room.createProducer(userMail, type, rtpParameters);

                    // HTTP Response, return success, with the producer's id
                    response.send(MediaServerResponse.result({ id: id }));
                } else {
                    // HTTP Response, return failed, attendee not found
                    response.send(MediaServerResponse.failed('Attendee not found'));
                }
            } else {
                // HTTP Response, return failed, room not found
                response.send(MediaServerResponse.failed('Room not found'));
            }
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }

    /**
     * producers
     * Servers the list of Producers connected to the Room,
     * which can be optionally filtered by User/Attendee.
     * @param {HTTP Request} request 
     * @param {HTTP Response} response 
     */
    async producers(request, response) {
        // Unwrap the http request parameters
        let { roomName, producerMail } = request.query;
        let room;
        let info;

        if (roomName !== undefined) {
            if (this.hasRoom(roomName)) {
                // Sets the producerMail, get the room and look for the producer's information
                producerMail = producerMail === undefined ? '' : producerMail;
                room = this.rooms.get(roomName);
                info = room.getProducersInfo(producerMail);
                
                // HTTP Response, return success, with the producers information
                response.send(MediaServerResponse.result(info));
            } else {
                // HTTP Response, return failed, room not found
                response.send(MediaServerResponse.failed('Room not found'));
            }
        } else {
            // HTTP Response, return failed, invalid parameters
            response.send(MediaServerResponse.failed('Invalid parameters in HTTP Request'));
        }
    }
}

module.exports = {
    MeetingServer
};