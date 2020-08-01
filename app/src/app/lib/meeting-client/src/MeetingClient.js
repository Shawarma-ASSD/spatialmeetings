// External modules
const mediasoup = require('mediasoup-client');

// Local modules
const { HTTPConnectionClient } = require('./HTTPConnectionClient');
const { SocketConnectionClient } = require('./SocketConnectionClient');
const { LocalMediaStream, RemoteMediaStream, MediaStreamTypes } = require('./MediaStreams');

/**
 * MeetingClient
 * Class to connect to the MediaServer. Handles mediasoup objects and
 * connections and uses a ConnectionClient to do the signaling.
 */
class MeetingClient {

    /**
     * constructor
     * @param {string} server URL address (IP:Port)
     */
    constructor(server) {
        // Connection info
        this.server = server;
        this.room = null;
        this.user = '';

        // Mediasoup objects containers
        this.device = new mediasoup.Device();
        this.sendTransport = null;
        this.recvTransport = null;

        // Room attendees Array
        this.attendees = null;

        // LocalMediaStreams container, will contain the local stream, its MediaStreamType and MediaSoup Producer
        this.localStreams = new Array();

        // remote streams container, with each user's RemoteMediaStreams containing
        // MediaStreamType and Mediasoup Consumer of each stream.
        this.remoteStreams = new Map(); // Map<id: string, RemoteMediaStream[] >

        // Connection state
        this.connected = false;

        // Signaling clients
        this.httpClient = new HTTPConnectionClient(server);
        this.socketClient = new SocketConnectionClient();
        
        // Event handlers
        this.attendeeJoined = () => {};
        this.attendeeLeft = () => {};
        this.streamAdded = () => {};
        this.streamRemoved = () => {};
        this.streamPaused = () => {};
        this.streamResumed = () => {};
        this.error = () => {};
    }

    /**
     * setUser
     * Sets the user identification.
     * @param {User's string} user
     */
    setUser(user) {
        this.user = user;
    }

    /**
     * addStream
     * Adds a local stream to be sent to the other attendees. All streams that 
     * want to be sent should be added before establishing the connection.
     * To add a stream the same type of an existing one, the old one should be
     * removed first by calling removeStream().
     * If a stream is added with the connection established, it also
     * creates its MediaSoup Producer.
     * @param {MediaStream} stream local Stream object to be sent
     * @param {MediaStreamTypes} type
     */
    async addStream(stream, type) {
        this.removeStream(type);
        let newStream = new LocalMediaStream(stream, type);
        this.localStreams.push(newStream);
        if(this.connected) {
            await this._produce(newStream);
        }
    }

    /**
     * removeStream
     * Removes the local stream of the given type. 
     * Nothing happens if a stream of the indicated type didn't exist.
     * @param {MediaStreamTypes} type 
     */
    removeStream(type) {
        let index = this.localStreams.findIndex( (el) => el.getType() == type );
        // If there was a stream of the especified type
        if(index >= 0) {
            if(this.connected) {
                // close Producer and tell the server
                this.localStreams[index].getStreamer().close();
                this.socketClient.emitProducerRemoved(this.user, type);
                // this.clearConnectionInfo()
            }
            this.localStreams.splice(index, 1);
        }
    }

   /************************************
    * Notifications callback setters   *
    * @param {function} callback       *
    ************************************/
    
    /** 
    * setAttendeeJoined
    * Callback params:
    *       @param {string} mail 
    */
    setAttendeeJoined(callback) {
        this.attendeeJoined = callback;
    }

    /** 
     * setAttendeeLeft
     * @param callback
     * Callback params:
     *      @param {string} mail 
     */
    setAttendeeLeft(callback) {
        this.attendeeLeft = callback;
    }
    
    /**
     * setStreamAdded
     * @param callback
     * Callback params:
     *      @param {string} mail
     *      @param {MediaStreamTypes} type
     *      @param {MediaStream} stream
     *      @param {Boolean} paused
     */
    setStreamAdded(callback) {
        this.streamAdded = callback;
    }

    /**
     * setStreamRemoved
     * @param callback
     * Callback params:
     *      @param {string} mail
     *      @param {MediaStreamTypes} type
     */
    setStreamRemoved(callback) {
        this.streamRemoved = callback;
    }
    
    /**
     * setStreamPaused
     * @param callback
     * Callback params:
     *      @param {string} mail
     *      @param {MediaStreamTypes} type
     */
    setStreamPaused(callback) {
        this.streamPaused = callback;
    }

