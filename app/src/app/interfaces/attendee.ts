import { MediaStreamTypes } from '../lib/meeting-client/meeting-client';

import { SpatialProcessorNode, RoomReverberatorNode } from '../lib/spatial/spatial';

/**
 * Polar position coordinates interface
 */
export interface Polar {
    angle: number;
    distance: number;
}

/**
 * Cartesian poisition coordinates interface
 */
export interface Point {
    x: number,
    y: number
}

/**
 * Position class
 */
export class Position implements Point {
    x: number;
    y: number;

    /**
     * Position's constructor
     */
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * set
     * Sets the new position coordinates
     */
    public set(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * setFromPoint
     * Sets the new position from Point interface
     */
    public setFromPoint(point: Point) {
        this.set(point.x, point.y);
    }

    /**
     * polar
     * Returns a Polar instance of the coordinates
     */
    public polar(): Polar {
        let distance = Math.sqrt( Math.pow(this.x, 2) + Math.pow(this.y, 2) );
        let angle = Math.atan( this.y / this.x );
        return {
            distance: distance,
            angle: angle
        };
    }

    /**
     * point
     * Returns Point object
     */
    public point(): Point {
        return {
            x: this.x,
            y: this.y
        };
    }
};

/**
 * Attendee
 * Attendee's data model class
 */
export class Attendee {
    /* General Attendee's properties */
    user: string;
    microphone: boolean;
    camera: boolean;
    position: Position;
    color: string;

    /* Streaming instances */
    streams: Map<any, any>;

    /* WebAudio API components */
    reverberator: any;
    spatializer: any;
    context: AudioContext;
    source: MediaStreamTrackAudioSourceNode;

    /**
     * generateColor
     * Generates a random CSS color
     */
    private static generateColor() {
        const SCALE = 200;
        const OFFSET = 50;
        const red = Math.floor(Math.random() * SCALE + OFFSET);
        const green = Math.floor(Math.random() * SCALE + OFFSET);
        const blue = Math.floor(Math.random() * SCALE + OFFSET);
        return `rgb(${red}, ${green}, ${blue})`;
    }

    /**
     * Attendee's constructor
     * @param { string } user
     * @param { AudioContext } context
     * @param { SpatialIRContainer } hrir
     * @param { SpatialIRContainer } brir
     */
    constructor(user: string, { context = null, hrir = null, brir = null } = {}) {
        // General property setting
        this.user = user;
        this.streams = new Map();
        this.position = new Position(0, 0);
        this.color = Attendee.generateColor();

        // Initializing the WebAudio API components, only when all required parameters
        // have been set, if not, not used the web audio interface
        if (context && hrir && brir) {
            this.reverberator = new RoomReverberatorNode(context);
            this.reverberator.setSpatialIRContainer(brir);
            this.spatializer = new SpatialProcessorNode(context);
            this.spatializer.setHRIRContainer(hrir);
            this.spatializer.setReverberator(this.reverberator);
            this.context = context;
        } else {
            this.context = null;
            this.spatializer = null;
            this.reverberator = null;
        }
        this.source = null;
    }

    /**
     * setPosition
     * Sets the current position of the Attendee
     */
    public setPosition(point: Point) {
        // Setting the current position, getting the polar coordinantes
        // and transforming the values, suitable values for spatializer
        // should be checked.
        this.position.set(point.x, point.y);
        let { distance, angle } = this.position.polar();
        angle = (angle * 360) / (2 * Math.PI);
        this.spatializer.setPosition(angle, 0, distance);
    }

    /**
     * hasSpatialAudio
     * Returns whether the attendee has spatial audio components initialized
     */
    public hasSpatialAudio() {
        return this.spatializer !== null;
    }

    /**
     * connectSpatialAudio
     * Connects the audio output to the given WebAudio Node
     */
    public connectSpatialAudio(node: AudioNode) {
        let status = false;
        if (this.spatializer) {
            this.spatializer.connect(node);
            status = true;
        }
        return status;
    }

    /**
     * toggleCamera
     * Toggle the camera status
     */
    public toggleCamera() {
        this.camera = !this.camera;
    }

    /**
     * setCameraStatus
     * Sets the camera status
     */
    public setCameraStatus(status: boolean) {
        this.camera = status;
    }

    /**
     * getCameraStatus
     * Returns the camera status
     */
    public getCameraStatus() {
        return this.camera;
    }

    /**
     * setMicrophoneStatus
     * Sets the microphone status
     */
    public setMicrophoneStatus(status: boolean) {
        this.microphone = status;
    }

    /**
     * toggleMicrophone
     * Toggle the microphone status
     */
    public toggleMicrophone() {
        this.microphone = !this.microphone;
    }

    /**
     * getMicrophoneStatus
     * Returns the microphone status
     */
    public getMicrophoneStatus() {
        return this.microphone;
    }

    /**
     * getUser
     * Returns the Attendee's identification
     */
    public getUser() {
        return this.user;
    }

    /**
     * getStream
     * Returns the stream if exists any registered stream linked to the 
     * given type
     */
    public getStream(type: any) {
        let stream = null;
        if ( this.streams.has(type) ) {
            stream = this.streams.get(type);
        }
        return stream;
    }

    /**
     * addStream
     * Adds a stream object, overrides the current
     */
    public addStream(type: any, stream: any) {
        // Modify the streaming object
        this.removeStream(type);
        this.streams.set(type, stream);

        // Reconnecting the audio if that the case
        if (this.spatializer) {
            if (type == MediaStreamTypes.Microphone) {
                if ( this.source ) {
                    this.source.disconnect(this.spatializer.input());
                }
                this.source = this.context.createMediaStreamSource(stream);
                this.source.connect(this.spatializer.input());
            }
        }

        // Update the status
        if (type == MediaStreamTypes.Microphone) {
            this.setMicrophoneStatus(true);
        } else if(type == MediaStreamTypes.WebCam) {
            this.setCameraStatus(true);
        }
    }

    /**
     * removeStream
     * Removes a stream object
     */
    public removeStream(type: any) {
        if ( this.streams.has(type) ) {
            // Remove the streaming device
            this.streams.delete(type);

            // Update the status
            if (type == MediaStreamTypes.Microphone) {
                this.setMicrophoneStatus(false);
            } else if(type == MediaStreamTypes.WebCam) {
                this.setCameraStatus(false);
            }
        }
    }
};