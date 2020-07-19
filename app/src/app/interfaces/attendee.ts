/**
 * Attendee
 * Attendee's data model class
 */
export class Attendee {
    user: string;
    streams: Map<any, any>;

    /**
     * Attendee's constructor
     */
    constructor(user: string) {
        this.user = user;
        this.streams = new Map();
    }

    /**
     * getUser
     * Returns the user identification of this Attendee
     */
    public getUser() {
        return this.user;
    }

    /**
     * getStream
     * Returns the stream if exists any registered stream linked to the 
     * given type.
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
     * Adds a stream object, overrides the current.
     */
    public addStream(type: any, stream: any) {
        this.removeStream(type);
        this.streams.set(type, stream);
    }

    /**
     * removeStream
     * Removes a stream object.
     */
    public removeStream(type: any) {
        if ( this.streams.has(type) ) {
            this.streams.delete(type);
        }
    }
};