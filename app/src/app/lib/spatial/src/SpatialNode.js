/**
 * SpatialNode
 * Base class that respresents a spatial sound processing node for the Web Audio API, it's
 * characteristics are modified by the desired direction or position of the sound source.
 * Every SpatialNode's position transition can cause distortions because of the disconinuity
 * in the convolving parameters, so a transitionTime to do cross-fading is always configured.
 */
export class SpatialNode {
    constructor(context, azimutal=0.0, elevation=0.0, distance=1.0, transition=0.25) {
        this.context = context;
        this.transitionTime = transition;
        this.azimutal = azimutal;
        this.elevation = elevation;
        this.distance = distance;
    }

    /**
     * setTransitionTime
     * Modifies the cross-fading transition time
     * @param {Number} transition 
     */
    setTransitionTime(transition) {
        this.transitionTime = transition;
    }
    
    /**
     * setPosition
     * Configures a new position where the sound must be located.
     * @param {Number: deg} azimutal 
     * @param {Number: deg} elevation 
     * @param {Number: meters} distance 
     */
    setPosition(azimutal, elevation, distance) {
        this.azimutal = azimutal;
        this.elevation = elevation;
        this.distance = distance;
    }

    /**
     * disconnect
     * Disconnects SpatialNode's output from the given AudioNode
     * @param {AudioNode} node 
     */
    disconnect(node) {}

    /**
     * connect
     * Connects the SpatialNode's output to the given AudioNode
     * @param {AudioNode} node 
     */
    connect(node) {}

    /**
     * input
     * Exposes node's input for connections, it's overridden
     * returning the first node in the system.
     */
    input() {}

    /**
     * output
     * Exposes node's output for connections, it's overridden
     * returning the last node in the system.
     */
    output() {}
}