    /**
     * setStreamResumed
     * @param callback
     * Callback params:
     *      @param {string} mail
     *      @param {MediaStreamTypes} type
     */
    setStreamResumed(callback) {
        this.streamResumed = callback;
    }

    /**
     * setError
     * @param callback
     * Callback params:
     *      @param {string} message
     */
    setError(callback) {
        this.error = callback;
    }

    /**
     * getAttendees
     * Returns Array<string> with each attendee's email
     */
    getAttendees() {
        return this.attendees;
    }

    /**
     * roomExists
     * Returns true if the given room already exists
     * @param {string} room 
     */
    async roomExists(room) {
        return this._parseResponse( await this.httpClient.roomExists(room) ).exists;
    }

    /**
     * createRoom
     * Returns true if the room was created successfully.
     * @param {string} room 
     */
    async createRoom(room) {
        return this._parseResponse( await this.httpClient.createRoom(room, this.user) ).created;
    }

    /**
     * connect
     * Performs the signaling connection protocol to connect to
     * the given room.
     * If the room didn't exist, returns false and doesn't join the room.
     * @param {string} room
     */
    async connect(room) {
        let ret = false;
        if( await this.roomExists(room) ) {
            ret = true;
            // Ask what attendees are already in the room
            this.attendees = this._parseResponse( await this.httpClient.getAttendees(room) );

            // Create the attendee and its two corresponding WebRTCTransports on the server side 
            const { 
                rtpCapabilities,
                sendParams,
                recvParams
            } = this._parseResponse(await this.httpClient.createAttendee(room, this.user));
            
            // load device with rtpCapabilities and create send and recv transports
            await this._createAttendee(rtpCapabilities, sendParams, recvParams, room);
            
            // Create Producer for each of the added streams
            for(let stream of this.localStreams) {
                await this._produce(stream);
            }
            // Get Map with each user's mail and a list of its producers id and type
            await this._updateRemoteStreams(room);

            // connect to the WebSocket
            this.socketClient.connectSocket(room, this.user, this.server, async () => {
                // call _updateRemoteStreams() before setting this.connected so that
                // no events are emitted 
                await this._updateRemoteStreams(room);
                this.connected = true;

                // If there are any, notify each new stream to the client
                for( let [id, streams ] of this.remoteStreams ) {
                    for( let stream of streams ) {
                        let newStream = new MediaStream();
                        newStream.addTrack(stream.getStreamer().track);
                        this.streamAdded(id, stream.getType(), newStream, stream.startedPaused());
                    }
                }
                
                this.room = room;
                this.setSocketCallbacks();            
            });
        }
        return ret;
    }

    /**
     * disconnect
     * Notifies the server the user is leaving the room and closes the local
     * MediaSoup resources.
     */
    async disconnect() {
        // notify the server we are leaving the room 
        if(this.connected) {
            await this.httpClient.leaveRoom(this.room, this.user);
        }
        // Close transports, producers and consumers are automatically closed
        if (this.sendTransport) {
            this.sendTransport.close();
        }
        if (this.recvTransport) {
            this.recvTransport.close();
        }
        // Clear remote info, keep local info (localStreams and user)
        this.attendees = new Array();
        this.remoteStreams = new Map();
        this.room = null;
        this.connected = false;
    }

    pauseStream(type) {
        let index = this.localStreams.findIndex( (el) => el.getType() == type );
        this.localStreams[index].getStreamer().pause();
        this.socketClient.emitProducerPaused(this.user, type);
    }

    resumeStream(type) {
        let index = this.localStreams.findIndex( (el) => el.getType() == type );
        this.localStreams[index].getStreamer().resume();
        this.socketClient.emitProducerResumed(this.user, type);
    }

    /*****************************
     *   Internal use methods    *
     *****************************/

    /**
     * _parseResponse
     * Checks status of the response and returns its result
     * @param {Object} body 
     */
    _parseResponse(body) {
        if(body.status == "success") {
            return body.result;
        }
        else {
            this._errorOcurred("Networking", body.result);
        }
    }

    /**
     * _createAttendee
     * @param {RTPCapabilties} rtpCapabilities 
     * @param {TransportOptions} sendParams 
     * @param {TransportOptions} recvParams 
     * @param {string} room
     */
    async _createAttendee(rtpCapabilities, sendParams, recvParams, room) {
        // load MediaSoup Device with Router's rtpCapabilities
        if( !this.device.loaded ) {
            await this.device.load({ routerRtpCapabilities: rtpCapabilities });
        }
        // Create client side of the transports with the server side parameters
        await this._createSendTransport(sendParams, room);
        await this._createRecvTransport(recvParams, room);
    }

