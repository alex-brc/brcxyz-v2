class Button extends PIXI.Container {
    constructor(text, size, anchor, tooltip, upTexture, downTexture){
        super();
        anchor = anchor || {x: 0, y: 0};
        text = text || "";

        // Create text object
        var textBmp = new PIXI.BitmapText(text, {
            font: '8px pixelmix',
            align: 'center'
        });
        // Position it
        textBmp.position = {x: 4, y: 2};
        this.text = text;
        this.foreground = textBmp;
        
        // Create button background
        var nsp = upTexture || new PIXI.NineSlicePlane(
            PIXI.Loader.shared.resources.common.spritesheet.textures["button.png"],
            3, 3, 3, 3);
        // And set it up
        size = size || {x: textBmp.width + 7, y: textBmp.height + 7};
        nsp.width = size.x;
        nsp.height = size.y;
        this.background = nsp;

        // Create mousedown background
        var clicked = downTexture || new PIXI.NineSlicePlane(
            PIXI.Loader.shared.resources.common.spritesheet.textures["button-clicked.png"],
            3, 3, 3, 3);
        clicked.width = size.x;
        clicked.height = size.y;
        clicked.visible = false;
        this.clicked = clicked;

        // Assemble
        this.addChild(nsp);
        this.addChild(clicked);
        this.addChild(textBmp);

        // Set pivot 
        this.pivot.x = nsp.width * anchor.x;
        this.pivot.y = nsp.height * anchor.y;

        // Callbacks
        this.onClick = () => {};

        this.interactive = true;
        this.buttonMode = true;
        this.on('mousedown', onDown)
            .on('touchstart', onDown)
            .on('mouseup', onUp)
            .on('mouseupoutside', cancel)
            .on('touchend', onUp)
            .on('touchendoutside', cancel);

        this.tooltip = tooltip;
        this.on('mouseover', TooltipSet.showTooltip)
            .on('mouseout', TooltipSet.hideTooltip);

        this.isToggle = false;
        this.onOff = false;

        function onDown(event) {
            // Set clicked sprite
            this.background.visible = false;
            this.clicked.visible = true;
            this.foreground.x -= 1;
            this.foreground.y += 1;
        }

        function onUp(event) {
            // Set normal sprite
            this.background.visible = false;
            this.clicked.visible = true;
            this.foreground.x += 1;
            this.foreground.y -= 1;

            // Call the set function
            this.onClick();

            // If this is a toggle, call toggle function
            if(this.isToggle){
                this.onOff = !this.onOff;
                
                // Set tint to show toggle
                if(this.onOff)
                    this.foreground.tint = 0xA0F072; // Green
                else
                    this.foreground.tint = 0xFFFFFF; // White

                // Callback
                this.onToggle(this.onOff);
            }
        }

        function cancel(){
            console.log("here");
            // Set normal sprite
            this.background.visible = false;
            this.clicked.visible = true;
            this.foreground.x += 1;
            this.foreground.y -= 1;
        }
    }
}

class TooltipSet extends PIXI.Container {
    constructor(){
        super();
    }

    create(text, align, anchor){
        align = align || 'left';

        if(text == "")
            text = "placeholder";
        if(anchor == undefined){
            anchor = {x: 0, y: 1};
            if(align == 'right'){
                anchor.x = 1;
            }
        } 

        // Create the container
        var tooltip = new PIXI.Container();
        tooltip.text = text;
        // Create text object
        var text = new PIXI.BitmapText(text, {
            font: '8px pixelmix',
            align: align,
        });
        
        // Create background object
        let bg = new PIXI.NineSlicePlane(
            PIXI.Loader.shared.resources.common.spritesheet.textures["tooltip.png"],
            4, 4, 4, 4);
        bg.height = 13;
        bg.width = text.width + 8;

        // Position text
        text.x += 4;
        text.y += 2;
        
        // Assemble and position
        tooltip.set = this;
        tooltip.addChild(bg);
        tooltip.addChild(text);
        tooltip.pivot.x = tooltip.width * anchor.x;
        tooltip.pivot.y = tooltip.height * anchor.y;
        tooltip.visible = false;
        
        // Cache it
        tooltip.cacheAsBitmap = true;

        // Add the new tooltip to this collection
        this.addChild(tooltip);

        return tooltip;
    }

    static showTooltip(event) {
        this.tooltip.visible = true;
        this.tooltip.position = this.position;
    }
    static hideTooltip(event) {
        this.tooltip.visible = false;
    }
}
// By kittyattack on github, at
// https://github.com/kittykatattack/learningPixi#keyboard
function keybind(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) {
                key.press();
            }
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) key.release();
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};

function round(number, step) {
    return Math.floor(number / step ) * step;
}

