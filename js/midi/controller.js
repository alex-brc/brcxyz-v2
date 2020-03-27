var noteRange = [48, 72];
var currentOctave = 4;

class Controller extends PIXI.Sprite {
    #noteStack; _mouseDown;
    constructor(x, y, anchorX, anchorY, scale) {
        // Alias resources
        var spritesheet = PIXI.Loader.shared.resources.controller.spritesheet;
        var buttonsheet = PIXI.Loader.shared.resources.common.spritesheet;

        // Make this
        super(spritesheet.textures["base.png"]);
        this.spritesheet = spritesheet;
        this.buttonsheet = buttonsheet;
        
        this.#noteStack = [];
        this.tooltipSet = new TooltipSet();


        // Setup all the components of the keyboard
        this.components = {};
        this.components.dictionary = {};
        this.components.sine = setupSine(this);
        this.components.sliders = setupSliders(this);
        this.components.knobs = setupKnobs(this);
        this.components.octaveButtons = setupOctaveButtons(this);
        this.components.keys = setupKeys(this);
        this.components.wheels = setupWheels(this);

        // Add the tooltips above the others
        this.addChild(this.tooltipSet);
        
        // Setup the base object
        this.x = x;
        this.y = y;
        this.anchor.x = anchorX;
        this.anchor.y = anchorY;
        this.scale.set(scale);

        // Controller now ready to be staged

        // Setup definitions
        function setupKeys(base) {
            // Locations of keys on base sprite
            const x = [34, 43, 47, 56, 60, 73, 82, 86, 95, 99, 108, 112,
                125, 134, 138, 147, 151, 164, 173, 177, 186, 190, 199, 203, 216];
            const y = 54;
            // Draw black keys last, for raycast priority
            const drawingOrder = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24,
                1, 3, 6, 8, 10, 13, 15, 18, 20, 22];
            const tooltips = ["a", "w", "s", "e", "d", "f", "t", "g", "y", "h", "u", "j", 
                "k/A", "o/W", "l/S", "p/E", ";/D", "F", "T", "G", "Y", "H", "U", "J", "K"];
            let keys = [];
            for(var i of drawingOrder) {
                keys[i] = new Key(
                    -base.width / 2 + x[i], 
                    -base.height / 2 + y,
                    i,
                    base.tooltipSet.create("[" + tooltips[i] + "]", 'left'));

                base.addChild(keys[i]); 
            }
            
            return keys;
        }       
        function setupSine(base) {
            // Make sine animation
            let sineAnimation = new PIXI.AnimatedSprite(spritesheet.animations["sine"]);
            sineAnimation.animationSpeed = 0.3;
            // Position it correctly
            sineAnimation.x = -base.width / 2 + 176;
            sineAnimation.y = -base.height / 2 + 22;
            sineAnimation.play();
            // Add it to base
            base.addChild(sineAnimation);

            return sineAnimation;
        }
        function setupKnobs(base) {
            // Set knob positionings
            const x = [12, 27, 42, 57, 72, 87, 17, 32, 47, 62, 77, 92];
            const y = [27, 27, 27, 27, 27, 27, 40, 40, 40, 40, 40, 40];
            const tooltips = ["A>shape", "A>attack", "A>sustain", "A>decay", "A>release", "A>gain", 
                                "B>shape", "B>attack", "B>sustain", "B>decay", "B>release", "B>gain"];
            const initialValues = [2, 1, 7, 4, 3, 5, 
                                    1, 4, 5, 5, 4, 3];
            const types = [4, 8, 8, 8, 8, 8, 
                            4, 8, 8, 8, 8, 8];
            let callbacks = [
                function (v) {audioEngine.oscillatorA.shape = v},
                function (v) {audioEngine.envelopeA.attack = v},
                function (v) {audioEngine.envelopeA.sustain = remap(v, [0,7], [0, 0.5])},
                function (v) {audioEngine.envelopeA.decay = remap(v, [0,7], [0, 1])},
                function (v) {audioEngine.envelopeA.release = v},
                function (v) {audioEngine.oscillatorA.gain = remap(v, [0,7], [0, 1])},  
                function (v) {audioEngine.oscillatorB.shape = v},
                function (v) {audioEngine.envelopeB.attack = v},
                function (v) {audioEngine.envelopeB.sustain = remap(v, [0,7], [0, 0.5])},
                function (v) {audioEngine.envelopeB.decay = remap(v, [0,7], [0, 1])},
                function (v) {audioEngine.envelopeB.release = v},
                function (v) {audioEngine.oscillatorB.gain = remap(v, [0,7], [0, 1])}];
            let knobs = [];
            for (let i = 0; i < 12; i++) {
                knobs[i] = new Knob(
                    -base.width / 2 + x[i], -base.height / 2 + y[i],
                    tooltips[i],
                    base.tooltipSet.create(tooltips[i], 'left'),
                    initialValues[i],
                    types[i],
                    callbacks[i]);
                
                base.components.dictionary[knobs[i].name] = knobs[i];
                base.addChild(knobs[i]);
            }   
            
            return knobs;
        }
        function setupSliders(base) {
            const x = [110, 118, 126, 134, 142, 150, 158, 166];
            const initialValues = [9, 1, 5, 9, 0, 4, 7, 3];
            const tooltips = [ "A>LFO freq.", "A>LFO gain", "A>filter", "B>filter",
                             "B>shift", "delay time", "delay feedback", "slide speed"];
            const neutralValues = [0, 0, 7, 7, 5, 5, 5, 5];
            let callbacks = [
                function (v) {audioEngine.lfo.frequency = v},
                function (v) {audioEngine.lfo.gain = v / 10},
                function (v) {audioEngine.filterA.frequency = v},
                function (v) {audioEngine.filterB.frequency = v},
                function (v) {audioEngine.oscillatorB.shift = v},
                function (v) {audioEngine.delay.time = v/20},
                function (v) {audioEngine.delay.feedback = v/20},
                function (v) {audioEngine.slideSpeed = v / 50;},
            ];
            let sliders = [];
            for (let i = 0; i < x.length; i++) {
                // Make slider
                sliders[i] = new Slider(
                    -base.width / 2 + x[i],
                    initialValues[i],
                    neutralValues[i],
                    tooltips[i], // name
                    base.tooltipSet.create(tooltips[i], 'right'),
                    callbacks[i]
                );

                // Place red markers at neutral positions
                // base.addChild(sliders[i].marker);

                // Add to base and dictionary
                base.components.dictionary[sliders[i].name] = sliders[i];
                base.addChild(sliders[i]);
            }

            return sliders;
        }
        function setupOctaveButtons(base){
            var octaveDown = new OctaveButton(
                'down', 
                -base.width / 2 + 5,
                -base.height / 2 + 95,
                base.tooltipSet.create("[z] octave-"));

            var octaveUp = new OctaveButton(
                'up', 
                -base.width / 2 + 17,
                -base.height / 2 + 95,
                base.tooltipSet.create("[x] octave+"));
            
            // Cross link them
            octaveUp.other = octaveDown;
            octaveDown.other = octaveUp;

            base.addChild(octaveUp);
            base.addChild(octaveDown);

            return {
                octaveUp,
                octaveDown
            };

            function up () {
                // Max 3 octaves up and down
                if(currentOctave == 7)
                    return;
                currentOctave++;
                // Move note range up one octave
                noteRange[0] += 12;
                noteRange[1] += 12;

                // Alter sprite
                this.updateTexture();
                this.other.updateTexture();
            }
            function down () {
                // Max 3 octaves up and down
                if(currentOctave == 1)
                    return;
                currentOctave--;
                // Move note range up one octave
                noteRange[0] -= 12;
                noteRange[1] -= 12;

                // Alter sprite
                this.updateTexture();
                this.other.updateTexture();
            }
        }
        function setupWheels(base){
            var modWheel = new Wheel(
                -base.width / 2 + 5,
                -base.height / 2 + 55,
                "modwheel",
                base.tooltipSet.create("modulation"),
                function (value) {audioEngine.mod.pan(1-value)});
                
            var pitchWheel = new Wheel(
                -base.width / 2 + 17,
                -base.height / 2 + 55,
                "pitchwheel",
                base.tooltipSet.create("pitch"),
                function (value) { console.log("pitch: " + (-value+1));
                    audioEngine.oscillatorA.detune = (1-value) * 200; 
                    audioEngine.oscillatorB.detune = (1-value) * 200; });

            base.addChild(modWheel);
            base.addChild(pitchWheel);

            base.components.dictionary[modWheel.name] = modWheel;
            base.components.dictionary[pitchWheel.name] = pitchWheel;

            return [modWheel, pitchWheel];
        }
    }
    
    press(note) {
        // Add this pressed note to the list
        if((this.#noteStack.length > 0 && this.#noteStack.last().pitch != note.pitch) || this.#noteStack.length == 0){
            this.#noteStack.push(note);
        }
        
        // Play note
        audioEngine.play(note);
        // If note is outside range, don't light up key
        if (note.pitch >= noteRange[0] && note.pitch <= noteRange[1]) {
            // Find the key corresponding to the note
            let key = note.pitch - noteRange[0];
            // Retexture the pressed key
            this.components.keys[key].texture = this.spritesheet.textures[Key.keyTypes[key] + "-on.png"]; // on texture
        }
    }
    release(pitch) {
        // Remove this note from the list
        {
            let p = -1;
            // Find its index
            for(let i = 0; i < this.#noteStack.length; i++){
                if(this.#noteStack[i].pitch == pitch){
                    p = i;
                    break;
                }
            }
            // Remove it
            if(p != -1){
                this.#noteStack.splice(p, 1);
            }
        }
        // If the last active key is depressed, stop
        if(this.#noteStack.length == 0){
            audioEngine.stop();
        }// Else play the last key that was pressed
        else{
            this.press(this.#noteStack.last());
        }
    
        // If note is outside range, don't light up key
        if (pitch >= noteRange[0] && pitch <= noteRange[1]) {
            // Find the key corresponding to the note
            let key = pitch - noteRange[0];
            // Retexture the depressed key
            this.components.keys[key].texture = this.spritesheet.textures[Key.keyTypes[key] + ".png"]; // off texture
        }
    }

    octaveChange(shiftAmount) {
        if(this.#noteStack.length == 0)
            return;

        // Shift all the notes in the stack
        for(var e of this.#noteStack){
            e.pitch += 12 * shiftAmount;
        }

        // Play the note highest in the stack
        let note = this.#noteStack.last();
        audioEngine.play(note);
    }

    processMIDIMessage(message) {
        var command = message.data[0];
        var pitch = message.data[1];
        var velocity = (message.data.length > 2) ? message.data[2] : 0; 
        switch (command) {
            // Key pressed
            case 144:
                if (velocity > 0) {
                    this.press({pitch, velocity});
                }
                else {
                    this.release(pitch);
                }
                break;
            // Key lifted
            case 128:
                this.release(pitch);
                break;
        }
    }
    searchComponent(string){
        return this.components.dictionary[string];
    }
}

/** 
 * Basic component class for the synth controls. Does not
 * define any interactivity and should be extended
 */
class Component extends PIXI.Sprite {
    /**
     * @param {PIXI.Texture} texture Texture to generate sprite from
     * @param {number} x Position x
     * @param {number} y Position y
     * @param {number} px Pivot x
     * @param {number} py Pivot y
     * @param {string} name Searchable component name
     * @param {number} maxValue Maximum acceptable value (inclusive)
     * @param {number} initialValue Initial value (0 to maxValue)
     * @param {PIXI.Container} tooltip Tooltip object
     * @param {*} callbackFunc Function to execute when this.value changes
     */
    constructor(texture, x, y, px, py, name, maxValue, initialValue, tooltip, callbackFunc){
        // Sprite details
        super(texture);
        this.x = x;
        this.y = y;
        this.pivot.x = px;
        this.pivot.y = py;

        // Component details
        this.callbackFunc = callbackFunc;
        this.name = name;
        this.maxValue = maxValue;
        this.value = initialValue;
        this.tooltip = tooltip;
        this.on('mouseover', TooltipSet.showTooltip)
            .on('mouseout', TooltipSet.hideTooltip);
    }

    /** @param {number} value */
    set value(value){
        this._value = value;
        this.callbackFunc(value);
    }
    
    get value(){
        return this._value;
    }
}
class OctaveButton extends Component {
    constructor(type, x, y, tooltip){
        var textures = PIXI.Loader.shared.resources.common.spritesheet.textures;
        var texture = textures["button-" + type + ".png"];
        super(texture, x, y, 0, 0, "octave"+type, 0, 0, tooltip, () => {})

        this.type = type;
        this.textures = textures;

        // Bind interactives
        this.callbackFunc = (type == 'up') ? up : down;
        this.interactive = true;
        this.buttonMode = true;
        this.on('mousedown', this.callbackFunc)
            .on('touchstart', this.callbackFunc);

        // Bind keyboard buttons
        let key = (type == 'up') ? 'x' : 'z';
        // Lowercase and uppercase
        this.keyButtonL = keyboard(key);
        this.keyButtonL.press = () => {
            this.callbackFunc();
        };
        this.keyButtonU = keyboard(key.toUpperCase());
        this.keyButtonU.press = () => {
            this.callbackFunc();
        };

        function up () {
            // Max 3 octaves up and down
            if(currentOctave == 7)
                return;
            currentOctave++;
            this.parent.octaveChange(+1);
            // Move note range up one octave
            noteRange[0] += 12;
            noteRange[1] += 12;

            // Alter sprite
            this.updateTexture();
            this.other.updateTexture();
        }
        function down () {
            // Max 3 octaves up and down
            if(currentOctave == 1)
                return;
            currentOctave--;
            this.parent.octaveChange(-1);
            // Move note range up one octave
            noteRange[0] -= 12;
            noteRange[1] -= 12;

            // Alter sprite
            this.updateTexture();
            this.other.updateTexture();
        }
    }

    updateTexture() {
        // Some napkin maths to avoid large switches
        let t = -1, shift  = 0;
        if(this.type == 'down'){
            t = 4 - currentOctave;
            shift = 4;
        }
        else if(this.type == 'up')
            t = currentOctave - 4;
        
        if(t >= 0)
            this.texture = this.textures[OctaveButton.buttonTypes[t + shift]];
    }

    static buttonTypes = [
        "button-up.png","button-up-green.png","button-up-yellow.png","button-up-blue.png", 
        "button-down.png","button-down-green.png","button-down-yellow.png","button-down-blue.png", 
        ]
}
class Slider extends Component {
    /**
     * @param {number} x Position x
     * @param {number} y Position y
     * @param {number} px Pivot x
     * @param {number} py Pivot y
     * @param {PIXI.Container} tooltip Tooltip object
     * @param {*} callbackFunc Function to execute when this.value changes
     */
    constructor(x, initialValue, neutralValue, name, tooltip, callbackFunc){
        super(PIXI.Loader.shared.resources.common.spritesheet.textures["slider.png"],
        x, -initialValue*2-12, 3, 1, name, 10, initialValue, tooltip, callbackFunc);

        /* 
        this.marker = new PIXI.Sprite(PIXI.Loader.shared.resources.common.spritesheet.textures["red-mark.png"]);
        this.marker.y = -neutralValue*2-12;
        this.marker.x = x;
        */

        // Bind interactions
        this.on('mousedown', onDragStart).on('touchstart', onDragStart)
            .on('mouseup', onDragEnd).on('mouseupoutside', onDragEnd)
            .on('touchend', onDragEnd).on('touchendoutside', onDragEnd)
            .on('mousemove', onDragMove).on('touchmove', onDragMove);
        this.buttonMode = true;
        this.interactive = true;
        
        function onDragStart(event) {
            this.eventData = event.data;
            this.dragging = true;
        }
        function onDragEnd(event) {
            this.eventData = null;
            this.dragging = false;
        }
        function onDragMove(event) {
            if (this.dragging) {
                var newPosition = this.eventData.getLocalPosition(this.parent);
                if (newPosition.y > -32 && newPosition.y <= -10){
                    // Also update value and master gain
                    this.value = (-round(newPosition.y, 2) - 12) / 2;
                }
            }
        }
    }

    /**
     * @param {number} value
     */
    set value(value){
        // Clamp to [0, maxValue]
        if(value >= 0 && value <= this.maxValue){
            this._value = value;
            // Propagate
            this.position.y = - value * 2 - 12;
            this.callbackFunc(value);
        }
    }

    get value() {
        return this._value;
    }

}
class Knob extends Component {
    constructor(x, y, name, tooltip, initialValue, type, callbackFunc){
        if(type != 4 && type != 8)
            return undefined;
        // Find corresponding initial texture
        var tex = Knob.matchTexture(initialValue, type);
        super(tex, x, y, 2, 2, name, type - 1, initialValue, tooltip, callbackFunc);

        this._type = type;
        this.value = initialValue;
        // Bind interactions
        this.on('click', onDown)
            .on('tap', onDown);
        this.buttonMode = true;
        this.interactive = true;

        function onDown(event) {
            this.value++;
        }
    }

    /**
     * @param {number} value
     */
    set value(value){
        value = value % (this.maxValue + 1);
        // Clamp to [0, maxValue]
        this._value = value;
        this.texture = Knob.matchTexture(value, this._type);
        this.callbackFunc(this._value);
    }

    get value(){
        return this._value;
    }


    static matchTexture(value, type){
        // Alias resources
        let textures = PIXI.Loader.shared.resources.common.spritesheet.textures;
        // Shift value for 
        if(type == 4)
            value = value * 2
        
        switch(value){
            case 0: return textures["bottom.png"];
            case 1: return textures["bottom-left.png"];
            case 2: return textures["left.png"];
            case 3: return textures["top-left.png"];
            case 4: return textures["top.png"];
            case 5: return textures["top-right.png"];
            case 6: return textures["right.png"];
            case 7: return textures["bottom-right.png"];
            default: return undefined;
        }
    }
}
class Key extends Component {
    static secondaryBinds = ["k", "o", "l", "p", ";"];
    constructor(x, y, keyId, tooltip){
        var name = "key" + keyId;
        var tex = PIXI.Loader.shared.resources.controller.spritesheet.
            textures[Key.keyTypes[keyId] + ".png"];
        super(tex, x, y, 0, 0, name, 0, 0, tooltip, () => {});

        this.keyId = keyId;

        // Bind keyboard
        this.keyButton = keyboard(Key.keyButton[keyId]);
        this.keyButton.press = () =>  { this.onKeyboardDown(); };
        this.keyButton.release = () => { this.onKeyboardUp(); };

        // Hack but whatever at this point
        if(keyId >= 12 && keyId <= 16){
            this.keyButton2 = keyboard(Key.secondaryBinds[keyId - 12]);
            this.keyButton2.press = () =>  { this.onKeyboardDown(); };
            this.keyButton2.release = () => { this.onKeyboardUp(); };
        }

        // Bind callbacks
        this.interactive = true;
        this.buttonMode = true;
        this.on('mousedown', onDown)
            .on('touchstart', onDown)
            .on('mouseup', onUp)
            .on('mouseupoutside', onUp)
            .on('touchend', onUp)
            .on('touchendoutside', onUp)
            .on('mouseover', onEnter)
            .on('mouseout', onExit);
        
        function onDown(event) {
            this.parent.mouseDown = true;
            // Get local mouse y to calculate velocity
            let y = this.toLocal(event.data.global).y;
            let velocity = remap(y, [0, this.height], [0, 127])
            velocity = Math.floor(velocity);
            let pitch = this.keyId + noteRange[0];
            this.parent.press({pitch, velocity});
        }
        function onUp(event) {
            this.parent.mouseDown = false;
            let pitch = this.keyId + noteRange[0];
            this.parent.release(pitch);
        }
        function onEnter(event) {
            if (this.parent.mouseDown){
                // Get local mouse y to calculate velocity
                let y = this.toLocal(event.data.global).y;
                let velocity = remap(y, [0, this.height], [0, 127])
                velocity = Math.floor(velocity);
                let pitch = this.keyId + noteRange[0];
                this.parent.press({pitch, velocity});
            }
        }
        function onExit(event) {
            if (this.parent.mouseDown){
                let pitch = this.keyId + noteRange[0];
                this.parent.release(pitch);
            }
        }
    }

    onKeyboardUp(){
        let pitch = this.keyId + noteRange[0];
        this.parent.release(pitch);
    }

    onKeyboardDown(){
        let pitch = this.keyId + noteRange[0];
        let velocity = 63;
        this.parent.press({pitch, velocity});
    }



    static keyButton = [
        "a", "w", "s", "e", "d", 
        "f", "t", "g", "y", "h", "u", "j", 
        "A", "W", "S", "E", "D", 
        "F", "T", "G", "Y", "H", "U", "J", "K"];

    static keyTypes = [
        "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
        "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey",
        "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
        "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey-logo", "lastkey"
    ];
}
class Wheel extends Component {
    constructor(x, y, name, tooltip, callbackFunc){
        var texture = PIXI.Loader.shared.resources.common.spritesheet.textures["touch-wheel.png"];
        super(texture, x, y, 0, 0, name, 2, 1, tooltip, callbackFunc);

        // Define effective y range (to improve usability and accuracy)
        this.yRange = [2, 36];

        // Bind interactions
        this.on('mousedown', onDragStart).on('touchstart', onDragStart)
            .on('mouseup', onDragEnd).on('mouseupoutside', onDragEnd)
            .on('touchend', onDragEnd).on('touchendoutside', onDragEnd)
            .on('mousemove', onDragMove).on('touchmove', onDragMove);
        this.buttonMode = true;
        this.interactive = true;

        function onDragStart(event) {
            this.eventData = event.data;
            this.dragging = true;
            this.value = this.valueFrom(this.eventData.getLocalPosition(this));
            
        }
        function onDragEnd(event) {
            this.eventData = undefined;
            this.dragging = false;
            // Reset value
            this.value = 1;
        }
        function onDragMove(event) {
            if (this.dragging) {
                let pos = this.eventData.getLocalPosition(this);
                this.value = this.valueFrom(pos);
            }
        }
    }
    
    valueFrom(position) {
        let value = Math.floor(position.y);
        
        // Clamp to set values
        if(value < this.yRange[0])
            value = this.yRange[0];
        else if(value > this.yRange[1])
            value = this.yRange[1];
        
        // Remap to value interval
        return remap(value, this.yRange, [0,2]);
    }
}