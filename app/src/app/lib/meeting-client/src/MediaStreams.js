/**
 * MediaStreamTypes
 * Indicates the stream source
 */
const MediaStreamTypes = {
    WebCam: "webcam", 
    Microphone: "mic", 
    ScreenCapture: "screen"
};

class BaseMediaStream {
    /**
     * BaseMediaStream
     * @param {MediaStreamTypes} type
     */
    constructor(type) {
        this.type = type;
        this.streamer = null;
    }

    /**
     * getKind
     * Returns "video" or "audio" depending on the object's type
     */
    getKind() {
        let ret = "video";
        if(this.type == MediaStreamTypes.Microphone) {
            ret = "audio";
        }
        return ret;
    }

    /**
     * getType
     * Returns the MediaStreamType
     */
    getType() {
        return this.type;
    }

    /**
     * setStreamer
     * Sets the BaseMediaStream's Producer or Consumer
     * @param {Producer or Consumer} streamer 
     */
    setStreamer(streamer) {
        this.streamer = streamer;
    }

    /**
     * getStreamer
     * Returns the MediaSoup Producer or Consumer
     */
    getStreamer() {
        return this.streamer;
    }
}


class LocalMediaStream extends BaseMediaStream {
    /**
     * LocalMediaStream
     * Contains a local Stream and its MediaSoup Producer
     * @param {UserMedia or DisplayMedia} stream 
     * @param {MediaStreamTypes} type 
     */
    constructor(stream, type) {
        super(type);
        this.stream = stream;
    }

    getStream() {
        return this.stream;
    }
}

class RemoteMediaStream extends BaseMediaStream {
    /**
     * RemoteMediaStream
     * Contains a remote's stream MediaSoup Consumer
     * @param {MediaStreamTypes} type 
     * @param {Boolean} paused: initial state
     */
    constructor(type, paused) {
        super(type);
        this.paused = paused;
    }

    /**
     * startedPaused
     * Returns true if the stream was initially paused
     */
    startedPaused() {
        return this.paused;
    }
}

module.exports = { 
    LocalMediaStream, 
    RemoteMediaStream, 
    MediaStreamTypes 
};
