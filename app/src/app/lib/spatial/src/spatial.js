const SIMPLE_FREE_FIELD_HRIR = "SimpleFreeFieldHRIR";
const MULTI_SPEAKER_BRIR = "MultiSpeakerBRIR";

/**
 * toRadians
 * Performs the complex task of converting an 
 * angle from the degrees domain to the radians
 * domain. o_O
 * @param {Number} degrees 
 */
function toRadians(degrees) {
  var pi = Math.PI;
  return degrees * (pi/180);
}

/**
 * toCartesian
 * Calculates the cartesian coords of the given espherical
 * coords.
 * @param {Number: deg} azimutal 
 * @param {Number: deg} elevation 
 * @param {Number} distance 
 */
function toCartesian(azimutal, elevation, distance) {
    return [
        distance * Math.cos(toRadians(elevation)) * Math.cos(toRadians(azimutal)),
        distance * Math.cos(toRadians(elevation)) * Math.sin(toRadians(azimutal)),
        distance * Math.sin(toRadians(elevation))
    ]
}

/**
 * SpatialIRContainer
 * Generic class that contains impulse responses for spatial processing, each IR is
 * related to a position. The sample rate, response's order, positions and IRs are known.
 * The IRs are binaurals, they have two channels.
 */
export class SpatialIRContainer {

    /**
     * fromJson
     * Factory to construct an SpatialIRContainer from a JSON Object.
     * @param {Object} json 
     */
    static fromJson(json) {
        return new SpatialIRContainer(
            json.sampleRate,
            json.size,
            json.positions,
            json.impulseResponses
        );
    }

    /**
     * SpatialIRContainer constructor
     * @param {Number} rate 
     * @param {Number: int} size 
     * @param {Array} positions related to the impulse responses
     * @param {*} impulseResponses related to the positions
     */
    constructor(rate=null, size=null, positions=null, impulseResponses=null) {
        this.rate = rate;
        this.size = size;
        this.positions = [];
        this.impulseResponses = [];
        this.impulseResponsesBuffers = [];

        if (rate !== null && size !== null && positions !== null && impulseResponses !== null) {
            this.load(rate, size, positions, impulseResponses);
        }
    }

    /**
     * setParameters
     * Configures the sample rate and IR size.
     * @param {Number} rate 
     * @param {Number: int} size 
     */
    setParameters(rate, size) {
        this.rate = rate;
        this.size = size;
    }

    /**
     * addPosition
     * WARNING! Rate and size must be configured before calling this function.
     * @param {Array} position 
     * @param {Array} impulseResponse 
     */
    addPosition(position, impulseResponse) {
        this.positions.push(position);
        this.impulseResponses.push(impulseResponse);
        let currLeft = new Float32Array(impulseResponse[0]);
        let currRight = new Float32Array(impulseResponse[1]);
        let buffer = new AudioBuffer(
            {
                sampleRate: this.rate,
                numberOfChannels: 2,
                length: this.size * 2
            }
        );
        buffer.copyToChannel(currLeft, 0);
        buffer.copyToChannel(currRight, 1);
        this.impulseResponsesBuffers.push(buffer);
    }


    /**
     * load
     * Loads Container's configuration, should be called once.
     * @param {Number} rate 
     * @param {Number: int} size 
     * @param {Array} positions 
     * @param {Array} impulseResponses 
     */
    load(rate, size, positions, impulseResponses) {
        this.rate = rate;
        this.size = size;
        this.positions = positions;
        this.impulseResponses = impulseResponses;
        this.impulseResponsesBuffers = [];
        for (let i = 0 ; i < this.impulseResponses.length ; i++) {
            let currLeft = new Float32Array(this.impulseResponses[i][0]);
            let currRight = new Float32Array(this.impulseResponses[i][1]);
            let buffer = new AudioBuffer(
                {
                    sampleRate: this.rate,
                    numberOfChannels: 2,
                    length: this.size * 2
                }
            );
            buffer.copyToChannel(currLeft, 0);
            buffer.copyToChannel(currRight, 1);
            this.impulseResponsesBuffers.push(buffer);
        }
    }

    /**
     * closest
     * Returns index of the closest registered position to the given parameters.
     * @param {Number: deg} azimutal 
     * @param {Number: deg} elevation 
     * @param {Number: meters} distance 
     */
    closest(azimutal, elevation, distance) {
        let target = toCartesian(azimutal, elevation, distance);
        let targetPosition = null;
        let minDelta = null;
        for (let i = 0 ; i < this.positions.length ; i++) {
            let source = this.positions[i];
            let current = toCartesian(source[0], source[1], source[2]);
            let currDelta = Math.sqrt(
                Math.pow(current[0] - target[0], 2) 
                + Math.pow(current[1] - target[1], 2) 
                + Math.pow(current[2] - target[2], 2)
                );
            if (minDelta === null || minDelta > currDelta) {
                minDelta = currDelta;
                targetPosition = i;
            }
        }
        return targetPosition;
    }

    /**
     * closestPosition
     * Returns closest registered position to the given parameters.
     * @param {Number: deg} azimutal 
     * @param {Number: deg} elevation 
     * @param {Number: meters} distance 
     */
    closestPosition(azimutal, elevation, distance) {
        return this.positions[this.closest(azimutal, elevation, distance)];
    }

    /**
     * closestBuffer
     * Returns the AudioBuffer corresponding to the closest position.
     * @param {Number: deg} azimutal 
     * @param {Number: deg} elevation 
     * @param {Number: meters} distance 
     */
    closestBuffer(azimutal, elevation, distance) {
        return this.impulseResponsesBuffers[this.closest(azimutal, elevation, distance)];
    }
};