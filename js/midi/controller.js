var noteRange = [48, 72];
var currentOctave = 4;

class Controller extends PIXI.Sprite {
    _noteStack;
    constructor(anchorX, anchorY) {
        // Alias resources
        var spritesheet = PIXI.Loader.shared.resources.controller.spritesheet;
        var buttonsheet = PIXI.Loader.shared.resources.common.spritesheet;

        // Make this
        super(spritesheet.textures["base.png"]);
        this.spritesheet = spritesheet;
        this.buttonsheet = buttonsheet;
        
        this._noteStack = [];
        this.tooltipSet = new TooltipSet();

        // Setup all the components of the keyboard
        this.addChild(setupSine());
        this.addChild(setupSliders(this.tooltipSet));
        this.addChild(setupKnobs(this.tooltipSet));
        this.addChild(setupOctaveButtons(this.tooltipSet, this));
        this.addChild(setupKeys(this.tooltipSet, this));
        this.addChild(setupWheels(this.tooltipSet));

        // Add the tooltips above the others
        this.addChild(this.tooltipSet);
        
        // Setup the base object
        this.pivot.x = anchorX * this.width;
        this.pivot.y = anchorY * this.height;

        // Controller now ready to be staged

        // Setup definitions
        function setupKeys(tooltipSet, controller) {
            // Locations of keys on base sprite
            // --- 34
            const x = [34, 43, 47, 56, 60, 73, 82, 86, 95, 99, 108, 112,
                125, 134, 138, 147, 151, 164, 173, 177, 186, 190, 199, 203, 216];
            const y = 54;
            // Draw black keys last, for raycast priority
            const drawingOrder = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24,
                1, 3, 6, 8, 10, 13, 15, 18, 20, 22];
            let keyboard = new PIXI.Container();
            keyboard.name = "Keyboard";
            for(var i of drawingOrder) {
                var tooltip = KEY_BINDINGS[i];
                if(SECONDARY_BINDS[i] != "")
                    tooltip += "/" + SECONDARY_BINDS[i];

                let key = new Key(
                    x[i], y,
                    i, controller,
                    tooltipSet.create("[" + tooltip + "]", 'left'));
                
                keyboard.addChild(key);
            }

            // Implement one interaction event for the entire keyboard
            keyboard.interactive = true;
            keyboard.interactiveChildren = true;
            keyboard.buttonMode = true;
            keyboard.dragging = false;
            keyboard
                .on('mousedown', onStart)
                .on('touchstart', onStart)
                .on('mouseup', onEnd)
                .on('mouseupoutside', onEnd)
                .on('touchend', onEnd)
                .on('touchendoutside', onEnd)
                .on('touchmove', onMove)
                .on('mousemove', onMove);
            
            return keyboard;

            function onStart(event){
                this.event = event;
                this.dragging = true;
                
                let key = getKey(event.data.global, this);
                this.event.currentKey = key;
                key.press(event.data.getLocalPosition(key).y);
            }

            function onEnd(event){
                // If the drag has not already ended
                if(this.dragging){
                    this.event.currentKey.release();

                    this.event = null;
                    this.dragging = false;
                }
            }

            function onMove(event){
                if (!this.dragging) 
                    return;
                // Raycast for new key
                let newKey = getKey(event.data.global, this);

                // If we drag out of the keyboard, stop
                if(newKey == null) {
                    this.event.currentKey.release();
    
                    this.event = null;
                    this.dragging = false;
                }
                // If we moved to a new key, 
                // release the old one and press this one
                else if(newKey.keyId != this.event.currentKey.keyId){
                    newKey.press(event.data.getLocalPosition(newKey).y);
                    this.event.currentKey.release();
                    this.event.currentKey = newKey;
                }
            }

            function getKey(position, root){
                return renderer.plugins.interaction.hitTest(position, root);
            }
        }       
        function setupSine() {
            // Make sine animation
            let sineAnimation = new PIXI.AnimatedSprite(spritesheet.animations["sine"]);
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
            const x = [12, 27, 42, 57, 72, 87, 17, 32, 47, 62, 77, 92];
            const y = [27, 27, 27, 27, 27, 27, 40, 40, 40, 40, 40, 40];
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
                    x[i], y[i],
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
        function setupOctaveButtons(tooltipSet, controller){
            let octaveButtons = new PIXI.Container();
            octaveButtons.name = "Octave Buttons";

            var octaveDown = new OctaveButton(
                'down', 
                5, 95,
                controller,
                tooltipSet.create("[z] octave-"));

            var octaveUp = new OctaveButton(
                'up', 
                17, 95,
                controller,
                tooltipSet.create("[x] octave+"));
            
            // Cross link them
            octaveUp.other = octaveDown;
            octaveDown.other = octaveUp;

            octaveButtons.addChild(octaveUp);
            octaveButtons.addChild(octaveDown);

            return octaveButtons;

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
        function setupWheels(tooltipSet){
            let wheels = new PIXI.Container("wheels");
            wheels.name = "Wheels";

            var modWheel = new Wheel(
                5, 55,
                "modwheel",
                tooltipSet.create("modulation"),
                function (value) {audioEngine.mod.pan(1-value)});
                
            var pitchWheel = new Wheel(
                17, 55,
                "pitchwheel",
                tooltipSet.create("pitch"),
                function (value) {
                    audioEngine.oscillatorA.detune = (1-value) * 200; 
                    audioEngine.oscillatorB.detune = (1-value) * 200; });

            wheels.addChild(modWheel);
            wheels.addChild(pitchWheel);

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
            this.getChildByName('Keyboard')
            .getChildByName('key' + keyId)
            .texture = this.spritesheet.textures[KEY_TYPES[keyId] + "-on.png"]; // on texture
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
                this._noteStack.splice(p, 1);
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
            this.getChildByName('Keyboard')
            .getChildByName('key' + keyId)
            .texture = this.spritesheet.textures[KEY_TYPES[keyId] + ".png"]; // off texture
        }
    }
    shiftStack(shiftAmount) {
        if(this._noteStack.length == 0)
            return true;

        // Check this can be done first
        for(var e of this._noteStack){
            let t = e.pitch + 12 * shiftAmount;
            if(t < 0 || t > 127)
                return false;
        } 

        // Shift all the notes in the stack
        for(var e of this._noteStack){
            e.pitch += 12 * shiftAmount;
        }

        // Continue playing the note highest in the stack
        let note = this._noteStack.last();
        audioEngine.play(note);
        return true;
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
        }
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
    constructor(type, x, y, controller, tooltip){
        var textures = PIXI.Loader.shared.resources.common.spritesheet.textures;
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
            
            // Stack might contain notes too close to octave limits
            let ok = this.controller.shiftStack(+1);
            if(!ok)
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

            // Stack might contain notes too close to octave limits
            let ok = this.controller.shiftStack(-1);
            if(!ok)
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
const SLIDER_RANGE = [21, 41];
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
        super(PIXI.Loader.shared.resources.common.spritesheet.textures["slider.png"],
        x, y, 3, 3, name, 10, initialValue, tooltip, callbackFunc);
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
class Key extends Component {
    constructor(x, y, keyId, controller, tooltip){
        var name = "key" + keyId;
        var tex = PIXI.Loader.shared.resources.controller.spritesheet.
            textures[KEY_TYPES[keyId] + ".png"];
        super(tex, x, y, 0, 0, name, 0, 0, tooltip, () => {});

        this.keyId = keyId;
        this.controller = controller;

        // Bind keyboard
        this.keyButton = keyboard(KEY_BINDINGS[keyId]);
        this.keyButton.press = () =>  { this.press(); };
        this.keyButton.release = () => { this.release(); };

        if(SECONDARY_BINDS[keyId] != ""){
            this.keyButton2 = keyboard(SECONDARY_BINDS[keyId]);
            this.keyButton2.press = () =>  { this.press(); };
            this.keyButton2.release = () => { this.release(); };
        }

        this.interactive = true;
    }

    release(){
        let pitch = this.keyId + noteRange[0];
        this.controller.release({pitch});
    }

    press(y){
        y = y || this.height / 2;
        let pitch = this.keyId + noteRange[0];
        let velocity = Math.floor(remap(y, [0, this.height], [0, 127]));
        this.controller.press({pitch, velocity});
    }
    
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