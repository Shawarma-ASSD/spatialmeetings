import { MediaStreamTypes } from '../lib/meeting-client/meeting-client';

/**
 * Polar position coordinates interface
 */
export interface Polar {
    angle: number;
    distance: number;
}

/**
 * Position class
 */
export class Position {
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
};

/**
 * Attendee
 * Attendee's data model class
 */
export class Attendee {
    user: string;
    streams: Map<any, any>;
    microphone: boolean;
    camera: boolean;
    position: Position;

    /**
     * Attendee's constructor
     */
    constructor(user: string) {
        this.user = user;
        this.streams = new Map();
        this.position = new Position(0, 0);
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