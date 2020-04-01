var noteRange = [48, 72];
var currentOctave = 4;

class Controller extends PIXI.Sprite {
    _noteStack;
    constructor(anchorX, anchorY) {
        // Alias resources
        var spritesheet = PIXI.Loader.shared.resources.controller.spritesheet;
        var buttonsheet = PIXI.Loader.shared.resources.controller.spritesheet;

        // Make this
        super(spritesheet.textures["base.png"]);
        this.spritesheet = spritesheet;
        this.buttonsheet = buttonsheet;
        
        this._noteStack = [];
        this.tooltipSet = new TooltipSet();
        this.tooltipSet.visible = false;

        // Set up MIDI here
        this.midiAccess = null;
        navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure);

        function onMIDIFailure() {console.log("No midi")};
        function onMIDISuccess(midiAccess) {
            controller.midiAccess = midiAccess;
            // Add listeners to all midi inputs
            for (var input of midiAccess.inputs.values()){
                input.onmidimessage = Controller.processMIDIMessage;
            }

            // If a new device is input, listen to it
            midiAccess.onstatechange = (e) => {
                e.port.onmidimessage = Controller.processMIDIMessage;
            }
        }

        // Setup all the components of the keyboard
        this.addChild(setupSine(this));
        this.addChild(setupSliders(this.tooltipSet));
        this.addChild(setupKnobs(this.tooltipSet));
        this.addChild(setupOctaveButtons(this));
        this.addChild(setupWheels(this));
        this.addChild(setupKeys(this));

        // Add the tooltips above the others
        this.addChild(this.tooltipSet);
        
        // Setup the base object
        this.pivot.x = Math.floor(anchorX * this.width);
        this.pivot.y = Math.floor(anchorY * this.height);

        // Controller now ready to be staged

