const DEFAULT_VOLUME = 0.5;

class AudioEngine {
    constructor(){
        // Create the audiocontext
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.slideSpeed = 0.15;
        this.velocity = true;

        this.gainM = 0;
        this.shiftA = 0;
        this.shiftB = 0;

        // Generate components
        this._oscillatorA = this.audioContext.createOscillator();
        this._oscillatorB = this.audioContext.createOscillator();
        this._gainA = this.audioContext.createGain();
        this._gainB = this.audioContext.createGain();
        this._gainM = this.audioContext.createGain(); // Master gain

        // Setup core loop
        this._noteOn = false;

        // Gain will always be wired to output
        this._gainM.connect(this.audioContext.destination);
        this._gainA.connect(this._gainM);
        this._gainB.connect(this._gainM);
        this._oscillatorA.connect(this._gainA);
        this._oscillatorB.connect(this._gainB);

        // 0 gain while key is not pressed
        this._gainM.gain.value = 0;
        this._gainB.gain.value = 0.5; // Max 1/2 for these two
        this._gainA.gain.value = 0.5;
        
        this._oscillatorA.start(0);
        this._oscillatorB.start(0);
    }

    start(note, volume) {
        // Wake up if suspended
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();

        // Slide to next note
        if(this._noteOn){
            // Slide osc frequency
            this._oscillatorA.frequency.exponentialRampToValueAtTime(
                    NOTE_TO_FREQ[note + this.shiftA], 
                    this.audioContext.currentTime + this.slideSpeed);
            this._oscillatorB.frequency.exponentialRampToValueAtTime(
                    NOTE_TO_FREQ[note + this.shiftB], 
                    this.audioContext.currentTime + this.slideSpeed);
            // Slide gain value
            if(this.velocity == true){
                this._gainM.gain.setTargetAtTime(volume * this.gainM, this.audioContext.currentTime, 0.001);
            }
        }
        // Else start a new note
        else {
            if(this.velocity == false)
                volume = DEFAULT_VOLUME;
            // Set oscillator freq
            this._oscillatorA.frequency.value = NOTE_TO_FREQ[note + this.shiftA];
            this._oscillatorB.frequency.value = NOTE_TO_FREQ[note + this.shiftB];
            // Turn on gain to sound the note
            this._gainM.gain.setTargetAtTime(volume * this.gainM, this.audioContext.currentTime, 0.001);
            this._noteOn = true;
        }
    }
    stop() {
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();
        
        // Mute gain to stop note
        this._gainM.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
        this._noteOn = false;
    }

    shape(oscillator, value){
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
            default: type = 'triangle';
                break;
        }

        if(oscillator == 'A')
            this._oscillatorA.type = type;
        else if(oscillator == 'B')
            this._oscillatorB.type = type;
    }

    gain(gain, value){
        switch(gain){
            case 'A': 
                this._gainA.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
                return;
            case 'B': 
                this._gainB.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
                return;
            case 'M':
                if(this._noteOn)
                    this._gainM.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
                else
                    this.gainM = value;
                return;
        }
    }

    shift(oscillator, value){
        switch(oscillator){
            case 'A': this.shiftA = value;
                return;
            case 'B': this.shiftB = value;
                return;
        }
    }
}