    /**
     * _createSendTransport
     * Creates sendTransport and defines it's behaviour on important events
     * @param {TransportOptions} params 
     * @param {string} room
     */
    async _createSendTransport(params, room) {
        // Create client side of the transports with the server side parameters
        this.sendTransport = this.device.createSendTransport(params);
        // Set behaviour on first request to produce
        this.sendTransport.on('connect', async ({dtlsParameters}, callback, errback) => {
            // Tell server to connect the transport
            this._parseResponse( await this.httpClient.connectSender(
                room, 
                this.user, 
                dtlsParameters
            ) );
            callback();
        });
        // Set behaviour when .produce() is called
        this.sendTransport.on('produce', async (params, callback, errback) => {
            const { id } = this._parseResponse( await this.httpClient.createProducer(
                room,
                this.user,
                params.appData.type,
                params.rtpParameters
            ) );
            callback({ id });
        });
        // Set behaviour on state connection change
        this.sendTransport.on('connectionstatechange', async (state) => {
            // Code here...
        });
    }

    /**
     * _createRecvTransport
     * Creates recvTransport and defines it's behaviour on important events
     * @param {TransportOptions} params 
     * @param {string} room
     */
    async _createRecvTransport(params, room) {
        // Create client side of the transports with the server side parameters
        this.recvTransport = this.device.createRecvTransport(params);
        // Set behaviour on first request to consume
        this.recvTransport.on('connect', async ({dtlsParameters}, callback, errback) => {
            // Tell server to connect the transport
            this._parseResponse( await this.httpClient.connectReceiver(
                room, 
                this.user, 
                dtlsParameters
            ) );
            callback();
        });
        // Set behaviour on state connection change
        this.recvTransport.on('connectionstatechange', async (state) => {
            // Code here...
        });
    }

    /**
     * _consume
     * Creates a Mediasoup Consumer related to the indicated Producer and
     * loads it into a RemoteMediaStream.
     * Returns the newly created RemoteMediaStream
     * If already connected, emits streamAdded() 
     * @param {string} producerMail 
     * @param {ProducerID} id
     * @param {MediaStreamTypes} type
     * @param {string} room
     * @param {Boolean} paused indicates initial state of the stream
     */
    async _consume(producerMail, id, type, room) {
        // Tell server to create a Consumer of the Producer
        const {
            id: consumerId, 
            rtpParameters,
            producerPaused: paused
        } = this._parseResponse( await this.httpClient.createConsumer(
            room, 
            this.user, 
            producerMail,
            id,
            this.device.rtpCapabilities
        ));
        let newStream = new RemoteMediaStream(type, paused);
        // create the local Consumer
        let consumer = await this.recvTransport.consume({
            id: consumerId,
            producerId: id,  
            kind: newStream.getKind(),
            rtpParameters
        });
        newStream.setStreamer(consumer);
        if( this.connected ) {
            let stream = new MediaStream();
            stream.addTrack(consumer.track);
            this.streamAdded(producerMail, type, stream, paused);
        }
        return newStream;
    }

    /**
     * _produce
     * Creates a MediaSoupProducer and loads it in the given LocalMediaStream.
     * @param {LocalMediaStream} stream 
     */
    async _produce(stream) {
        if( this.device.canProduce(stream.getKind()) ) {
            const track = stream.getStream().getTracks()[0];
            let producer = await this.sendTransport.produce({ 
                track, 
                appData: { type: stream.getType() } // appData will be sent to the on 'produce' callback
            });
            stream.setStreamer(producer);  
        }
    }

    /**
     * _updateRemoteStreams
     * Returns true if there are new streams
     * @param {string} room 
     */
    async _updateRemoteStreams(room) {
        let remoteProducers = this._parseResponse( await this.httpClient.getProducers(room) );
        let ret = false;
        if(remoteProducers != {}) {
            for(let id in remoteProducers) {
                // Doesnt consume own streams
                if(id != this.user) { 
                    // List of attendee's streams
                    let attendeeStreams = Array();
                    for(let prod of remoteProducers[id]) {
                        let hasId = this.remoteStreams.has(id), index = -1;
                        if(hasId) {
                            index = this.remoteStreams.get(id).findIndex( (el) => el.getType() == prod.type );
                        }
                        // If already consuming this stream, don't consume again
                        let addStream = null;
                        if( hasId && index >= 0 ) {
                            addStream = this.remoteStreams.get(id)[index];
                        }
                        else {
                            addStream = await this._consume(id, prod.id, prod.type, room);
                            // Notify there is a new stream
                            ret = true;
                        }
                        attendeeStreams.push(addStream);
                    }
                    this.remoteStreams.set(id, attendeeStreams);
                }
            }    
        }
        return ret;
    }


