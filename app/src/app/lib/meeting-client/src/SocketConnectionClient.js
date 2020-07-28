// External modules
const protooClient = require('protoo-client');

/**
 * SocketConnectionClient
 * Class to communicate with the WebSocket Signaling server.
 * Handles communication using protoo-client.
 */
class SocketConnectionClient {
    /**
     * constructor
     */
    constructor() {
        this.socketTransport = null;
        this.peer = null;
        // Events callbacks
        this.userJoined = () => {};
        this.userLeft = () => {};
        this.producerAdded = () => {};
        this.producerRemoved = () => {};
        this.producerPaused = () => {};
        this.producerResumed = () => {};
    }

   /************************************
    * Notifications callback setters   *
    * @param {function} callback       *
    ************************************/

    setUserJoined(callback) {
       /** 
        * this.userJoined:
        * @param {string} mail 
        */
        this.userJoined = callback;   
    }

    setUserLeft(callback) {
       /** 
        * this.userLeft:
        * @param {string} mail 
        */
        this.userLeft = callback;   
    }

    setProducerAdded(callback) {
       /**
        * this.producerAdded:
        * @param {string} mail
        * @param {MediaStreamTypes} type
        * @param {ProducerID} id
        */
        this.producerAdded = callback;   
    }

    setProducerRemoved(callback) {
       /**
        * this.producerRemoved:
        * @param {string} mail
        * @param {MediaStreamTypes} type
        */
        this.producerRemoved = callback;   
    }

    setProducerPaused(callback) {
       /**
        * this.producerPaused:
        * @param {string} mail
        * @param {MediaStreamTypes} type
        */
        this.producerPaused = callback;   
    }

    setProducerResumed(callback) {
       /**
        * this.producedResumed:
        * @param {string} mail
        * @param {MediaStreamTypes} type
        */
        this.producerResumed = callback;   
    }

    /*****************************
     *   WebSockets Methods      *
     *****************************/

    /**
     * connectSocket
     * Establishes WebSocket connection and calls @connectionEstablished when 
     * connected.
     * @param {string} roomName 
     * @param {string} userMail 
     * @param {string} server URL address
     * @param {function} connectionEstablished 
     */
    async connectSocket(roomName, userMail, server, connectionEstablished) {
        this.socketTransport = new protooClient.WebSocketTransport(`wss://${server}?roomName=${roomName}&userMail=${userMail}`);
        this.peer = new protooClient.Peer(this.socketTransport);
        this.peer.on('open', connectionEstablished);
        this.peer.on('close', () => {
            console.log("Connection via WebSocket lost");
        });
        this.peer.on('failed', () => {
            console.log("Attemp to connect via WebScoket failed");
        })
        this.peer.on('notification', async (notification) => {
            await this.handleProtooNotification(notification.method, notification.data);
        });
        this.peer.on('request', (req, accept, reject) => {
            reject("Requests aren't expected");
        })
    }

    /**
     * disconnectSocket
     * Disconnects WebSocket
     */
    disconnectSocket() {
        if(this.peer) {
            this.peer.close();
        }
    }

    /**
     * emitProducerRemoved
     * Emits 'producerRemoved' event on the server
     * @param {string} userMail 
     * @param {MediaStreamTypes} type 
     */
    async emitProducerRemoved(userMail, type) {
        await this.peer.notify('producerRemoved', {
            user: userMail,
            type: type
        });
    }

    /**
     * emitProducerPaused
     * Emits 'producerPaused' event on the server
     * @param {string} userMail 
     * @param {MediaStreamTypes} type 
     */
    async emitProducerPaused(userMail, type) {
        await this.peer.notify('producerPaused', {
            user: userMail,
            type: type
        });
    }

    /**
     * emitProducerResumed
     * Emits 'producerResumed' event on the server
     * @param {string} userMail 
     * @param {MediaStreamTypes} type 
     */
    async emitProducerResumed(userMail, type) {
        await this.peer.notify('producerResumed', {
            user: userMail,
            type: type
        });
    }

    /*****************************
     *   Internal use methods    *
     *****************************/

    async handleProtooNotification(method, data) {
        switch(method) {
            case 'userJoined':
                await this.userJoined(data.user, data.producers);
                break;
            case 'userLeft':
                this.userLeft(data.user);
                break;
            case 'producerAdded':
                await this.producerAdded(data.user, data.type, data.id);
                break;
            case 'producerRemoved':
                this.producerRemoved(data.user, data.type);
                break;
            case 'producerPaused':
                this.producerPaused(data.user, data.type);
                break;
            case 'producerResumed':
                this.producerResumed(data.user, data.type);
                break;
            default:
                break;
        }
    }
}

module.exports = {
    SocketConnectionClient
};