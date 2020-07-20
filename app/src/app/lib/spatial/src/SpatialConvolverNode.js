import { SpatialNode } from './SpatialNode';

/**
 * SpatialConvolverNode
 * Represents a two-channel convolver for spatialization, switching dinamically
 * according to the IR position and applying cross-fading.
 */
export class SpatialConvolverNode extends SpatialNode {
    constructor(context, azimutal=0.0, elevation=0.0, distance=1.0) {
        super(context, azimutal, elevation, distance);
        this.container = null;
        this.currentTime = null;
        this.currentConvolver = 0;
        
        this.inputBuffer = new GainNode(this.context);
        this.outputBuffer = new GainNode(this.context);
        this.faders = [
            new GainNode(this.context, {gain: 1.0}),
            new GainNode(this.context, {gain: 0})
        ];
        this.convolvers = [
            new ConvolverNode(this.context),
            new ConvolverNode(this.context)
        ];

        this.inputBuffer.connect(this.convolvers[0]);
        this.inputBuffer.connect(this.convolvers[1]);
        this.convolvers[0].connect(this.faders[0]);
        this.convolvers[1].connect(this.faders[1]);
        this.faders[0].connect(this.outputBuffer);
        this.faders[1].connect(this.outputBuffer);
    }

    /**
     * isAvailable
     * Returns true if the spatializer is available to modify it's position.
     * If it isn't, the position can't be modified. This is used for transitions.
     */
    isAvailable() {
        if (this.currentTime === null) {
            return true;
        } else {
            return this.context.currentTime >= this.currentTime;
        }
    }

    /**
     * connect
     * Connects SpatialConvolverNode's output
     * @param {AudioNode} node 
     */
    connect(node) {
        this.outputBuffer.connect(node);
    }

    /**
     * disconnect
     * Disonnects SpatialConvolverNode's output
     * @param {AudioNode} node 
     */    
    disconnect(node) {
        this.outputBuffer.disconnect(node);
    }

    /**
     * input
     * Exposes SpatialConvolverNode's input
     */
    input() {
        return this.inputBuffer;
    }

    /**
     * output
     * Exposes SpatialConvolerNode's output
     */    
    output() {
        return this.outputBuffer;
    }

    /**
     * setSpatialIRcontainer
     * @param {SpatialIRContainer} container 
     */
    setSpatialIRContainer(container) {
        this.container = container;
        this.convolvers[this.currentConvolver].buffer = this.container.closestBuffer(this.azimutal, this.elevation, this.distance);
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
                if (this.container !== null){
                    if (this.isAvailable()) {
                        this.currentTime = this.context.currentTime + this.transitionTime;
                        this.faders[this.currentConvolver].gain.linearRampToValueAtTime(0, this.currentTime);
                        this.currentConvolver = this.currentConvolver == 0 ? 1 : 0;
                        this.faders[this.currentConvolver].gain.linearRampToValueAtTime(1, this.currentTime);
                        this.convolvers[this.currentConvolver].buffer = this.container.closestBuffer(azimutal, elevation, distance);
                        return true;
                    }
                }
            }
        }
        return false;
    }
};