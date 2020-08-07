const EventEmitter = require('events');
const protoo = require('protoo-server');

/**
 * RoomSignals
 * Handles the communication through the WebSocket connection,
 * the idea of this class is to define a simple API to encapsulate the
 * networking, and the event definition.
 * 
 * As an EventEmitter, raises the following events:
 *      + userLeft [user: string] : User left the Room
 *      + producerRemoved [user: string, type: string] : User removed a producer resourserce
 *      + producerPaused [user: string, type: string] : User paused the producer
 *      + producerResumed [user: string, type: string] : User resumed the producer
 */
class RoomSignals extends EventEmitter {
    
    /**
     * RoomSignals Constructor
     * Creates a new instance of the RoomSignals.
     */
    constructor() {
        super();
        
        // Creates the instance of a Protoo room
        this.room = new protoo.Room();

        // Definition of the dispatcher map in the RoomSignals, 
        // which will always call functions or methods with
        // user and data.
        this.dispatcher = {
            producerRemoved: async (user, data) => await this._producerRemoved(user, data),
            producerPaused: async (user, data) => await this._producerPaused(user, data),
            producerResumed: async (user, data) => await this._producerResumed(user, data) 
        };

        // Timers to check disconnections
        this.timeouts = new Map();
    }

    /**
     * hasAttendee
     * Returns whether the RoomSignals has received a connection
     * from the given user.
     * @param {string} user 
     */
    hasAttendee(user) {
        let result = false;
        for (let peer of this.room.peers) {
            if (peer.id === user) {
                result = true;
                break;
            }
        }
        return result;
    }

    /**
     * addAttendee
     * Adds a new Attendee's peer to the Room.
     * Returns true if its a new connection, false if its a reconnection.
     * @param {Attendee's id: string} user 
     * @param {Transport} transport 
     */
    async addAttendee(user, transport) {
        let newConnection = true;

        // Check if we were about to remove the user from the room
        if(this.timeouts.has(user)) {
            // Its a reconnection
            newConnection = false;

            // Stop timeout from firing
            clearTimeout(this.timeouts.get(user));

            // Remove from the record
            this.timeouts.delete(user);
        }

        // Connects the incoming socket as a peer to this Room
        let peer = await this.room.createPeer(user, transport);

        // Handling notifications over a dispatcher method
        peer.on('notification', async (notification) => {
            if (this.dispatcher.hasOwnProperty(notification.method)) {
                await this.dispatcher[notification.method](user, notification.data);
            }
        });

        // Handling socket connection closed
        peer.on('close', async () => {

            // Take as disconnected after 10 seconds of disconnection
            this.timeouts.set(user, setTimeout( async () => {

                // Emitting the event to higher level API
                this.emit('userLeft', user);

                // Emitting the event over socket of the Attendee leaving the Room
                await this.broadcastUserLeft(user);

                // Remove from the record
                this.timeouts.delete(user);
            }, 
            10e3));

            console.log(`[Server] ${user} se ha desconectado del socket.`);
        });

        return newConnection;
    }

    /**
     * broadcastUserJoined
     * Broadcasts to all Peers in the Room that a user joined.
     * @param {string} user 
     * @param {object} producers
     */
    async broadcastUserJoined(user, producers) {
        await this.broadcast(
            user, 
            'userJoined', 
            {
                user: user,
                producers: producers
            }
        );
    }

    /**
     * broadcastUserLeft
     * Broadcasts to all Peers in the Room that a user left.
     * @param {string} user 
     */
    async broadcastUserLeft(user) {
        await this.broadcast(user, 'userLeft', {user: user});
    }

    /**
     * broadcastProducerAdded
     * Broadcasts to all Peers in the Room that a producer has been added.
     * @param {string} user 
     * @param {string} type 
     * @param {Producer's ID} id 
     */
    async broadcastProducerAdded(user, type, id) {
        await this.broadcast(
            user, 
            'producerAdded', 
            {
                user: user,
                type: type,
                id: id
            }
        );
    }

    /**
     * broadcastProducerRemoved
     * Broadcasts to all Peers in the Room that a producer has been removed.
     * @param {string} user 
     * @param {string} type 
     */
    async broadcastProducerRemoved(user, type) {
        await this.broadcast(
            user,
            'producerRemoved',
            {
                user: user,
                type: type
            }
        );
    }

    /**
     * broadcastProducerPaused
     * Broadcasts to all Peers in the Room that a producer was paused.
     * @param {string} user 
     * @param {string} type 
     */
    async broadcastProducerPaused(user, type) {
        await this.broadcast(
            user,
            'producerPaused',
            {
                user: user,
                type: type
            }
        );
    }

    /**
     * broadcastProducerResumed
     * Broadcasts to all Peers in the Room that a producer was resumed.
     * @param {string} user 
     * @param {string} type 
     */
    async broadcastProducerResumed(user, type) {
        await this.broadcast(
            user,
            'producerResumed',
            {
                user: user,
                type: type
            }
        );
    }

    /**
     * broadcast
     * Broadcasts a notification to all Peers, omitting the source of the
     * event which is the given user.
     * @param {string} user
     * @param {string} method 
     * @param {string} data 
     */
    async broadcast(user, method, data) {
        for (let peer of this.room.peers) {
            if (peer.id !== user) {
                await peer.notify(
                    method,
                    data
                );
            }
        }
    }

    /**
     * _producerRemoved
     * Handles the message received from the Peer.
     * @param {string} user 
     * @param {object} data 
     */
    async _producerRemoved(user, data) {
        // Emit the event to the higher level api
        this.emit('producerRemoved', user, data.type);

        // Broadcast the message to the other peers in the room
        this.broadcastProducerRemoved(user, data.type);
     
        console.log(`[Server] ${user} ha removido su ${data.type.toUpperCase()}`);
    }

    /**
     * _producerPaused
     * Handles the message received from the Peer.
     * @param {string} user 
     * @param {object} data 
     */
    async _producerPaused(user, data) {
        this.broadcastProducerPaused(user, data.type);
        this.emit('producerPaused', user, data.type);

        console.log(`[Server] ${user} ha pausado su ${data.type.toUpperCase()}`);
    }

    /**
     * _producerResumed
     * Handles the message received from the Peer.
     * @param {string} user 
     * @param {object} data 
     */
    async _producerResumed(user, data) {
        this.broadcastProducerResumed(user, data.type);
        this.emit('producerResumed', user, data.type);

        console.log(`[Server] ${user} ha reanudado su ${data.type.toUpperCase()}`);
    }
}

module.exports = {
    RoomSignals
};