        // Setup definitions
        function setupKeys(controller) {
            var keyBindings = [
                ["a", "A"], ["w", "W"], ["s", "S"], ["e", "E"], ["d", "D"], 
                ["f", "F"], ["t", "T"], ["g", "G"], ["y", "Y"], ["h", "H"], ["u", "U"], ["j", "J"], 
                ["k", "K"], ["o"], ["l"], ["p"], [";"],  
                [], [], [], [], [], [], [], []];
            var keyboard = new Keyboard(keyBindings, controller);
            keyboard.position.set(34, 54);
            
            controller.keyboard = keyboard;
            return keyboard;
        }       
        function setupSine(controller) {
            // Grab animation frames
            let frames = [], str = "";
            for(let i = 0; i < 30; i++){
                str = i;
                if(i < 10)
                    str = "0" + str;
                frames.push(controller.buttonsheet.textures[str + ".png"]);
            }
            // Make sine animation
            let sineAnimation = new PIXI.AnimatedSprite(frames);
            sineAnimation.animationSpeed = 0.3;
            // Position it correctly
            sineAnimation.x = 176;
            sineAnimation.y = 22;
            sineAnimation.play();

            sineAnimation.name = "Sine Animation";

            return sineAnimation;
        }
        function setupKnobs(tooltipSet) {
            // First, prepare the textures for them
            var textureSet = [];
            var sTex = buttonsheet.textures["straight-knob.png"];
            var dTex = buttonsheet.textures["diagonal-knob.png"];
            textureSet.push(sTex);
            textureSet.push(dTex);
            for(var rotate = 6; rotate > 0; rotate -= 2){
                // Create a texture rotated from the originals
                let t1 = new PIXI.Texture(sTex, sTex.frame, sTex.orig, undefined, rotate);
                let t2 = new PIXI.Texture(dTex, dTex.frame, dTex.orig, undefined, rotate);
                textureSet.push(t1);
                textureSet.push(t2);
            }

            // Set knob positionings
            // - 12x, - 27y
            const x = [0, 15, 30, 45, 60, 75, 5, 20, 35, 50, 65, 80]
            const y = [0, 0, 0, 0, 0, 0, 13, 13, 13, 13, 13, 13];
            const tooltips = ["A>shape", "A>attack", "A>sustain", "A>decay", "A>release", "A>gain", 
                                "B>shape", "B>attack", "B>sustain", "B>decay", "B>release", "B>gain"];
            const initialValues = [0, 1, 7, 4, 3, 7, 
                                    1, 4, 1, 5, 4, 2];
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
            let knobs = new PIXI.Container();
            knobs.name = "Knobs";
            for (let i = 0; i < 12; i++) {
                let knob = new Knob(
                    textureSet,
                    x[i] + 12, y[i] + 27,
                    tooltips[i],
                    tooltipSet.create(tooltips[i], 'left'),
                    initialValues[i],
                    types[i],
                    callbacks[i]);
                
                knobs.addChild(knob);
            }   
            
            return knobs;
        }
        function setupSliders(tooltipSet) {
            const x = [110, 118, 126, 134, 142, 150, 158, 166];
            const initialValues = [9, 1, 5, 9, 0, 4, 3, 5];
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
            let sliders = new PIXI.Container();
            sliders.name = "Sliders";
            for (let i = 0; i < x.length; i++) {
                // Make slider
                let slider = new Slider(
                    x[i],
                    initialValues[i],
                    neutralValues[i],
                    tooltips[i], // name
                    tooltipSet.create(tooltips[i], 'right'),
                    callbacks[i]
                );

                // Place red markers at neutral positions
                // base.addChild(sliders[i].marker);

                // Add to base and dictionary
                sliders.addChild(slider);
            }

            return sliders;
        }
        function setupOctaveButtons(controller){
            let octaveButtons = new PIXI.Container();
            octaveButtons.name = "Octave Buttons";

            var octaveDown = new OctaveButton(
                'down', 
                5, 95,
                controller,
                controller.tooltipSet.create("[z] octave-"));

            var octaveUp = new OctaveButton(
                'up', 
                17, 95,
                controller,
                controller.tooltipSet.create("[x] octave+"));
            
            // Cross link them
            octaveUp.other = octaveDown;
            octaveDown.other = octaveUp;

            octaveButtons.addChild(octaveUp);
            octaveButtons.addChild(octaveDown);

            return octaveButtons;
        }
        function setupWheels(controller){
            let wheels = new PIXI.Container("wheels");
            wheels.name = "Wheels";
                
            var pitchWheel = new Wheel(
                5, 55,
                "pitchwheel",
                controller.tooltipSet.create("pitch"),
                function (value) {
                    audioEngine.oscillatorA.detune = (1-value) * 200; // 200 cents max up and down
                    audioEngine.oscillatorB.detune = (1-value) * 200; 
                });
            pitchWheel.resetOnEnd = true;
                    
            var modWheel = new Wheel(
                17, 55,
                "modwheel",
                controller.tooltipSet.create("modulation"),
                function (value) {audioEngine.mod.pan(1-value)});

            wheels.addChild(modWheel);
            wheels.mod = modWheel;
            wheels.addChild(pitchWheel);
            wheels.pitch = pitchWheel;

            controller.wheels = wheels;
            return wheels;
        }
    }
    
    press(note) {
        // Add this pressed note to the list
        if((this._noteStack.length > 0 && this._noteStack.last().pitch != note.pitch) || this._noteStack.length == 0){
            this._noteStack.push(note);
        }
        
        // Play note
        audioEngine.play(note);
        // If note is outside range, don't light up key
        if (note.pitch >= noteRange[0] && note.pitch <= noteRange[1]) {
            // Find the key corresponding to the note
            let keyId = note.pitch - noteRange[0];
            // Retexture the pressed key
            this.keyboard.keyActive(keyId, true);
        }
    }
    release(note) {
        // Remove this note from the list
        {
            let p = -1;
            // Find its index
            for(let i = 0; i < this._noteStack.length; i++){
                if(this._noteStack[i].pitch == note.pitch){
                    p = i;
                    break;
                }
            }
            // Remove it
            if(p != -1){
                this._noteStack.removeFrom(p);
            }
        }
        // If the last active key is depressed, stop
        if(this._noteStack.length == 0){
            audioEngine.stop();
        }// Else play the last key that was pressed
        else{
            this.press(this._noteStack.last());
        }
    
        // If note is outside range, don't light up key
        if (note.pitch >= noteRange[0] && note.pitch <= noteRange[1]) {
            // Find the key corresponding to the note
            let keyId = note.pitch - noteRange[0];
            // Retexture the depressed key
            this.keyboard.keyActive(keyId, false);
        }
    }

    shiftStack(shiftAmount) {
        if(this._noteStack.length == 0)
            return;

        // Shift all the notes in the stack except for midi inputs
        for(var e of this._noteStack){
            if(e.midi || false)
                continue;   

            // Turn off previous note
            let keyId = e.pitch - noteRange[0];
            this.keyboard.keyActive(keyId, false);
            
            e.pitch += 12 * shiftAmount;
            keyId = e.pitch - noteRange[0];
            
            // Turn on new one
            this.keyboard.keyActive(keyId, true);
        }

        // Continue playing the note highest in the stack
        let note = this._noteStack.last();
        audioEngine.play(note);
    }

    static processMIDIMessage(message) {
        var command = message.data[0];
        var pitch = message.data[1];
        var velocity = (message.data.length > 2) ? message.data[2] : 0; 
        switch (command) {
            // Key pressed
            case 144:
                if (velocity > 0) {
                    controller.press({pitch, velocity, midi: true});
                }
                else {
                    controller.release({pitch});
                }
                break;
            // Key lifted
            case 128:
                controller.release({pitch});
                break;
            // Mod wheel
            case 176: 
                controller.wheels.mod.value = message.data[2] / 64;
                break;
            // Pitch bend
            case 224:
                controller.wheels.pitch.value = (1 - message.data[2]) / 64;
                break;
        }
    }
}

