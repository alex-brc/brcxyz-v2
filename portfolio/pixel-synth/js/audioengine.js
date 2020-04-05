/** Detune in fixed intervals:-8ve, -M7, -p5, -M3, -m3, 0, +m3, +M3, +p5, +M7, 8ve*/
const SHIFT_CURVE = [-1200, -1100, -700, -400, -300, 0, +300, +400, +700, +1100, +1200];
const LOWPASS_CURVE = [150, 400, 700, 1200, 3000, 3500, 4000, 5000, 6000, 7000, 10000];
const HIGHPASS_CURVE = [50, 150, 250, 450, 650, 800, 1000, 1200, 1500, 2000, 3000];
const DAMPENING_CURVE = [100, 300, 600, 1000, 2000, 4000, 6500, 8000, 10000, 14000, 19000];
const RELEASE_CURVE = [0, 0.1, 0.2, 0.3, 0.6, 1, 1.5, 2.5];
const ATTACK_CURVE = [0, 0.02, 0.05, 0.1, 0.3, 0.5, 0.8, 1.2];
const COMB_FILTER_TUNINGS = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116].map(dps => dps / 44100); // Sample rate = 44100
const ALLPASS_FREQUENCES = [225, 556, 441, 341]; // All this? Magic.
const DEFAULT_VOLUME = 0.8;

class AudioEngine {
    constructor(){
        // Create the audiocontext
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.started = false;
        this.audioContext = new AudioContext();
        this._noteOn = false;
        this.velocity = true;
        this.resetEnvelope = true;
        this.slideSpeed = 0.1;

        // Final node, used to control velocity
        this._gainM = this.audioContext.createGain();

        // Generate Components
        this.oscillatorA = new Oscillator(this.audioContext);
        this.oscillatorB = new Oscillator(this.audioContext);
        this.envelopeA = new Envelope(this.audioContext);
        this.envelopeB = new Envelope(this.audioContext);
        this.lowpass = new Filter(this.audioContext, 'lowpass');
        this.highpass = new Filter(this.audioContext, 'highpass');
        this.lfo = new LFO(this.audioContext);
        this.mod = new GainPan(this.audioContext);
        this.delay = new Delay(this.audioContext);
        this.reverb = new Freeverb(this.audioContext);

        // Connect everything 
        // Path A
        this.oscillatorA.node.connect(this.mod.left);
        this.mod.left.connect(this.envelopeA.node);
        this.envelopeA.node.connect(this.lowpass.node);

        // Path B
        this.oscillatorB.node.connect(this.mod.right);
        this.mod.right.connect(this.envelopeB.node);
        this.envelopeB.node.connect(this.lowpass.node);

        // Common
        this.lowpass.node.connect(this.highpass.node);
        this.highpass.node.connect(this.lfo.node);
        this.lfo.node.connect(this.delay.input);
        this.delay.output.connect(this.reverb.input);
        this.reverb.output.connect(this._gainM);
        this._gainM.connect(this.audioContext.destination);

        if(iOS)
            this.start();
    }

    // Activate the engine
    start(){
        if(this.started){
            console.log("AUDIOENGINE STARTED TWICE!");
            return;
        }

        this.started = true;
        // Wake up if suspended
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();
            
        this._gainM.gain.value = 1;
        
        this.lfo.start(0);
        this.oscillatorA.start(0);
        this.oscillatorB.start(0);
    }

    play(note) {
        // Wake up if suspended
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();

        // Compute gain volume
        let volume = remap(note.velocity, [0, 127], [0, 1]);
        let pitch = note.pitch;

        // Slide to next note if already playing one
        if(this._noteOn){
            // Clear previous 
            if(this.resetEnvelope){
                this.envelopeA.reset(0);
                this.envelopeB.reset(0);
                this.envelopeA.start(0);
                this.envelopeB.start(0);
            }
            // Slide osc frequency
            this.oscillatorA.slideTo(frequency(pitch), this.slideSpeed);
            this.oscillatorB.slideTo(frequency(pitch), this.slideSpeed);
            // Maintain initial velocity
        }
        // Else start a new note
        else {
            // Clear previous 
            this.envelopeA.reset(0);
            this.envelopeB.reset(0);
            if(this.velocity == false)
                volume = DEFAULT_VOLUME;
            // Set oscillator freq
            this.oscillatorA.frequency = frequency(pitch);
            this.oscillatorB.frequency = frequency(pitch);
            // Turn on gain to sound the note
            this._gainM.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.001);
            this.envelopeA.start(0);
            this.envelopeB.start(0);
            this._noteOn = true;
        }
    }

    release() {
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();
        
        // Mute gain to stop note
        // this._gainM.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
        this.envelopeA.stop(0);
        this.envelopeB.stop(0);
        this._noteOn = false;
    }
}