    /**
     * setSocketCallbacks
     */
    setSocketCallbacks() {
        this.socketClient.setUserJoined( async (mail, producers) => await this._userJoined(mail, producers) );
        this.socketClient.setUserLeft( (mail) => this._userLeft(mail) );
        this.socketClient.setProducerAdded( async (mail, type, id) => await this._producerAdded(mail, type, id) );
        this.socketClient.setProducerRemoved( (mail, type) => this._producerRemoved(mail, type) );
        this.socketClient.setProducerPaused( (mail, type) => this._producerPaused(mail, type) );
        this.socketClient.setProducerResumed( (mail, type) => this._producerResumed(mail, type) );
    }

    /**
     * _userJoined
     * Adds attendee to the attendees list and consumes its
     * streams.
     * Emits attendeeJoined(). streamAdded() is emitted when calling
     * this._consume() as it will already be connected.
     * @param {string} mail 
     * @param {Array<{type, ProduceID}>} producers 
     */
    async _userJoined(mail, producers) {
        this.attendees.push(mail);
        // Notify user
        this.attendeeJoined(mail);
        let newStreams = new Array();
        for(let prod of producers) {
            let newStream = await this._consume(mail, prod.id, prod.type, this.room);
            newStreams.push(newStream);
        }
        this.remoteStreams.set(mail, newStreams);
    }

    /**
     * _userLeft
     * Removes attendee from attendees list and closes its mediasoup Consumers.
     * Emits attendeeLeft()
     * @param {string} mail 
     */
    _userLeft(mail) {
        let index = this.attendees.indexOf(mail);
        this.attendees.splice(index, 1);
        let uselessStreams = this.remoteStreams.get(mail);
        // Close consumers
        uselessStreams.forEach( (el) => {
            el.getStreamer().close();
        });
        this.remoteStreams.delete(mail);
        // Notify user
        this.attendeeLeft(mail);
    }

    /**
     * _producerAdded
     * Starts consuming new Producer and updates the remoteStreams Map.
     * streamAdded() is emitted when calling _consume() as it will already be connected.
     * @param {string} mail 
     * @param {MediaStreamTypes} type 
     * @param {ProducerID} id 
     */
    async _producerAdded(mail, type, id) {
        let newStream = await this._consume(mail, id, type, this.room),
            index = this.remoteStreams.get(mail).findIndex( (el) => el.getType() == type );
        if( index >= 0) {
            this.remoteStreams.get(mail)[index] = newStream;
        }
        else {
            this.remoteStreams.get(mail).push(newStream);
        }
    }

    /**
     * _producerRemoved
     * Closes producer's consumer and removes it from remoteStreams Map.
     * @param {string} mail 
     * @param {MediaStreamTypes} type 
     */
    _producerRemoved(mail, type) {
        let index = -1;
        if(this.remoteStreams.has(mail)) {
            let remoteStream = this.remoteStreams.get(mail);
            index = remoteStream.findIndex( (el) => el.getType() == type );
            if(index >= 0) {
                remoteStream[index].getStreamer().close()
                remoteStream.splice(index, 1);
                this.streamRemoved(mail, type);
            }
        }
    }

    /**
     * _producerPaused
     * Emits streamPaused()
     * @param {string} mail 
     * @param {MediaStreamTypes} type 
     */
    _producerPaused(mail, type) {
        this.streamPaused(mail, type);
    }

    /**
     * _producerResumed
     * Emits streamResumed()
     * @param {string} mail 
     * @param {MediaStreamTypes} type 
     */
    _producerResumed(mail, type) {
        this.streamResumed(mail, type);
    }

    /**
     * _errorOcurred
     * Emits error()
     * @param {string} type 
     * @param {string} message 
     */
    _errorOcurred(type, message) {
        this.error(`${type} error: ${message}`);
    }

}

module.exports = {
    MeetingClient
};