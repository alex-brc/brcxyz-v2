const DEFAULT_VOLUME = 0.5;

class AudioEngine {
    constructor(){
        // Create the audiocontext
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();
        this.slideSpeed = 0.15;
        this.velocity = true;
        this.masterGain = 0.5;

        // Generate components
        this._oscillatorA = this.audioContext.createOscillator();
        this._oscillatorB = this.audioContext.createOscillator();
        this._gainA = this.audioContext.createGain();
        this._gainB = this.audioContext.createGain();

        // Setup core loop
        this._noteOn = false;
        this._oscillatorA.type = 'square';
        this._oscillatorB.type = 'sawtooth';

        // Gain will always be wired to output
        this._gainA.connect(this.audioContext.destination);
        this._gainB.connect(this.audioContext.destination);
        this._oscillatorA.connect(this._gainA);
        this._oscillatorB.connect(this._gainB);

        // 0 gain while key is not pressed
        this._gainA.gain.value = 0;
        this._gainB.gain.value = 0;
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
                    NOTE_TO_FREQ[note], 
                    this.audioContext.currentTime + this.slideSpeed);
            this._oscillatorB.frequency.exponentialRampToValueAtTime(
                    NOTE_TO_FREQ[note], 
                    this.audioContext.currentTime + this.slideSpeed);
            // Slide gain value
            if(this.velocity == true){
                this._gainA.gain.setTargetAtTime(volume * this.masterGain, this.audioContext.currentTime, 0.001);
                this._gainB.gain.setTargetAtTime(volume * this.masterGain, this.audioContext.currentTime, 0.001);
            }
        }
        // Else start a new note
        else {
            if(this.velocity == false)
                volume = DEFAULT_VOLUME;
            // Set oscillator freq
            this._oscillatorA.frequency.value = NOTE_TO_FREQ[note];
            this._oscillatorB.frequency.value = NOTE_TO_FREQ[note];
            // Turn on gain to sound the note
            this._gainA.gain.setTargetAtTime(volume * this.masterGain, this.audioContext.currentTime, 0.001);
            this._gainB.gain.setTargetAtTime(volume * this.masterGain, this.audioContext.currentTime, 0.001);
            this._noteOn = true;
        }
    }
    stop() {
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();
        
        // Mute gain to stop note
        this._gainA.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
        this._gainB.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.001);
        this._noteOn = false;
    }
}