class Oscillator {
    constructor(audioContext){
        this._shift = 0; // Long term pitch shift
        this._detune = 0; // Pitch wheel

        this.audioContext = audioContext;
        this._oscillator = audioContext.createOscillator();
        this.node = audioContext.createGain();

        this._oscillator.connect(this.node);
    }

    set shape(value){
        let type = '';
    
        switch(value){
            case 0: type = 'sine';
                break;
            case 1: type = 'square';
                break;
            case 2: type = 'sawtooth';
                break;
            case 3: type = 'triangle';
                break;
            default: type = 'sine';
                break;
        }

        this._oscillator.type = type;
    }

    get frequency() { return this._oscillator.frequency.value; }
    set frequency(value){
        this._oscillator.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    slideTo(value, delay) {
        delay = delay || 0.0003;
        this._oscillator.frequency.setTargetAtTime(value, this.audioContext.currentTime + delay, 0.3 * delay);
    }

    get gain() { return this.node.gain.value; }
    set gain(value){
        this.node.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get shift() { return this._shift; }
    set shift(value) {
        this._shift = SHIFT_CURVE[value];
        this._oscillator.detune.setTargetAtTime(this._shift + this._detune, this.audioContext.currentTime, 0.001);
    }

    get detune() { return this._detune; }
    set detune(value) {
        this._detune = value;
        this._oscillator.detune.setTargetAtTime(this._shift + this._detune, this.audioContext.currentTime, 0.001);
    }

    start(value){ this._oscillator.start(value); }
    stop(value){ this._oscillator.stop(value); }
}

/** An implementation of Freeverb following Anton Miselaytes' tutorial at 
 * https://itnext.io/algorithmic-reverb-and-web-audio-api-e1ccec94621a 
 */
class Freeverb {
    constructor(audioContext){
        this.audioContext = audioContext;
        this.input = audioContext.createGain();
        this.output = audioContext.createGain();
        this._dry = audioContext.createGain();
        this._wet = audioContext.createGain();
        
        this._merger = audioContext.createChannelMerger(2);
        this._doubler = {};
        this._doubler.left = audioContext.createGain();
        this._doubler.right = audioContext.createGain();
        this._wet.gain.value = 0.6;
        this._dry.gain.value = 0.4;

        // Route the wet/dry mixer
        this.input.connect(this._wet);
        this._wet.connect(this._doubler.left);
        this._wet.connect(this._doubler.right);

        this.input.connect(this._dry);
        this._dry.connect(this.output);

        // Create filters using Manfred Schroeder's tunings
        this._combFilters = COMB_FILTER_TUNINGS.map( 
            delay => new CombFilter(audioContext, delay));
        const combsLeft = this._combFilters.slice(0, 4);
        const combsRight = this._combFilters.slice(4);
        this._allPassFilters = [];
        for(var frequency of ALLPASS_FREQUENCES){
            var allpass = audioContext.createBiquadFilter();
            allpass.type = 'allpass';
            allpass.frequency.value = frequency;
            this._allPassFilters.push(allpass);
        }
        
        // Connect each set of comb filters to their respective channel
        combsLeft.forEach(combFilter => { // Channel 1
            // Route left channel into comb
            this._doubler.left.connect(combFilter.input); 
            // Route comb into merger
            combFilter.output.connect(this._merger, 0, 0);
        });
        combsRight.forEach(combFilter => { // Channel 2
            // Route right channel into comb
            this._doubler.right.connect(combFilter.input); 
            // Route comb into merger
            combFilter.output.connect(this._merger, 0, 1);
        });
        
        // Route the output from the comb filters to the allpass chain
        this._merger.connect(this._allPassFilters[0]);
        this._allPassFilters[0].connect(this._allPassFilters[1]);
        this._allPassFilters[1].connect(this._allPassFilters[2]);
        this._allPassFilters[2].connect(this._allPassFilters[3]);
        this._allPassFilters[3].connect(this.output); // And the last one to the output
    }

    get wet() { return this._wet.gain.value; }
    set wet(value) {
        this._wet.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
        this._dry.gain.setTargetAtTime((1-value)/2, this.audioContext.currentTime, 0.001);
    }

    get resonance() { return this._combFilters[0].resonance; }
    set resonance(value) {
        for(var combFilter of this._combFilters){
            combFilter.resonance = value;
        }
    }

    get dampening() { return this._combFilters[0].dampening; }
    set dampening(value) {
        for(var combFilter of this._combFilters){
            combFilter.dampening = value;
        }
    }
}

class CombFilter {
    constructor(audioContext, delay){
        this.audioContext = audioContext;
        this.input = audioContext.createGain();
        this.output = audioContext.createGain();
        this._lowPass = audioContext.createBiquadFilter();
        this._delay = audioContext.createDelay();
        this._gain = audioContext.createGain();

        this._lowPass.type = 'lowpass';
        this._lowPass.frequency.value = 440;
        this._delay.delayTime.value = delay;
        this._gain.gain.value = 0.5;

        this.input.connect(this._delay);
        this._delay.connect(this._lowPass);
        this._lowPass.connect(this._gain);
        this._gain.connect(this._delay);
        this._gain.connect(this.output);
    }

    get resonance(){ return this._gain.gain.value; }
    set resonance(value){ 
        value = remap(value, [0,10], [0,0.75]);
        this._gain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get dampening(){ return this._lowPass.frequency.value; }
    set dampening(value){
        value = DAMPENING_CURVE[value];
        this._lowPass.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }
}

class LFO extends Oscillator {
    constructor(audioContext){
        super(audioContext);
        // Oscillator and node were previously connected
        this._oscillator.disconnect(this.node);
    
        this._constant = audioContext.createConstantSource();
        this._gain = audioContext.createGain();
        
        this._oscillator.connect(this._gain);
        this._constant.connect(this._gain);
        this._gain.connect(this.node.gain)
    }

    get frequency(){ return this._oscillator.frequency.value; }
    set frequency(value){ 
        // Value is in [0, 10]
        value = value * value / 5; // Square in [0, 20];
        this._oscillator.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get gain(){ return this._gain.value; }
    set gain(value){``
        // Scale the sine wave
        this._gain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
        // Shift it up by a constant
        value = (1 - value) / 2;
        this._constant.offset.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }
}

class Filter {
    constructor(audioContext, type){
        this.audioContext = audioContext;
        this.setValue = 0;
        this.node = audioContext.createBiquadFilter();
        this.node.type = type;
    }

    get frequency() { return this.node.frequency.value }
    set frequency(value) {
        if(this.node.type == 'lowpass')
            value = LOWPASS_CURVE[value];
        else if(this.node.type == 'highpass')
            value = HIGHPASS_CURVE[value];

        this.setValue = value;
        this.node.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get q() { return this.node.Q.value; }
    set q(value) {
        // 1/2q = 0.1 -> 1 so 1/q = 0.2 -> 2 so q = 1/0.2 <- 1/2 so q = 5 <- 0.5
        value = remap(value, [0, 10], [0.25, 5]);
        this.node.Q.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }
}
/** The play() and stop() methods interact with this class 
 * to control the output of the oscillators, instead of their respective
 * gain nodes. */
class Envelope {
    constructor(audioContext){
        this._open = false;
        this._sustain = 0;
        this._attack = 0;
        this._release = 0;
        this.decay = 0;

        this.audioContext = audioContext;
        this.node = audioContext.createGain();
        this.node.gain.value = 0;
    }

    start(delay){
        this._open = true;
        // ATTACK to max gain
        let dt = delay + this._attack;
        this.node.gain.linearRampToValueAtTime(0.5, this.audioContext.currentTime + dt);
        // DECAY to SUSTAIN value
        dt += this.decay;
        this.node.gain.linearRampToValueAtTime(this._sustain, this.audioContext.currentTime + dt); 
    }

    stop(delay){
        this._open = false;
        // Clear previous targets
        this.reset(0);
        // RELEASE to 0 gain
        let dt = delay + this._release;
        this.node.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + dt);
    }
    
    reset(delay) {
        this.node.gain.cancelScheduledValues(delay);
    }
    
    get sustain() { return this._sustain; }
    set sustain(value){
        this._sustain = value;
        // If the envelope is open, also blend the current sustain nicely
        if(this._open)
            this.node.gain.setTargetAtTime(this._sustain, this.audioContext.currentTime, 0.001);
    }
    
    get attack() { return this._attack; }
    set attack(value) {
        this._attack = ATTACK_CURVE[value];
    }

    get release() { return this._release; }
    set release(value) {
        this._release = RELEASE_CURVE[value];
    }
}
class Delay {
    constructor(audioContext){
        this.audioContext = audioContext;

        this.input = audioContext.createGain();
        this._delay = audioContext.createDelay();
        this._feedback = audioContext.createGain();
        this.output = audioContext.createGain();

        this.input.connect(this._feedback);
        this._delay.connect(this._feedback);
        this._feedback.connect(this._delay);

        this._delay.connect(this.output);
        this.input.connect(this.output);
    }

    get time() { return this._delay.delayTime.value; }
    set time(value) {
        this._delay.delayTime.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get feedback() {return this._feedback.gain.value; }
    set feedback(value) {
        this._feedback.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

}

/** Not stereo, just two regular gains. Faking modulating oscillators */
class GainPan {
    constructor(audioContext){
        this.audioContext = audioContext;
        this.left = audioContext.createGain();
        this.right = audioContext.createGain();
    }

    /**
     * Adjust the gains of the left and right nodes. 
     * Expects a value in [-1, +1], where -1 is just left, 0 is center and +1 is just right
     * @param {number} value 
     */
    pan(value){
        let right = (1 + value);
        let left = (1 - value);
        this.left.gain.setTargetAtTime(left, this.audioContext.currentTime, 0.001);
        this.right.gain.setTargetAtTime(right, this.audioContext.currentTime, 0.001);
    }
}