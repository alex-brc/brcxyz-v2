const DEFAULT_VOLUME = 0.5;

class AudioEngine {
    constructor(){
        // Create the audiocontext
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.slideSpeed = 0.15;
        this.velocity = true;
        this.masterGain = 0.5;

        this._noteOn = false;

        // Create a basic loop
        this.oscillatorA = this.audioContext.createOscillator();
        this.gainA = this.audioContext.createGain();

        this.oscillatorA.type = 'square';

        // Gain will always be wired to output
        this.gainA.connect(this.audioContext.destination);
        this.oscillatorA.connect(this.gainA);
        // 0 gain while key is not pressed
        this.gainA.gain.value = 0;
        this.oscillatorA.start(0);
    }

    start(note, volume) {
        // Wake up if suspended
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();

        // Slide to next note
        if(this._noteOn){
            // Slide osc frequency
            this.oscillatorA.frequency.
                exponentialRampToValueAtTime(
                    NOTE_TO_FREQ[note], 
                    this.audioContext.currentTime + this.slideSpeed);
            // Slide gain value
            if(this.velocity == true)
                this.gainA.gain.setTargetAtTime(volume * this.masterGain, this.audioContext.currentTime, 0.001);
        }
        // Else start a new note
        else {
            if(this.velocity == false)
                volume = DEFAULT_VOLUME;
            // Set oscillator freq
            this.oscillatorA.frequency.value = NOTE_TO_FREQ[note];
            // Turn on gain to sound the note
            this.gainA.gain.setTargetAtTime(volume * this.masterGain, this.audioContext.currentTime, 0.001);
            this._noteOn = true;
            console.log(this.masterGain);
        }

    }
    stop() {
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();
        
        // Mute gain to stop note
        this.gainA.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
        this._noteOn = false;
    }
}