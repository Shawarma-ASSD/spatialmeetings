// Local modules
const { HTTPClient } = require("./HTTPClient");

/**
 * HTTPConnectionClient
 * Class to communicate with the Signaling HTTP server.
 */
class HTTPConnectionClient {
    /**
     * constructor
     * @param {string} server URL address
     */
    constructor(server) {
        this.apiUrl = `https://${server}/api/media`;
        this.roomsUrl = this.apiUrl + "/rooms";
    }

    /****************************
     *   HTTP Requests Methods  *
     ****************************/

    /**
     * roomExists
     * Performs GET request to know whether the given
     * room already exists.
     * @param {string} roomName 
     */
    async roomExists(roomName) {
        return await HTTPClient.getJSON(this.roomsUrl + `/exists?roomName=${roomName}`);        
    }

    /**
     * createRoom 
     * Performs POST request to create the room and returns
     * its answer.
     * @param {string} roomName 
     * @param {string} userMail
     */
    async createRoom(roomName, userMail) {
        return await HTTPClient.postJSON(
            this.roomsUrl + "/createRoom",
            {
                roomName: roomName,
                userMail: userMail
            }
        );
    }

    /**
     * leaveRoom 
     * Performs POST request to leave the room and returns
     * its answer.
     * @param {string} roomName 
     * @param {string} userMail
     */
    async leaveRoom(roomName, userMail) {
        return await HTTPClient.postJSON(
            this.roomsUrl + "/leaveRoom",
            {
                roomName: roomName,
                userMail: userMail
            }
        );
    }

    /**
     * getAttendees
     * Performs GET request to obtain the attendees information 
     * for the given room
     * @param {string} roomName 
     */
    async getAttendees(roomName) {
        return await HTTPClient.getJSON(this.roomsUrl + `/attendees?roomName=${roomName}`);
    }

    /**
     * createAttendee
     * Performs POST request to create an Attendee and returns
     * its answer.
     * @param {string} roomName 
     * @param {string} userMail
     */
    async createAttendee(roomName, userMail) {
        return await HTTPClient.postJSON(
            this.roomsUrl + "/createAttendee", 
            {
                roomName: roomName,
                userMail: userMail,
            }
        );
    }

    /**
     * connectSender 
     * Performs POST request to connect the Mediasoup sendTransport and returns
     * its answer.
     * @param {string} roomName 
     * @param {string} userMail
     * @param {DTLSParameters} dtlsParameters
     */
    async connectSender(roomName, userMail, dtlsParameters) {
        return await HTTPClient.postJSON(
            this.roomsUrl + "/connectSender",
            {
                roomName: roomName,
                userMail: userMail,
                dtlsParameters: dtlsParameters
            }
        );
    }
    
    /**
     * createProducer
     * Performs POST request to create a Mediasoup Producer on the server side and returns
     * its answer.
     * @param {string} roomName 
     * @param {string} userMail
     * @param {MediaStreamTypes} type
     * @param {RTPParameters} rtpParameters
     */
    async createProducer(roomName, userMail, type, rtpParameters) {
        return await HTTPClient.postJSON(
            this.roomsUrl + "/createProducer",
            {
                roomName: roomName,
                userMail: userMail,
                type: type,
                rtpParameters: rtpParameters
            }
        );
    }

    /**
     * getProducers
     * Performs GET request to ask for other attendees Mediasoup Producers.
     * If producerMail is given, asks just for this attendee's Producers.
     * @param {string} roomName 
     * @param {string} producerMail 
     */
    async getProducers(roomName, producerMail = null) {
        let url = this.roomsUrl + `/producers?roomName=${roomName}`;
        if(producerMail) {
            url += `&producerMail=${producerMail}`;
        }
        return await HTTPClient.getJSON(url);
    }

    /**
     * connectReceiver
     * Performs POST request to connect the recvTransport and returns
     * its answer.
     * @param {string} roomName 
     * @param {string} userMail
     * @param {DTLSParameters} dtlsParameters
     */
    async connectReceiver(roomName, userMail, dtlsParameters) {
        return await HTTPClient.postJSON(
            this.roomsUrl + "/connectReceiver",
            {
                roomName: roomName,
                userMail: userMail,
                dtlsParameters: dtlsParameters
            }
        );
    }

    /**
     * createConsumer
     * Performs POST request to create Consumer on the server side and returns
     * its answer.
     * @param {string} roomName 
     * @param {string} userMail
     * @param {string} producerMail
     * @param {producerID} id
     * @param {RTPCapabilities} rtpCapabilities
     */
    async createConsumer(roomName, userMail, producerMail, id, rtpCapabilities) {
        return await HTTPClient.postJSON(
            this.roomsUrl + "/createConsumer",
            {
                roomName: roomName,
                userMail: userMail,
                producerMail: producerMail,
                id: id,
                rtpCapabilities: rtpCapabilities
            }
        );
    }

    
}

module.exports = {
    HTTPConnectionClient
};