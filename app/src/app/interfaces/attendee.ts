import { MediaStreamTypes } from '../lib/meeting-client/meeting-client';

import { Source } from 'resonance-audio';

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

    /* ResonanceAudio components */
    source: Source;

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
    constructor(user: string) {
        // General property setting
        this.user = user;
        this.streams = new Map();
        this.position = new Position(0, 0);
        this.color = Attendee.generateColor();
        this.source = null;
    }

    /**
     * setSource
     * Sets the new Source in the ResonanceRoom for the spatial audio
     */
    public setSource(source: Source) {
        this.source = source;
    }

    /**
     * setPosition
     * Sets the current position of the Attendee
     */
    public setPosition(x: number, y: number) {
        this.position.set(x, y);
        if (this.source) {
            this.source.setPosition(x, y, 0);
        }
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
     * hasStream
     * returns a boolean indicating if the stream of the given
     * type exists
     */
    public hasStream(type: any) {
      return this.getStream(type) ? true : false;
    }

    /**
     * addStream
     * Adds a stream object, overrides the current
     */
    public addStream(type: any, stream: any) {
        // Modify the streaming object
        this.removeStream(type);
        this.streams.set(type, stream);

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
