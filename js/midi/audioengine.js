/** Detune in fixed intervals:-8ve, -M7, -p5, -M3, -m3, 0, +m3, +M3, +p5, +M7, 8ve*/
const SHIFT_CURVE = [-1200, -1100, -700, -400, -300, 0, +300, +400, +700, +1100, +1200];
/** This is me trying to cram both a lowpass and a highpass onto a single slider */
const CUTOFF_CURVE = [300, 700, 1800, 2000, 4000, 7500, 10000, 0, 300, 700, 1800];
const RELEASE_CURVE = [0, 0.1, 0.2, 0.3, 0.6, 1, 1.5, 2.5];
const ATTACK_CURVE = [0, 0.02, 0.05, 0.1, 0.3, 0.5, 0.8, 1.2];
const FREQUENCY_CURVE = [0, 1/8, 1/2, 1, 2, 3, 5, 8, 12, 16, 20];
const DEFAULT_VOLUME = 0.5;

class AudioEngine {
    _gainM; 
    _noteOn = false; 
    _currentNote; 
    
    constructor(){
        // Create the audiocontext
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.velocity = true;
        this.resetEnvelope = true;

        // Final node, used to control velocity
        this._gainM = this.audioContext.createGain();

        // Generate Components
        this.oscillatorA = new Oscillator(this.audioContext);
        this.oscillatorB = new Oscillator(this.audioContext);
        this.filterA = new Filter(this.audioContext);
        this.filterB = new Filter(this.audioContext);
        this.envelopeA = new Envelope(this.audioContext);
        this.envelopeB = new Envelope(this.audioContext);
        this.lfo = new LFO(this.audioContext);
        this.delay = new Delay(this.audioContext);
        this.mod = new GainPan(this.audioContext);
        
        // Connect everything -- Reference the map
        // Path A
        this.oscillatorA.node.connect(this.mod.left);
        this.mod.left.connect(this.lfo.node);
        this.lfo.node.connect(this.filterA.node);
        this.filterA.node.connect(this.envelopeA.node);
        this.envelopeA.node.connect(this._gainM);

        // Path B
        this.oscillatorB.node.connect(this.mod.right);
        this.mod.right.connect(this.filterB.node);
        this.filterB.node.connect(this.envelopeB.node);
        this.envelopeB.node.connect(this._gainM);

        this._gainM.connect(this.delay.input);
        this.delay.output.connect(this.audioContext.destination);

        // Start everything
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

    stop() {
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
    _oscillator;
    _shift = 0; // Meant for long term detuning
    _detune = 0; // Meant for short term detuning (e.g. pitch wheels)

    constructor(audioContext){
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

class LFO extends Oscillator {
    _gain; 
    _constant; 

    constructor(audioContext){
        super(audioContext);
        // Oscillator and node were previously connected
        this._oscillator.disconnect(this.node);
    
        this._constant = audioContext.createConstantSource();
        this._gain = audioContext.createGain();
        
        this._oscillator.connect(this._gain);
        this._constant.connect(this._gain);
        this._gain.connect(this.node.gain);
    }

    get frequency(){ return this._oscillator.frequency.value; }
    set frequency(value){
        value = FREQUENCY_CURVE[value];
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
    constructor(audioContext){
        this.audioContext = audioContext;
        this.node = audioContext.createBiquadFilter();
    }

    get frequency() { return this.node.frequency.value }
    set frequency(value) {
        // Set filtering algorithm
        this.node.type = (value >= 7) ? 'highpass' : 'lowpass';
        // Select frequency from curve
        this.node.frequency.setTargetAtTime(CUTOFF_CURVE[value], this.audioContext.currentTime, 0.001);
    }
}

/** The play() and stop() methods interact with this class 
 * to control the output of the oscillators, instead of their respective
 * gain nodes. */
class Envelope {
    _sustain;
    _open;
    _attack; 
    _release;
    decay;
    
    constructor(audioContext){
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
        this.node.gain.linearRampToValueAtTime(0.0001, this.audioContext.currentTime + dt); 
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
    _feedback; _delay;
    constructor(audioContext){
        this.audioContext = audioContext;

        this.input = audioContext.createGain();
        this._delay = audioContext.createDelay();
        this._feedback = audioContext.createGain();
        this.output = audioContext.createGain();

        // Loopdy looooooooop looooooop loooop loop lop lp l .
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
/** Not stereo, just two regular gains. Useful for modulating oscillators */
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