class Keyboard extends PIXI.Container {
    /**
     * 
     * @param {array} keyBindings Array of array of strings. i.e. [["a","b"], ["c"], ["f", "g"], ...]
     */
    constructor(keyBindings, controller) {
        super();
        this.controller = controller;
        // Static offset values (relative to last key, for one octave)
        var xOffset = [9, 4, 9, 4, 13, 9, 4, 9, 4, 9, 4, 13];
        var zIndexs = [0, 1, 0, 1, 0, 0, 1 ,0, 1, 0, 1, 0];
        this.keys = [];
        this.map = {};
        this.buttons = {};
        var x = 0, y = 0;
        for(let i = 0; i < 25; i++){
            let key = new Key(x, y, i, this);

            // Black keys above whites (raycast necessity)
            key.zIndex = zIndexs[i % 12];

            // The bind for this key; all buttons link to the same bind
            let bind = { pressed: false }
            // Map buttons to keys
            for(let j = 0; j < keyBindings[i].length; j++){
                this.buttons[keyBindings[i][j]] = bind;
                this.map[keyBindings[i][j]] = key;
            }

            this.keys.push(key);
            this.addChild(key);

            // Compute next position
            x += xOffset[i % 12];
        }

        // Sort children by zIndex to put black keys forwards
        this.sortChildren();

        // Keyboard input system (barebones version of keybind() in util)
        this.downHandler = event => {
            // Hack-a-tron 9000 // Stop this from accessing its usual bind
            if(event.key == ";" && event.getModifierState("CapsLock") == true){
                return;
            }

            // Button event.key was pressed
            if (event.key in this.buttons && // If button is bound to something
                !this.buttons[event.key].pressed) { // If button is up
                // Pressed button event.key
                let k = this.map[event.key].keyId;
                this.press(k);

                this.buttons[event.key].pressed = true; // Button is down
                event.preventDefault();
            }
        };

        this.upHandler = event => {
            // Hack-a-tron 9000 // Stop this from accessing its usual bind
            if(event.key == ";" && event.getModifierState("CapsLock") == true){
                return;
            }
            // Button event.key was pressed
            if (event.key in this.buttons && // If button is bound to something
                this.buttons[event.key].pressed) { // If button is down
                // Released button event.key
                let k = this.map[event.key].keyId;
                this.release(k);

                this.buttons[event.key].pressed = false; // Buttons is up
                event.preventDefault();
            }
        };

        // Bind event listeners
        const downListener = this.downHandler.bind(this);
        const upListener = this.upHandler.bind(this);

        window.addEventListener(
            "keydown", downListener, false
        );
        window.addEventListener(
            "keyup", upListener, false
        );

        // Deal with shift and caps lock, these nasty, nasty boyz 
        this.caps = keybind("CapsLock");
        this.caps.isOn = false; // Assume this, if it turns out to be a problem... meh
        this.caps.press = () => {
            this.caps.isOn = !this.caps.isOn;
            let shift = (this.caps.isOn) ? +1 : -1;
            if(!this.shift.isDown) controller.shiftStack(shift);
        }

        this.shift = keybind("Shift");
        this.shift.press = () => { if (!this.caps.isOn) controller.shiftStack(+1); }
        this.shift.release = () => { if (!this.caps.isOn) controller.shiftStack(-1); }

        // Mouse/touch interaction system
        this.interactiveChildren = true;
        this.dragging = false;
    }

