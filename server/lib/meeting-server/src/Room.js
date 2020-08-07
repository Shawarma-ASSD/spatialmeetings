const mediasoup = require('mediasoup');
const EventEmitter = require('events');

const { Attendee } = require('./Attendee');
const { RoomSignals } = require('./RoomSignals');
const { WebRtcTransport } = require('mediasoup/lib/types');

/**
 * Room
 * Handles the communication between the Attendees in the meeting room.
 * 
 * As an EventEmitter, raises the following events:
 *      + close: The Room was left empty, instance should be deleted.
 */
class Room extends EventEmitter {

    /**
     * Room Constructor
     * Builds a new instance of the Room with its name, owner,
     * room asigned in the WebSocket channel and MediaSoup resources
     * linked to its Router.
     * @param {string} name 
     * @param {string} owner
     * @param {Router} router 
     */
    constructor(name, owner, router) {
        super();
        this.name = name;
        this.owner = owner;
        this.router = router;
        this.attendees = new Map();

        // Creating the RoomSignals instance, listening to
        // socket events...
        this.room = new RoomSignals();
        this.room.on('userLeft', async (user) => await this._userLeft(user));
        this.room.on('producerRemoved', async (user, type) => await this._producerRemoved(user, type));
        this.room.on('producerPaused', async (user, type) => await this._producerPaused(user, type));
        this.room.on('producerResumed', async (user, type) => await this._producerResumed(user, type));
    }

    /**
     * _producerPaused
     * Handles the event when the user pauses the producer.
     * @param {string} user 
     * @param {MediaStreamType} type 
     */
    async _producerPaused(user, type) {
        if (this.hasAttendee(user)) {
            this.attendees.get(user).pauseProducer(type);
        }
    }

    /**
     * _producerResumed
     * Handles the event when the user resumes the producer.
     * @param {string} user 
     * @param {MediaStreamType} type 
     */
    async _producerResumed(user, type) {
        if (this.hasAttendee(user)) {
            this.attendees.get(user).resumeProducer(type);
        }
    }

    /**
     * _userLeft
     * Handles the event when a user leaves, closes its transports,
     * deletes its entry from the internal map and verifies whether the
     * Room should be closed.
     * @param {string} user 
     */
    async _userLeft(user) {
        if (this.hasAttendee(user)) {
            this.attendees.get(user).close();
            this.attendees.delete(user);
            if (this.attendees.size == 0) {
                this.emit('close');
            }
        }
    }

    /**
     * _producerRemoved
     * Handles the event when a user has removed a producer, so it must
     * remove the server-side producer.
     * @param {string} user 
     * @param {MediaStreamType} type 
     */
    async _producerRemoved(user, type) {
        if (this.hasAttendee(user)) {
            this.attendees
                .get(user)
                .removeProducer(type);
        }
    }

    /**
     * handleAttendeeConnection
     * Handles a new connection on the web socket server,
     * from an incoming Attendee.
     * @param {Attendee's mail: string} id 
     * @param {Accept function} accept
     * @param {Reject function} reject 
     */
    async handleAttendeeConnection(id, accept, reject) {
        // We must verify that the user has followed the networking
        // and an Attendee instance was created, also check that the
        // connection has not been already established.
        let shouldReject = true;
        let rejectReason = "";

        if (this.hasAttendee(id)) {
            if (!this.room.hasAttendee(id)) {
                let producers = this.attendees.get(id).getProducersInfo();
                let transport = accept();
                shouldReject = false;

                // Adding the Attendee connection to the Socket Room
                if ( await this.room.addAttendee(id, transport) ) {

                    // If its a new connection, emitting the socket event of a new Attendee joining the Room
                    await this.room.broadcastUserJoined(id, producers);

                    console.log(`[Server] ${id} se ha conectado al socket.`);
                }
                else {
                    console.log(`[Server] ${id} se ha reconectado al socket.`);
                }
            }
            else {
                rejectReason = "the room already had the attendee";
            }
        }
        else {
            rejectReason = "id not found in the room";
        }

        if (shouldReject) {
            console.log(`[Server] rejecting socket connection attemp from ${id}: ` + rejectReason);
            reject();
        }
    }

