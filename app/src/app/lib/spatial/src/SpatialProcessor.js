import { SpatialNode } from "./SpatialNode";
import { SpatialConvolverNode } from "./SpatialConvolverNode";

/**
 * SpatialProcessorNode
 * Represents the spatial sound processing system, built with the IR desired configuration.
 * Permits control over the sound position and the sound source.
 */
export class SpatialProcessorNode extends SpatialNode {
    constructor(context, azimutal=0.0, elevation=0.0, distance=1.0) {
        super(context, azimutal, elevation, distance);
    
        // Loading context and sound processing system's nodes
        this.buffer = new GainNode(this.context);
        this.gain = new GainNode(this.context, { gain: 1 });
        this.convolver = new SpatialConvolverNode(this.context, azimutal, elevation, distance);
        this.reverberator = null;

        // nodes connection
        this.gain.connect(this.convolver.input());
    }

    /**
     * connect
     * Connects SpatialProcessorNode's output
     * @param {AudioNode} node 
     */
    connect(node) {
        this.buffer.connect(node);
    }

    /**
     * disconnect
     * Disconnects SpatialProcessorNode's output
     * @param {AudioNode} node 
     */
    disconnect(node) {
        this.buffer.disconnect(node);
    }

    /**
     * input
     * Exposes SpatialProcessorNode's input
     */
    input() {
        return this.gain;
    }

    /**
     * input
     * Exposes SpatialProcessorNode's output
     */
    output() {
        return this.buffer;
    }

    /**
     * setHRIRContainer
     * Configures the container with the HRTF
     * @param {SpatialIRContainer} container 
     */
    setHRIRContainer(container) {
        this.convolver.setSpatialIRContainer(container);
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
        if (azimutal !== this.azimutal || elevation !== this.elevation || distance !== this.distance) {
            super.setPosition(azimutal, elevation, distance);
            if (azimutal !== null && elevation !== null && distance !== null) {
                if(this.reverberator) {
                    this.reverberator.setPosition(azimutal, elevation, distance);
                }
                this.convolver.setPosition(azimutal, elevation, distance);
                this.buffer.gain.value = 1 / Math.pow(distance, 2);
                return true;
            }
        }
        return false;
    }

    /**
     * setReverberator
     * @param {SpatialNode} reverberator 
     */
    setReverberator(reverberator) {
        if (this.reverberator !== null) {
            this.convolver.disconnect(this.reverberator.input());
            this.reverberator.disconnect(this.buffer);
        }
        this.reverberator = reverberator;
        this.convolver.connect(this.reverberator.input());
        this.reverberator.connect(this.buffer);

    }
};