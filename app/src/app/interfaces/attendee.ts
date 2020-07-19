/**
 * Attendee
 * Attendee's data model class
 */
export class Attendee {
    user: string;
    streams: Map<any, any>;
    microphone: boolean;
    camera: boolean;

    /**
     * Attendee's constructor
     */
    constructor(user: string) {
        this.user = user;
        this.streams = new Map();
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
        this.removeStream(type);
        this.streams.set(type, stream);
    }

    /**
     * removeStream
     * Removes a stream object
     */
    public removeStream(type: any) {
        if ( this.streams.has(type) ) {
            this.streams.delete(type);
        }
    }
};