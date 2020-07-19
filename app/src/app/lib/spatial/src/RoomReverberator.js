import { SpatialConvolverNode } from './SpatialConvolverNode';

/**
 * RoomReverberatorNode
 * WebAudio node to represent room reverberation using Binaural Room
 * Impulse Responses.
 */
export class RoomReverberatorNode extends SpatialConvolverNode {
    constructor(context, azimutal=0.0, elevation=0.0, distance=1.0) {
        super(context, azimutal, elevation, distance);
    }

    /**
     * setPosition
     * Configures a new position where the sound must be located, 
     * returns bool indicating whether the position could be changed.
     * @param {Number: deg} azimutal 
     * @param {Number: deg} elevation 
     * @param {Number: meters} distance 
     */
    setPosition(azimutal, elevation, distance) {
        return super.setPosition(-azimutal, elevation, distance);
    }
};