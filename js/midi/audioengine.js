const DEFAULT_VOLUME = 0.5;

class AudioEngine {
    
    #gainM; #noteOn; 
    shiftA; shiftB;
    
    constructor(){
        // Create the audiocontext
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.slideSpeed = 0.15;
        this.velocity = true;

        this._shiftA = 0;
        this._shiftB = 0;

        // Master gain -- inaccesible, used to turn keys on and off
        this.#gainM = this.audioContext.createGain();
        // Generate Components
        this.oscillatorA = new Oscillator(this.audioContext);
        this.oscillatorB = new Oscillator(this.audioContext);
        this.filterA = new Filter(this.audioContext);
        this.filterB = new Filter(this.audioContext);
        this.lfo = new LFO(this.audioContext);
        
        // Setup core loop
        this._noteOn = false;

        // Connect everything -- Reference the map
        this.oscillatorA.node.connect(this.filterA.node);
        this.filterA.node.connect(this.lfo.node);
        this.lfo.node.connect(this.#gainM);

        this.oscillatorB.node.connect(this.filterB.node);
        this.filterB.node.connect(this.#gainM);

        this.#gainM.connect(this.audioContext.destination);

        // Start everything
        this.#gainM.gain.value = 0;
        this.lfo.start(0);
        this.oscillatorA.start(0);
        this.oscillatorB.start(0);
    }

    start(note, volume) {
        // Wake up if suspended
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();

        // Slide to next note
        if(this._noteOn){
            // Slide osc frequency
            this.oscillatorA._oscillator.frequency.exponentialRampToValueAtTime(
                    NOTE_TO_FREQ[note + this._shiftA], 
                    this.audioContext.currentTime + this.slideSpeed);
            this.oscillatorB._oscillator.frequency.exponentialRampToValueAtTime(
                    NOTE_TO_FREQ[note + this._shiftB], 
                    this.audioContext.currentTime + this.slideSpeed);
            // Maintain initial velocity
        }
        // Else start a new note
        else {
            if(this.velocity == false)
                volume = DEFAULT_VOLUME;
            // Set oscillator freq
            this.oscillatorA._oscillator.frequency.value = NOTE_TO_FREQ[note + this._shiftA];
            this.oscillatorB._oscillator.frequency.value = NOTE_TO_FREQ[note + this._shiftB];
            // Turn on gain to sound the note
            this.#gainM.gain.setTargetAtTime(volume, this.audioContext.currentTime, 0.001);
            this._noteOn = true;
        }
    }
    stop() {
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();
        
        // Mute gain to stop note
        this.#gainM.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
        this._noteOn = false;
    }

    shift(oscillator, value){
        switch(oscillator){
            case 'A': this._shiftA = value;
                return;
            case 'B': this._shiftB = value;
                return;
        }
    }
}


class Oscillator {
    // Protected
    _oscillator;

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

    get gain() { return this.node.gain.value; }
    set gain(value){
        this.node.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    start(value){ this._oscillator.start(value); }
    stop(value){ this._oscillator.stop(value); }
}

class LFO extends Oscillator {
    static frequencyCurve = [0, 1/8, 1/2, 1, 2, 3, 5, 8, 12, 16, 20];

    // Private
    #gain; #constant; 

    constructor(audioContext){
        super(audioContext);
        // Oscillator and node were previously connected
        this._oscillator.disconnect(this.node);
    
        this.#constant = audioContext.createConstantSource();
        this.#gain = audioContext.createGain();
        
        this._oscillator.connect(this.#gain);
        this.#constant.connect(this.#gain);
        this.#gain.connect(this.node.gain);
    }

    get frequency(){ return this._oscillator.frequency.value; }
    set frequency(value){
        value = LFO.frequencyCurve[value];
        this._oscillator.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get gain(){ return this.#gain.value; }
    set gain(value){``
        // Scale the sine wave
        this.#gain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
        // Shift it up by a constant
        value = (1 - value) / 2;
        this.#constant.offset.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }
}

/** This is me trying to cram a lowpass and a high pass onta single slider */
class Filter {
    static cutoffCurve = [300, 700, 1800, 2000, 4000, 7500, 10000, 0, 300, 700, 1800];
    constructor(audioContext){
        this.audioContext = audioContext;
        this.node = audioContext.createBiquadFilter();
    }

    get frequency() { return this.node.frequency.value }
    set frequency(value) {
        // Set filtering algorithm
        this.node.type = (value >= 7) ? 'highpass' : 'lowpass';
        // Select frequency from curve
        this.node.frequency.setTargetAtTime(Filter.cutoffCurve[value], this.audioContext.currentTime, 0.001);
    }
}