function remap(number, from, to){
    return to[0] + (number-from[0])*(to[1]-to[0])/(from[1]-from[0]); 
}

function decNote(note){
    let octave = note / 12;
    note %= 12;
    return {
        key: note,
        octave
    };
}

const KEY_TYPES = [
    "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey-logo", "lastkey"];
const KNOB_TEXTURES = ["bottom.png", "bottom-left.png", "left.png", 
"top-left.png", "top.png", "top-right.png", "right.png", "bottom-right.png"];
const BUTTON_TYPE = [
    "button-up.png","button-up-green.png","button-up-yellow.png","button-up-blue.png", 
    "button-down.png","button-down-green.png","button-down-yellow.png","button-down-blue.png"];
const SLIDER_RANGE = [21, 41];
const NUMBER_TO_NAME = 
    {0:  'C',  1:  'C#', 2:  'D',
    3:  'Eb', 4:  'E',  5:  'F',
    6:  'F#', 7:  'G',  8:  'Ab',
    9:  'A',  10: 'Bb', 11: 'B' }

const NAME_TO_NUMBER = 
    {'B#': 0, 'C':  0, 
    'C#': 1, 'Db': 1, 
    'D':  2,
    'D#': 3, 'Eb': 3, 
    'E':  4, 'Fb': 4, 
    'E#': 5, 'F':  5, 
    'F#': 6, 'Gb': 6, 
    'G':  7,  
    'G#': 8, 'Ab': 8, 
    'A':  9, 
    'A#': 10,'Bb': 10,
    'B':  11,'Cb': 11 }


function frequency(note){
    return NOTE_TO_FREQ[note];
}
// Index = note number. All midi notes from 0 - 127
const NOTE_TO_FREQ = new Float32Array([
    8.1757989156,
    8.6619572180,
    9.1770239974,
    9.7227182413,
    10.3008611535,
    10.9133822323,
    11.5623257097,
    12.2498573744,
    12.9782717994,
    13.7500000000,
    14.5676175474,
    15.4338531643,
    16.3515978313,
    17.3239144361,
    18.3540479948,
    19.4454364826,
    20.6017223071,
    21.8267644646,
    23.1246514195,
    24.4997147489,
    25.9565435987,
    27.5000000000,
    29.1352350949,
    30.8677063285,
    32.7031956626,
    34.6478288721,
    36.7080959897,
    38.8908729653,
    41.2034446141,
    43.6535289291,
    46.2493028390,
    48.9994294977,
    51.9130871975,
    55.0000000000,
    58.2704701898,
    61.7354126570,
    65.4063913251,
    69.2956577442,
    73.4161919794,
    77.7817459305,
    82.4068892282,
    87.3070578583,
    92.4986056779,
    97.9988589954,
    103.8261743950,
    110.0000000000,
    116.5409403795,
    123.4708253140,
    130.8127826503,
    138.5913154884,
    146.8323839587,
    155.5634918610,
    164.8137784564,
    174.6141157165,
    184.9972113558,
    195.9977179909,
    207.6523487900,
    220.0000000000,
    233.0818807590,
    246.9416506281,
    261.6255653006,
    277.1826309769,
    293.6647679174,
    311.1269837221,
    329.6275569129,
    349.2282314330,
    369.9944227116,
    391.9954359817,
    415.3046975799,
    440.0000000000,
    466.1637615181,
    493.8833012561,
    523.2511306012,
    554.3652619537,
    587.3295358348,
    622.2539674442,
    659.2551138257,
    698.4564628660,
    739.9888454233,
    783.9908719635,
    830.6093951599,
    880.0000000000,
    932.3275230362,
    987.7666025122,
    1046.5022612024,
    1108.7305239075,
    1174.6590716696,
    1244.5079348883,
    1318.5102276515,
    1396.9129257320,
    1479.9776908465,
    1567.9817439270,
    1661.2187903198,
    1760.0000000000,
    1864.6550460724,
    1975.5332050245,
    2093.0045224048,
    2217.4610478150,
    2349.3181433393,
    2489.0158697766,
    2637.0204553030,
    2793.8258514640,
    2959.9553816931,
    3135.9634878540,
    3322.4375806396,
    3520.0000000000,
    3729.3100921447,
    3951.0664100490,
    4186.0090448096,
    4434.9220956300,
    4698.6362866785,
    4978.0317395533,
    5274.0409106059,
    5587.6517029281,
    5919.9107633862,
    6271.9269757080,
    6644.8751612791,
    7040.0000000000,
    7458.6201842894,
    7902.1328200980,
    8372.0180896192,
    8869.8441912599,
    9397.2725733570,
    9956.0634791066,
    10548.081821211,
    11175.303405856,
    11839.821526772,
    12543.853951416]);

