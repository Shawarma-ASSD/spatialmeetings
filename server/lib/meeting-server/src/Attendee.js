const mediasoup = require('mediasoup');

/**
 * Attendee
 * Handles the MediaSoup resources used by an Attendee in the meeting room
 * this means it creates, and manages all transports, producers, and consumers.
 */
class Attendee {

    /**
     * createAttendee
     * Creates an instance of Attendee, where the id is expected to be the User's mail
     * address, and the router the Room's Router. 
     * Returns a Promise<Attendee>.
     * @param {string} id 
     * @param {Router} router 
     * @param {WebRtcTransport options} options
     */
    static async createAttendee(id, router, options) {
        let sendTransport = await Attendee.createWebRtcTransport(router, options);
        let recvTransport = await Attendee.createWebRtcTransport(router, options);
        return new Attendee(
            id,
            router,
            sendTransport,
            recvTransport
        );
    }

    /**
     * createWebRtcTransport
     * Creates an instance of a WebRTC Transport, connected to the
     * Room's Router but missing the endpoint connection until the User or
     * Attendee sends the corresponding command.
     * @param {Router} router 
     * @param {WebRtcTransport options} options
     */
    static async createWebRtcTransport(router, options) {
        return await router.createWebRtcTransport(options);
    }

    /**
     * getKind
     * Returns the corresponding kind string from MediaSoup,
     * according to the project's types.
     * @param {string} type 
     */
    static getKind(type) {
        if (["webcam", "screen"].includes(type)) {
            return "video";
        } else if (["mic"].includes(type)) {
            return "audio";
        }
    }
    
    /**
     * Attendee Contructor
     * Build a new instance of an Attendee with its id, which
     * should be its mail address. The constructor will create
     * the corresponding transports for the real-time communication.
     * @param {string} id 
     * @param {Router} router
     * @param {WebRTCTransport} sendTransport
     * @param {WebRTCTransport} recvTransport
     */
    constructor(id, router, sendTransport, recvTransport) {
        this.id = id;
        this.router = router;
        this.producers = new Map();
        this.consumers = new Map();
        this.sendTransport = sendTransport;
        this.recvTransport = recvTransport;
    }

    /**
     * getTransportsInfo
     * Returns an object containing RTPCapabilities, and the parameters
     * needed to create the remote instance of each sender and receiver
     * transports.
     */
    getTransportsInfo() {
        return {
            rtpCapabilities: this.router.rtpCapabilities,
            sendParams: {
                id: this.sendTransport.id,
                iceParameters: this.sendTransport.iceParameters,
                iceCandidates: this.sendTransport.iceCandidates,
                dtlsParameters: this.sendTransport.dtlsParameters
            },
            recvParams: {
                id: this.recvTransport.id,
                iceParameters: this.recvTransport.iceParameters,
                iceCandidates: this.recvTransport.iceCandidates,
                dtlsParameters: this.recvTransport.dtlsParameters
            }
        };
    }

    /**
     * getProducersInfo
     * Returns a list of objects containing the information of each
     * producer registered for the Attendee. These objects contain
     * the type and the producer's id.
     */
    getProducersInfo() {
        let info = [];
        this.producers.forEach( (value, key, map) => {
            info.push(
                {
                    type: key,
                    id: value.id
                }
            );
        });
        return info;
    }

    /**
     * connectSender
     * Connects the sender transport to the remote endpoint.
     * @param {DTLS Parameters} dtlsParameters 
     */
    async connectSender(dtlsParameters) {
        await this.sendTransport.connect(
            {
                dtlsParameters: dtlsParameters
            }
        );
    }

    /**
     * connectReceiver
     * Connects the receiver transport to the remote endpoint.
     * @param {DTLS Parameters} dtlsParameters 
     */
    async connectReceiver(dtlsParameters) {
        await this.recvTransport.connect(
            {
                dtlsParameters: dtlsParameters
            }
        );
    }

    /**
     * createProducer
     * Creates a producer in the sender transport to receive
     * whatever the remote client has started to produce and stream.
     * Returns the Producer's ID.
     * @param {string} type 
     * @param {RTP Parameters} rtpParameters 
     */
    async createProducer(type, rtpParameters) {
        // Creates the server-side Producer's instance
        let producer = await this.sendTransport.produce(
            {
                kind: Attendee.getKind(type),
                rtpParameters: rtpParameters
            }
        );

        // Saves the Producer's instance
        this.producers.set(type, producer);
        return producer.id;
    }

    /**
     * createConsumer
     * Verifies whether the given RTP Capabilities are valid
     * to consume the desired producer, and creates the server-side
     * Consumer's instance. 
     * Returns the Consumer's info if success, else null is returned.
     * @param {string} attendeeProducing 
     * @param {Producer's id} id 
     * @param {RTP Capabilities} rtpCapabilities 
     */
    async createConsumer(attendeeProducing, id, rtpCapabilities) {
        if (this.router.canConsume(
                {
                    producerId: id,
                    rtpCapabilities: rtpCapabilities
                }
            )
        ) {
            // Creates the Consumer server-side instance
            let consumer = await this.recvTransport.consume(
                {
                    producerId: id,
                    rtpCapabilities: rtpCapabilities
                }
            );
                
            // Listens the Producer's close event
            consumer.on("producerclose", () => {
                this.consumers.get(attendeeProducing).splice(
                    this.consumers.get(attendeeProducing).indexOf(consumer),
                    1
                );
            });

            // Attaches the Consumer to the local map
            if (this.consumers.has(attendeeProducing)) {
                this.consumers.get(attendeeProducing).push(consumer);
            } else {
                this.consumers.set(attendeeProducing, [consumer]);
            }

            // Returns Consumer's information
            return {
                id: consumer.id,
                rtpParameters: consumer.rtpParameters
            };
        } else {
            return null;
        }
    }

    /**
     * pauseProducer
     * Pauses the Producer.
     * @param {string} type 
     */
    async pauseProducer(type) {
        await this.producers.get(type).pause();
    }

    /**
     * resumeProducer
     * Resumes the Producer.
     * @param {string} type 
     */
    async resumeProducer(type) {
        await this.producers.get(type).resume();
    }

    /**
     * removeProducer
     * The client-side application has closed a Stream device,
     * and has notified that the Producer should be closed,
     * then, Attendee has to close and remove that instance.
     * @param {string} type 
     */
    removeProducer(type) {
        this.producers.get(type).close();
        this.producers.delete(type);
    }

    /**
     * close
     * Closes the transports, which triggers the closure of each
     * Producer and Consumer created inside both Tranports.
     */
    close() {
        this.sendTransport.close();
        this.recvTransport.close();
    }
}

module.exports = {
    Attendee
};