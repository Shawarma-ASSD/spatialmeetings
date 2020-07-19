/**
 * ServerIRContainer
 * Contains an HRIR or a BRIR, formed by the impulse responses and their corresponding
 * source positions.
 */
class ServerIRContainer {
    
    /**
     * fromJson
     * Factory to create a ServerIRContainer from JSON.
     * @param {Object} json 
     */
    static fromJson(json) {
        return new SpatialIRContainer(
            json.sampleRate,
            json.dimensions[2],
            json.positions,
            json.impulseResponses
        );
    }

    /**
     * ServerIRContainer constructor
     * @param {Number} rate 
     * @param {Number} size 
     * @param {Array} positions 
     * @param {Array} impulseResponses
     */
    constructor(rate, size, positions, impulseResponses) {
        this.rate = rate;
        this.size = size;
        this.positions = positions;
        this.impulseResponses = impulseResponses;
    }

    /**
     * getPositions
     * Returns an Array with all the positions. Each position is an
     * Array: [azimutal, elevation, distance]
     */
    getPositions() {
        return this.positions;
    }

    /**
     * getIRs
     * Returns and Array with all the Impulse Responses.
     * If an index is given, returns the Binaural Impulse Response corresponding to that index.
     */
    getIRs(index) {
        let ret = null;
        if( index !== undefined && index < this.impulseResponses.length ) {
            ret = this.impulseResponses[index];
        }
        else if (index === undefined ){
            ret = this.impulseResponses;
        }
        return ret;
    }
}

module.exports = {
    ServerIRContainer
}