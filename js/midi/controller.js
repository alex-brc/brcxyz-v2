class Controller extends PIXI.Sprite {
    #noteStack;
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

        this.components = {
            dictionary: {}
        }

        // Setup all the components of the keyboard
        this.components.sine = setupSine(this);
        this.components.sliders = setupSliders(this);
        this.components.knobs = setupKnobs(this);
        this.components.octaveButtons = setupOctaveButtons(this);
        this.components.keys = setupKeys(this);

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
            const keysTex = [
                "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
                "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey",
                "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
                "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey-logo", "lastkey"
            ];
            // Draw black keys last, for raycast priority
            const drawingOrder = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24,
                1, 3, 6, 8, 10, 13, 15, 18, 20, 22];
            let keys = [];
            let mouseDown = false;
            drawingOrder.forEach((i) => {
                // Create sprite
                keys[i] = new PIXI.Sprite(spritesheet.textures[keysTex[i] + ".png"]);
                // Give it an ID
                keys[i].keyId = i;
                // Position them
                keys[i].x = -base.width / 2 + x[i];
                keys[i].y = -base.height / 2 + y;
                // Add event listeners
                keys[i].buttonMode = true;
                keys[i].interactive = true;
                keys[i]
                    .on('mousedown', onDown)
                    .on('touchstart', onDown)
                    .on('mouseup', onUp)
                    .on('mouseupoutside', onUp)
                    .on('touchend', onUp)
                    .on('touchendoutside', onUp)
                    .on('mouseover', onEnter)
                    .on('mouseout', onExit);
                // Add to base
                base.addChild(keys[i]);
            });
            
            return keys;
            
            function onDown(event) {
                mouseDown = true;
                // Get local mouse y to calculate velocity
                let y = this.toLocal(event.data.global).y;
                let velocity = remap(y, [0, this.height], [0, 127])
                velocity = Math.floor(velocity);
                this.parent.noteOn(this.keyId + noteRange[0], velocity);
            }
            function onUp(event) {
                mouseDown = false;
                this.parent.noteOff(this.keyId + noteRange[0]);
            }
            function onEnter(event) {
                if (mouseDown){
                    // Get local mouse y to calculate velocity
                    let y = this.toLocal(event.data.global).y;
                    let velocity = remap(y, [0, this.height], [0, 127])
                    velocity = Math.floor(velocity);
                    this.parent.noteOn(this.keyId + noteRange[0], velocity);
                }
            }
            function onExit(event) {
                if (mouseDown){
                    this.parent.noteOff(this.keyId + noteRange[0]);
                }
            }
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
            const initialValues = [2, 2, 5, 7, 4, 5, 
                                    1, 1, 6, 3, 2, 3];
            const types = [4, 8, 8, 8, 8, 8, 
                            4, 8, 8, 8, 8, 8];
            let callbacks = [
                function (v) {audioEngine.oscillatorA.shape = v},
                function (v) {},
                function (v) {},
                function (v) {},
                function (v) {},
                function (v) {audioEngine.oscillatorA.gain = remap(v, [0,7], [0, 0.5])},
                function (v) {audioEngine.oscillatorB.shape = v},
                function (v) {},
                function (v) {},
                function (v) {},
                function (v) {},
                function (v) {audioEngine.oscillatorB.gain = remap(v, [0,7], [0, 0.5])}];
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
            const initialValues = [9, 1, 5, 8, 0, 0, 5, 10];
            const tooltips = [ "A>LFO freq.", "A>LFO gain", "A>filter", "B>filter",
                             "", "", "", "B>shift"];
            const neutralValues = [0, 0, 7, 7, 5, 5, 5, 5];
            let callbacks = [
                function (v) {audioEngine.lfo.frequency = v},
                function (v) {audioEngine.lfo.gain = v / 10},
                function (v) {audioEngine.filterA.frequency = v},
                function (v) {audioEngine.filterB.frequency = v},
                function (v) {},
                function (v) {},
                function (v) {},
                function (v) {audioEngine.shift('B', v - 5);},
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
            var octaveUp = new PIXI.Sprite(buttonsheet.textures["button-up.png"]);
            var octaveDown = new PIXI.Sprite(buttonsheet.textures["button-down.png"]);
            
            // Cross link them
            octaveUp.other = octaveDown;
            octaveDown.other = octaveUp;

            // Different textures for different octaves
            octaveUp.updateTexture = function () {
                switch (currentOctave) {
                    case 5:
                        this.texture = buttonsheet.textures["button-up-green.png"];
                        break;
                    case 6:
                        this.texture = buttonsheet.textures["button-up-yellow.png"];
                        break;
                    case 7:
                        this.texture = buttonsheet.textures["button-up-blue.png"];
                        break;
                    default:
                        this.texture = buttonsheet.textures["button-up.png"];
                        break;
                }
            }
            octaveDown.updateTexture = function () {
                switch (currentOctave) {
                    case 3:
                        this.texture = buttonsheet.textures["button-down-green.png"];
                        break;
                    case 2:
                        this.texture = buttonsheet.textures["button-down-yellow.png"];
                        break;
                    case 1:
                        this.texture = buttonsheet.textures["button-down-blue.png"];
                        break;
                    default:
                        this.texture = buttonsheet.textures["button-down.png"];
                        break;
                }
            }

            // Position
            octaveUp.x = -base.width / 2 + 5;
            octaveUp.y = -base.height / 2 + 95;
            octaveDown.x = -base.width / 2 + 17;
            octaveDown.y = -base.height / 2 + 95;

            // Bind callbacks
            octaveUp.interactive = true;
            octaveUp.buttonMode = true;
            octaveUp
                .on('mousedown', up)
                .on('touchstart', up);
            octaveDown.interactive = true;
            octaveDown.buttonMode = true;
            octaveDown
                .on('mousedown', down)
                .on('touchstart', down);


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
                console.log(currentOctave);
                // Move note range up one octave
                noteRange[0] -= 12;
                noteRange[1] -= 12;

                // Alter sprite
                this.updateTexture();
                this.other.updateTexture();
            }
        }
    }
    
    noteOn(note, velocity) {
        // Add this pressed note to the list
        if((this.#noteStack.length > 0 && this.#noteStack.last()[0] != note) || this.#noteStack.length == 0){
            this.#noteStack.push([note, velocity]);
        }
        
        // Compute gain volume
        let volume = remap(velocity, [0, 127], [0, 1]);
        // Play note
        audioEngine.start(note, volume);
        // If note is outside range, don't light up key
        if (note >= noteRange[0] && note <= noteRange[1]) {
            // Find the key corresponding to the note
            let key = note - noteRange[0];
            // Retexture the pressed key
            this.components.keys[key].texture = this.spritesheet.textures[Key.keyTypes[key] + "-on.png"]; // on texture
        }
    }
    noteOff(note) {
        // Remove this note from the list
        {
            let p = -1;
            // Find its index
            for(let i = 0; i < this.#noteStack.length; i++){
                if(this.#noteStack[i][0] == note){
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
            this.noteOn(this.#noteStack.last()[0], this.#noteStack.last()[1]);
        }
    
        // If note is outside range, don't light up key
        if (note >= noteRange[0] && note <= noteRange[1]) {
            // Find the key corresponding to the note
            let key = note - noteRange[0];
            // Retexture the depressed key
            this.components.keys[key].texture = this.spritesheet.textures[Key.keyTypes[key] + ".png"]; // off texture
        }
    }
    processMIDIMessage(message) {
        var command = message.data[0];
        var note = message.data[1];
        var velocity = (message.data.length > 2) ? message.data[2] : 0; 
        switch (command) {
            // Key pressed
            case 144:
                if (velocity > 0) {
                    this.noteOn(note, velocity);
                }
                else {
                    this.noteOff(note);
                }
                break;
            // Key lifted
            case 128:
                this.noteOff(note);
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
        this.callbackFunc();
    }
    
    get value(){
        return this._value;
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
        this.on('mousedown', onDown)
            .on('touchstart', onDown);
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
        if(value >= 0 && value <= this.maxValue){
            this._value = value;
            this.texture = Knob.matchTexture(value, this._type);
            this.callbackFunc(value);
        }
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
    constructor(textureNumber, x, y, name, tooltip, callbackFunc){
        var tex = PIXI.Loader.shared.resources.controller.spritesheet.
            textures[Key.keyTypes[textureNumber] + ".png"];
        super(tex, x, y, 0, 0, name, 1, 0, tooltip, callbackFunc);
    }

    static keyTypes = [
        "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
        "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey",
        "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
        "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey-logo", "lastkey"
    ];
}