    /**
     * createAttendee
     * Creates a new Attendee with the given id and returns
     * the Transport's information.
     * @param {Attendee's id: string} id
     * @param {WebRtcTransport options} options 
     */
    async createAttendee(id, options) {
        // Creates the Attendee instance and saves it
        let attendee = await Attendee.createAttendee(id, this.router, options);
        this.attendees.set(id, attendee);
        
        // Returns the Attendee's tranports information
        return attendee.getTransportsInfo();
    }

    /**
     * createProducer
     * Creates a Producer in the SenderTranport of the Attendee,
     * returns the producer's id, when succesfully created.
     * @param {Attendee's id: string} id 
     * @param {string} type 
     * @param {RTP Parameters} rtpParameters 
     */
    async createProducer(id, type, rtpParameters) {
        // Creates the Producer resource
        let producerInfo = await this.attendees.get(id)
        .createProducer(type, rtpParameters);

        // Verifies if the Attendee is already connected to the
        // socket room, in that case the producer was added to the initial
        // ones, so an event must be raised. Otherwise do not raise the event,
        // because all producers will be consumed at userJoined.
        if (this.room.hasAttendee(id)) {
            this.room.broadcastProducerAdded(id, type, producerInfo);
        }
        
        return producerInfo;
    }
    
    /**
     * createConsumer
     * An Attendee wants to start consuming from another Attendee's producer,
     * so the Consumer instance in the ReceiverTransport must be created.
     * @param {Attendee's id: string} attendeeConsuming 
     * @param {Attendee's id: string} attendeeProducing 
     * @param {Producer's id} id 
     * @param {RTP Capabilities} rtpCapabilities 
     */
    async createConsumer(attendeeConsuming, attendeeProducing, id, rtpCapabilities) {
        return await this.attendees.get(attendeeConsuming)
        .createConsumer(attendeeProducing, id, rtpCapabilities);
    }

    /**
     * connectSender
     * Connects the sender transport of an Attendee
     * to the local endpoint.
     * @param {Attendee's id: string} id 
     * @param {DTLS Parameters} dtlsParameters 
     */
    async connectSender(id, dtlsParameters) {
        await this.attendees.get(id).connectSender(dtlsParameters);
    }

    /**
     * connectReceiver
     * Connects the receiver transport of an Attendee
     * to the remote endpoint.
     * @param {Attendee's id: string} id 
     * @param {DTLS Parameters} dtlsParameters 
     */
    async connectReceiver(id, dtlsParameters) {
        await this.attendees.get(id).connectReceiver(dtlsParameters);
    }

    /**
     * isEmpty
     * Returns whether the Room is empty or not.
     */
    isEmpty() {
        return this.attendees.size == 0;
    }

    /**
     * hasAttendee
     * Returns if the Attendee with the given id
     * has joined the Room.
     * @param {Attendee's id: string} id 
     */
    hasAttendee(id) {
        return this.attendees.has(id);
    }

    /**
     * getAttendee
     * Returns the Attendee with the given id, if exists,
     * if it does not exist the null is returned.
     * @param {Attendee's id: string} id 
     */
    getAttendee(id) {
        if (this.attendees.has(id)) {
            return this.attendees.get(id);
        } else {
            return null;
        }
    }

    /**
     * getAttendees
     * Returns a list with all the Attendees registered in the Room
     */
    getAttendees() {
        let info = [];
        this.attendees.forEach( (value, key, map) => {
            info.push(
                {
                    id: key
                }
            )
        });
        return info;
    }

    async removeAttendee(id) {
        this.room.removeAttendee(id);
        await this._userLeft(id);
        await this.room.broadcastUserLeft(id);
    }

    /**
     * getProducersInfo
     * Returns an object containing the producer's information
     * of each Attendee registered in the Room, containing the
     * Producer's type and id.
     * The Attende's id is used as a filter when required, is an
     * optional parameter.
     * @param {Attendee's id: string} id 
     */
    getProducersInfo(id = '') {
        let info = {};
        this.attendees.forEach( (value, key, map) => {
            if (id == '' || id == key) {
                info[key] = value.getProducersInfo();
            }
        });
        return info;
    }
}

module.exports = {
    Room
};