    release(keyId){
        let pitch = keyId + noteRange[0];
        if(this.shift.isDown || this.caps.isOn)
            pitch += 12;
            
        this.controller.release({pitch});
    }

    press(keyId, y){
        var key = this.keys[keyId];
        y = y || key.height / 2;
        let pitch = key.keyId + noteRange[0];
        if(this.shift.isDown || this.caps.isOn)
            pitch += 12;

        let velocity = Math.floor(remap(y, [0, key.height], [0, 127]));
        this.controller.press({pitch, velocity});
    }

    /** Swap key sprites for on/off */
    keyActive (keyId, active) {
        let keySprite = this.keys[keyId];
        let str = (active) ? "-on.png" : ".png";
        if (keySprite != null)
            keySprite.texture = controller.spritesheet.textures[KEY_TYPES[keyId] + str]; // on texture
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
        if(tooltip){
            this.tooltip = tooltip;
            this.on('mouseover', TooltipSet.showTooltip)
                .on('mouseout', TooltipSet.hideTooltip)
        }
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
class Key extends Component {
    constructor(x, y, keyId, tooltip){
        var name = "key" + keyId;
        var tex = PIXI.Loader.shared.resources.controller.spritesheet.
            textures[KEY_TYPES[keyId] + ".png"];
        super(tex, x, y, 0, 0, name, 0, 0, undefined, () => {});

        this.keyId = keyId;

        this.interactive = true;
        this.on('mousedown', onStart)
            .on('touchstart', onStart)
            .on('mouseup', onEnd)
            .on('mouseupoutside', onEnd)
            .on('touchend', onEnd)
            .on('touchendoutside', onEnd)
            .on('touchmove', onMove)
            .on('mousemove', onMove);

        function onStart(event){
            this.eventData = event.data;
            this.eventData.dragging = true;
            
            let key = getKey(event.data.global, this.parent);
            this.eventData.currentKey = key;
            this.parent.press(key.keyId, this.eventData.getLocalPosition(key).y);
        }
        function onEnd(event){
            // If the drag has not already ended
            if(this.eventData != null && this.eventData.dragging){
                this.parent.release(this.eventData.currentKey.keyId);

                this.eventData = null;
            }
        }
        function onMove(event){
            if (!this.eventData || this.eventData == null) 
                return;
            // Raycast for new key
            let newKey = getKey(this.eventData.global, this.parent);

            // If we drag out of the keyboard, stop
            if(newKey == null) {
                this.parent.release(this.eventData.currentKey.keyId);

                this.eventData.dragging = false;
            }
            // If we moved to a new key, 
            // release the old one and press this one
            else if(newKey.keyId != this.eventData.currentKey.keyId){
                this.parent.press(newKey.keyId, this.eventData.getLocalPosition(newKey).y);
                this.parent.release(this.eventData.currentKey.keyId);
                this.eventData.currentKey = newKey;
            }
        }
        function getKey(position, root){
            return renderer.plugins.interaction.hitTest(position, root);
        }
    }
}
class OctaveButton extends Component {
    constructor(type, x, y, controller, tooltip){
        var textures = PIXI.Loader.shared.resources.controller.spritesheet.textures;
        var texture = textures["button-" + type + ".png"];
        super(texture, x, y, 0, 0, "octave"+type, 0, 0, tooltip, () => {})

        this.type = type;
        this.controller = controller;
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
        this.keyButtonL = keybind(key);
        this.keyButtonL.press = () => {
            this.callbackFunc();
        };
        this.keyButtonU = keybind(key.toUpperCase());
        this.keyButtonU.press = () => {
            this.callbackFunc();
        };

        function up () {
            // Max 3 octaves up and down
            if(currentOctave == 7)
                return;
            
            currentOctave++;

            // Move note range up one octave
            noteRange[0] += 12;
            noteRange[1] += 12;
            
            this.controller.shiftStack(+1);

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

            this.controller.shiftStack(-1);

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
            this.texture = this.textures[BUTTON_TYPE[t + shift]];
    }
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
        let y = SLIDER_RANGE[1] - initialValue * 2; // y in 21,41
        super(PIXI.Loader.shared.resources.controller.spritesheet.textures["slider.png"],
        x, y, 3, 3, name, 10, initialValue, tooltip, callbackFunc);
        /* 
        this.marker = new PIXI.Sprite(PIXI.Loader.shared.resources.controller.spritesheet.textures["red-mark.png"]);
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
                if (newPosition.y > SLIDER_RANGE[0] && newPosition.y <= SLIDER_RANGE[1]){
                    let y = round(newPosition.y, 2) + 1;
                    // Also update value and master gain
                    this.value = (SLIDER_RANGE[1] - y) / 2;
                    this.position.y = y;
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
            this.callbackFunc(value);
        }
    }

    get value() {
        return this._value;
    }

}
class Knob extends Component {
    constructor(textures, x, y, name, tooltip, initialValue, type, callbackFunc){
        if(type != 4 && type != 8)
            return undefined;
        
        let tex;
        if(type == 4)
            tex = textures[2 * initialValue];
        else 
            tex = textures[initialValue];

        // Find corresponding initial texture
        super(tex, x, y, 4, 4, name, type - 1, initialValue, tooltip, callbackFunc);

        this._type = type;
        this.textures = textures;
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
        this._value = value;
        this.texture = Knob.matchTexture(value, this._type, this.textures);
        this.callbackFunc(this._value);
    }

    get value(){
        return this._value;
    }


    static matchTexture(value, type, textures){
        // I know, but it's complicated
        if(textures == undefined)
            return;

        // Shift value for 
        if(type == 4)
            value = value * 2;

        return textures[value];
    }
}
class Wheel extends Component {
    constructor(x, y, name, tooltip, callbackFunc){
        var texture = PIXI.Loader.shared.resources.controller.spritesheet.textures["touch-wheel.png"];
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
        this.resetOnEnd = false;

        function onDragStart(event) {
            this.eventData = event.data;
            this.dragging = true;
            this.value = this.valueFrom(this.eventData.getLocalPosition(this));
            
        }
        function onDragEnd(event) {
            this.eventData = undefined;
            this.dragging = false;
            if(this.resetOnEnd)
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