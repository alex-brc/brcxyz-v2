// util.js ////////////////////////////
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
                key.press(event);
            }
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) 
                key.release(event);
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
if(!Array.prototype.removeFrom){
    Array.prototype.removeFrom = function(p){
        return this.splice(p, 1);
    };
};

function round(number, step) {
    return Math.floor(number / step ) * step;
}

function remap(number, from, to){
    return to[0] + (number-from[0])*(to[1]-to[0])/(from[1]-from[0]); 
}

// Detect mobile
function isMobile() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
    };
    

const KEY_TYPES = [
    "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey-logo", "lastkey"];
const BUTTON_TYPE = [
    "button-up.png","button-up-green.png","button-up-yellow.png","button-up-blue.png", 
    "button-down.png","button-down-green.png","button-down-yellow.png","button-down-blue.png"];
const SLIDER_RANGE = [21, 41];
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
///////////////////////////////////////
// ui.js //////////////////////////////

class brcWindow extends PIXI.NineSlicePlane{
    constructor(size){
        super(PIXI.Loader.shared.resources.sprites.spritesheet.textures["window.png"],
        7, 7, 7, 7);

        size = size || {x: 17, y: 22};
        this.width = size.x;
        this.height = size.y;

        this.pivot.x = this.width * 0.5;
        this.pivot.y = this.height * 0.5;

        // Put an X button in the corner
        var dummyTex = new PIXI.NineSlicePlane(PIXI.Loader.shared.resources.sprites.textures["dummy-texture.png"], 0, 0, 0, 0);
        this.xButton = new brcButton("x", undefined, {x: 1, y: 0}, undefined, dummyTex, dummyTex);
        this.xButton.position.set(size.x - 2, 0);
        this.xButton.onClick = () => { this.visible = false; }
        this.addChild(this.xButton);

        // Block raycasts
        this.interactive = true;
    }

    // Awkward name cause it hid something from PIXI.Container
    get dimensions() { return {x: this.background.width, y: this.background.height }}
    set dimensions(value){
        this.background.width = value.x;
        this.background.height = value.y;
    }
}

class brcButton extends PIXI.Container {
    constructor(text, size, anchor, tooltip, upTexture, downTexture){
        super();
        anchor = anchor || {x: 0, y: 0};
        text = text || "";

        // Create text object
        var textBmp = new PIXI.BitmapText(text, {
            font: '8px pixelmix',
            align: 'center'
        });
        this.text = text;
        this.foreground = textBmp;
        
        // Create button background
        var nsp = upTexture || new PIXI.NineSlicePlane(
            PIXI.Loader.shared.resources.sprites.spritesheet.textures["button.png"],
            3, 3, 3, 3);
        // And set it up
        size = size || {x: textBmp.width + 7, y: textBmp.height + 7};
        nsp.width = size.x;
        nsp.height = size.y;
        this.foreground.pivot.set(textBmp.width / 2, textBmp.height / 2);
        this.foreground.position.set(nsp.width / 2, nsp.height / 2 - 2);
        this.background = nsp;

        // Create mousedown background
        var clicked = downTexture || new PIXI.NineSlicePlane(
            PIXI.Loader.shared.resources.sprites.spritesheet.textures["button-clicked.png"],
            3, 3, 3, 3);
        clicked.width = size.x;
        clicked.height = size.y;
        clicked.visible = false;
        this.clicked = clicked;

        // Assemble
        this.addChild(this.background);
        this.addChild(this.clicked);
        this.addChild(this.foreground);

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

        if(tooltip != undefined){
            this.tooltip = tooltip;
            this.on('mouseover', TooltipSet.showTooltip)
                .on('mouseout', TooltipSet.hideTooltip);
        }

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
            this.background.visible = true;
            this.clicked.visible = false;
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
            // Set normal sprite
            this.background.visible = true;
            this.clicked.visible = false;
            this.foreground.x += 1;
            this.foreground.y -= 1;
        }
    }

    set face(sprite){
        // Remove former foreground
        this.removeChild(this.foreground);
        this.addChild(sprite);
        this.foreground = sprite;
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
            PIXI.Loader.shared.resources.sprites.spritesheet.textures["tooltip.png"],
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
        tooltip.primaryAnchor = anchor;
        tooltip.pivot.x = tooltip.width * anchor.x;
        tooltip.pivot.y = tooltip.height * anchor.y;
        tooltip.visible = false;
        
        // Cache it
        tooltip.cacheAsBitmap = true;

        // Add the new tooltip to this collection
        this.addChild(tooltip);

        return tooltip;
    }

    static showTooltipOnHover(event) {
        this.tooltip.visible = true;
        this.tooltip.position = this.position;
    }
    static showTooltipOnTap(event){
        if(!this.tooltip.parent.visible)
            return;
        // Hide previously shown tooltip
        if(this.tooltip.set.previous)
            this.tooltip.set.previous.visible = false;
        // Position this in top left corner
        this.tooltip.pivot.x = 0;
        this.tooltip.pivot.y = 0;
        this.tooltip.position = this.tooltip.parent.toLocal({x: 0, y: 0});
        // Show it
        this.tooltip.visible = true;
        this.tooltip.set.previous = this.tooltip;
        // Hide it after a few seconds
        setTimeout(() => {this.tooltip.visible = false}, 2000);
    }
    static hideTooltip(event) {
        this.tooltip.visible = false;
    }
}

function createOverlay(){
    var root = new PIXI.Container();
    root.buttons = new PIXI.Container();
    root.buttons.name = "Buttons";
    var transparent = new PIXI.NineSlicePlane(PIXI.Loader.shared.resources.sprites.textures["dummy-texture.png"], 0, 0, 0, 0);

    // Create tooltips for buttons
    root.tooltipSet = new TooltipSet();
    root.addChild(root.tooltipSet);
    root.tooltipSet.visible = true; 

    // Tooltip toggle button
    root.buttons.tooltips = new brcButton("?", undefined, {x: 1, y: 0}, 
        undefined, transparent, transparent);
    root.buttons.tooltips.face = new PIXI.Sprite(PIXI.Loader.shared.resources.sprites.textures["question.png"]);
    root.buttons.tooltips.isToggle = true;
    root.buttons.tooltips.onOff = false
    root.buttons.tooltips.onToggle = (onOff) => { controller.tooltipSet.visible = onOff; };
    root.buttons.addChild(root.buttons.tooltips);
    
    // Fullscreen request
    var text = "";
    if(onMobile){
        text = "hey there you!";
        if(iOS)
            text += "\n";
        text += "\nbefore you go on ahead, you should " +
        "really go into fullscreen, it's just nicer don't you think? " + 
        "also, if you're feeling lost, tap the \"?\" icon above.";
        if(!iOS) 
            text += "\nhave fun!\n\ngo fullscreen?";
        else 
            text += "\n\nhave fun!";
    }
    else {  
        var t = "... but it seems your browser doesn't support it :(. ";
        if(haveMidi)
            t =  ", it connects automatically when you plug it in! "
        
        text = "hi there! " + "\nbefore you go on ahead, you should know " +
        "you can also control this synth with a midi controller" + t +
        "also, if you're feeling lost, click the \"?\" " + 
        "icon above to show tooltips. \nhave fun! ";
    }

    root.windows = new PIXI.Container();
    root.windows.fullscreen = new brcWindow({x: controller.texture.width, y: controller.texture.height + 10});
    root.windows.fullscreen.text = new PIXI.BitmapText(
        text, {
        align: 'center',
        font: '8px pixelmix',
    });
    root.windows.fullscreen.pivot.set(root.windows.fullscreen.width / 2, root.windows.fullscreen.height / 2);
    root.windows.fullscreen.text.anchor.set(0.5, 0);
    root.windows.fullscreen.text.position.set(root.windows.fullscreen.width / 2, 10);
    root.windows.fullscreen.text.maxWidth = 220;
    root.windows.fullscreen.addChild(root.windows.fullscreen.text);
    root.windows.fullscreen.name = "Fullscreen request";
    root.windows.fullscreen.visible = true;
    root.windows.fullscreen.xButton.visible = false;
    if(!iOS)
        root.windows.addChild(root.windows.fullscreen);
    // Mobile 
    root.windows.fullscreen.buttonNah = new brcButton("nah...", {x: 60, y: 18}, {x: 1, y: 1});
    root.windows.fullscreen.buttonYeah = new brcButton("yeah!", {x: 60, y: 18}, {x: 0, y: 1});
    root.windows.fullscreen.buttonNah.position.set(root.windows.fullscreen.width / 2 - 3, root.windows.fullscreen.height - 6);
    root.windows.fullscreen.buttonYeah.position.set(root.windows.fullscreen.width / 2 + 3, root.windows.fullscreen.height - 6);
    root.windows.fullscreen.buttonNah.onClick = () => {
        // Start AudioEngine
        audioEngine.start(); 
        root.windows.fullscreen.visible = false;
     }
    root.windows.fullscreen.buttonYeah.onClick = () => { 
        // Start AudioEngine
        audioEngine.start();
        // Go fullscreen
        var canvas = document.getElementById("pixicanvas");
        if(!iOS){
            var req = canvas.requestFullScreen || canvas.webkitRequestFullScreen || canvas.mozRequestFullScreen;
            req.call(canvas);
        }
        root.windows.fullscreen.visible = false; }
    
    // Desktop
    root.windows.fullscreen.buttonLetsgo = new brcButton("let's go!", {x: 100, y: 18}, {x: 0.5, y: 1});
    root.windows.fullscreen.buttonLetsgo.position.set(root.windows.fullscreen.width / 2, root.windows.fullscreen.height - 6);
    root.windows.fullscreen.buttonLetsgo.onClick = () => { 
        // Start AudioEngine
        audioEngine.start();
        // Hide this
        root.windows.fullscreen.visible = false;}

    if(onMobile && !iOS){
        root.windows.fullscreen.addChild(root.windows.fullscreen.buttonNah);
        root.windows.fullscreen.addChild(root.windows.fullscreen.buttonYeah);
    }
    else {
        root.windows.fullscreen.addChild(root.windows.fullscreen.buttonLetsgo);
    }

    root.addChild(root.windows);
    root.addChild(root.buttons);

    return root;

}


///////////////////////////////////////
// controller.js //////////////////////
var noteRange = [48, 72];
var currentOctave = 4;

class Controller extends PIXI.Sprite {
    constructor(anchorX, anchorY) {
        // Alias resources
        var spritesheet = PIXI.Loader.shared.resources.sprites.spritesheet;

        // Make this
        super(spritesheet.textures["base.png"]);
        this.spritesheet = spritesheet;
        
        this._noteStack = [];
        this.tooltipSet = new TooltipSet();
        this.tooltipSet.visible = false;

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
            var keyboard = new brcKeyboard(keyBindings, controller);
            keyboard.position.set(35, 54);
            
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
                frames.push(controller.spritesheet.textures[str + ".png"]);
            }
            // Make sine animation
            let sineAnimation = new PIXI.AnimatedSprite(frames);
            sineAnimation.animationSpeed = 0.5;
            // Position it correctly
            sineAnimation.x = 192;
            sineAnimation.y = 22;
            sineAnimation.play();

            sineAnimation.name = "Sine Animation";

            return sineAnimation;
        }
        function setupKnobs(tooltipSet) {
            // First, prepare the textures for them
            var textureSet = [];
            var sTex = spritesheet.textures["straight-knob.png"];
            var dTex = spritesheet.textures["diagonal-knob.png"];
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
            const tooltips = ["attack A", "sustain A", "decay A", "release A", "gain A", "gain B",
                                "shape A", "shape B", "attack B", "sustain B", "decay B", "release B"];
            const initialValues = [2, 7, 4, 3, 7, 3,
                                    1, 3, 1, 1, 5, 4];
            const types = [8, 8, 8, 8, 8, 8,
                            4, 4, 8, 8, 8, 8];
            let callbacks = [
                function (v) {audioEngine.envelopeA.attack = v},
                function (v) {audioEngine.envelopeA.sustain = remap(v, [0,7], [0, 0.5])},
                function (v) {audioEngine.envelopeA.decay = remap(v, [0,7], [0, 1])},
                function (v) {audioEngine.envelopeA.release = v},
                function (v) {audioEngine.oscillatorA.gain = remap(v, [0,7], [0, 1])},  
                function (v) {audioEngine.oscillatorB.gain = remap(v, [0,7], [0, 1])},

                function (v) {audioEngine.oscillatorB.shape = v},
                function (v) {audioEngine.oscillatorA.shape = v},
                function (v) {audioEngine.envelopeB.attack = v},
                function (v) {audioEngine.envelopeB.sustain = remap(v, [0,7], [0, 0.5])},
                function (v) {audioEngine.envelopeB.decay = remap(v, [0,7], [0, 1])},
                function (v) {audioEngine.envelopeB.release = v}];
            let knobs = new PIXI.Container();
            knobs.name = "Knobs";
            for (let i = 0; i < 12; i++) {
                let knob = new brcKnob(
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
            const x = [110, 118, 126, 134, 142, 150, 158, 166, 174, 182];
            const initialValues = [0, 9, 2, 9, 1, 6, 1, 3, 8, 7];
            const tooltips = [ "detune B", "lowpass filter", "highpass filter", "LFO frequency", "LFO amplitude", 
                                "delay time", "delay feedback", 
                                "reverb resonance", "reverb dampening", "reverb wet/dry"];
            let callbacks = [
                function (v) {audioEngine.oscillatorB.shift = v},
                function (v) {audioEngine.lowpass.frequency = v},
                function (v) {audioEngine.highpass.frequency = v},
                function (v) {audioEngine.lfo.frequency = v},
                function (v) {audioEngine.lfo.gain = v / 10},
                function (v) {audioEngine.delay.time = v / 20},
                function (v) {audioEngine.delay.feedback = v / 10},
                function (v) {audioEngine.reverb.resonance = v},
                function (v) {audioEngine.reverb.dampening = v},
                function (v) {audioEngine.reverb.wet = v / 10},
            ];
            let sliders = new PIXI.Container();
            sliders.name = "Sliders";
            for (let i = 0; i < x.length; i++) {
                // Make slider
                let slider = new brcSlider(
                    x[i],
                    initialValues[i],
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

            var octaveDown = new brcOctaveButton(
                'down', 
                5, 95,
                controller,
                controller.tooltipSet.create("octave-"));

            var octaveUp = new brcOctaveButton(
                'up', 
                18, 95,
                controller,
                controller.tooltipSet.create("octave+"));
            
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
                
            var pitchWheel = new brcWheel(
                5, 55, 1,
                "pitchwheel",
                controller.tooltipSet.create("pitch wheel"),
                function (value) {
                    audioEngine.oscillatorA.detune = (1-value) * 200; // 200 cents max up and down
                    audioEngine.oscillatorB.detune = (1-value) * 200; 
                });
            pitchWheel.resetOnEnd = true;
                    
            var modWheel = new brcWheel(
                18, 55, 1,
                "modwheel",
                controller.tooltipSet.create("modulation wheel"),
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
            audioEngine.release();
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

class brcKeyboard extends PIXI.Container {
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
            let key = new brcKey(x, y, i, this);

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
        this.inputs = [];
        this.interactive = true;
        this.buttonMode = true;
        this.interactiveChildren = true;
        this.dragging = false;
        this.on('mousedown', onStart)
            .on('touchstart', onStart)
            .on('mouseup', onEnd)
            .on('mouseupoutside', onEnd)
            .on('touchend', onEnd)
            .on('touchendoutside', onEnd)
            .on('touchmove', onMove)
            .on('mousemove', onMove);

        function onStart(event){
            // Grab event data
            var data = event.data;
            data.dragging = true;
            
            // Press the key under this position
            let key = getKey(data.global, this);
            data.currentKey = key;
            this.press(key.keyId, data.getLocalPosition(key).y);

            // Remember this for future events
            this.inputs[event.data.identifier] = data;
        }
        function onEnd(event){
            // If the drag has not already ended
            if(this.inputs[event.data.identifier] != null && this.inputs[event.data.identifier].dragging){
                this.release(this.inputs[event.data.identifier].currentKey.keyId);

                this.inputs[event.data.identifier] = null;
            }
        }
        function onMove(event){
            if (!this.inputs[event.data.identifier] || this.inputs[event.data.identifier] == null) 
                return;
            // Raycast for new key
            let newKey = getKey(this.inputs[event.data.identifier].global, this);

            // If we drag out of the keyboard, stop
            if(newKey == null) {
                this.release(this.inputs[event.data.identifier].currentKey.keyId);

                this.inputs[event.data.identifier] = null;
            }
            // If we moved to a new key, 
            // release the old one and press this one
            else if(newKey.keyId != this.inputs[event.data.identifier].currentKey.keyId){
                this.press(newKey.keyId, this.inputs[event.data.identifier].getLocalPosition(newKey).y);
                this.release(this.inputs[event.data.identifier].currentKey.keyId);
                this.inputs[event.data.identifier].currentKey = newKey;
            }
        }
        function getKey(position, root){
            return renderer.plugins.interaction.hitTest(position, root);
        }
    }

    release(keyId){
        let pitch = keyId + noteRange[0];
        if(this.shift.isDown || this.caps.isOn)
            pitch += 12;
            
        this.controller.release({pitch});
    }

    press(keyId, y){
        var key = this.keys[keyId];
        y = y || key.height * 3 / 4;
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
class brcComponent extends PIXI.Sprite {
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
            if(!onMobile)
                this.on('mouseover', TooltipSet.showTooltipOnHover)
                    .on('mouseout', TooltipSet.hideTooltip);
            else
                this.on('touchstart', TooltipSet.showTooltipOnTap);
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
class brcKey extends brcComponent {
    constructor(x, y, keyId, tooltip){
        var name = "key" + keyId;
        var tex = PIXI.Loader.shared.resources.sprites.spritesheet.
            textures[KEY_TYPES[keyId] + ".png"];
        super(tex, x, y, 0, 0, name, 0, 0, undefined, () => {});

        this.keyId = keyId;

        this.interactive = true;
    }
}
class brcOctaveButton extends brcComponent {
    constructor(type, x, y, controller, tooltip){
        var textures = PIXI.Loader.shared.resources.sprites.spritesheet.textures;
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
class brcSlider extends brcComponent {
    /**
     * @param {number} x Position x
     * @param {number} y Position y
     * @param {number} px Pivot x
     * @param {number} py Pivot y
     * @param {PIXI.Container} tooltip Tooltip object
     * @param {*} callbackFunc Function to execute when this.value changes
     */
    constructor(x, initialValue, name, tooltip, callbackFunc){
        let y = SLIDER_RANGE[1] - initialValue * 2; // y in 21,41
        super(PIXI.Loader.shared.resources.sprites.spritesheet.textures["slider.png"],
        x, y, 3, 3, name, 10, initialValue, tooltip, callbackFunc);
        /* 
        this.marker = new PIXI.Sprite(PIXI.Loader.shared.resources.sprites.spritesheet.textures["red-mark.png"]);
        this.marker.y = -neutralValue*2-12;
        this.marker.x = x;
        */

        // Bind interactions
        this.on('mousedown', onDragStart).on('touchstart', onDragStart)
            .on('mouseup', onDragEnd).on('touchend', onDragEnd)
            .on('mousemove', onDragMove).on('touchmove', onDragMove)
            .on('mouseupoutside', onDragEnd).on('touchendoutside', onDragEnd);
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
class brcKnob extends brcComponent {
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
        this.on('click', onClick)
            .on('tap', onClick)
            .on('mousedown', onDragStart).on('touchstart', onDragStart)
            .on('mouseup', onDragEnd).on('touchend', onDragEnd)
            .on('mousemove', onDragMove).on('touchmove', onDragMove)
            .on('mouseupoutside', onDragEnd).on('touchendoutside', onDragEnd);

        this.buttonMode = true;
        this.interactive = true;

        function onClick(event) {
            this.value++;
        }
        function onDragStart(event) {
            this.eventData = event.data;
            this.eventData.startingValue = this.value;
            this.dragging = true;
        }
        function onDragEnd(event) {
            this.eventData = null;
            this.dragging = false;
        }
        function onDragMove(event) {
            if (this.dragging) {
                var newPosition = this.eventData.getLocalPosition(this);
                let delta = -(round(newPosition.y, 8)) / 8;
                if(delta == 0)
                    this.value++;
                var newValue = this.eventData.startingValue + delta;
                newValue = Math.max(0, newValue);
                newValue = Math.min(newValue, 7);
                this.value = newValue;
            }
        }

    }

    /**
     * @param {number} value
     */
    set value(value){
        value = value % (this.maxValue + 1);
        this._value = value;
        this.texture = brcKnob.matchTexture(value, this._type, this.textures);
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
class brcWheel extends brcComponent {
    constructor(x, y, initialValue, name, tooltip, callbackFunc){
        var texture = PIXI.Loader.shared.resources.sprites.spritesheet.textures["touch-wheel.png"];
        super(texture, x, y, 0, 0, name, 2, initialValue, tooltip, callbackFunc);

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
///////////////////////////////////////
// audioengine.js /////////////////////
/** Detune in fixed intervals:-8ve, -M7, -p5, -M3, -m3, 0, +m3, +M3, +p5, +M7, 8ve*/
const SHIFT_CURVE = [-1200, -1100, -700, -400, -300, 0, +300, +400, +700, +1100, +1200];
const LOWPASS_CURVE = [150, 400, 700, 1200, 3000, 3500, 4000, 5000, 6000, 7000, 10000];
const HIGHPASS_CURVE = [50, 150, 250, 450, 650, 800, 1000, 1200, 1500, 2000, 3000];
const DAMPENING_CURVE = [100, 300, 600, 1000, 2000, 4000, 6500, 8000, 10000, 14000, 19000];
const RELEASE_CURVE = [0, 0.1, 0.2, 0.3, 0.6, 1, 1.5, 2.5];
const ATTACK_CURVE = [0, 0.02, 0.05, 0.1, 0.3, 0.5, 0.8, 1.2];
const COMB_FILTER_TUNINGS = [1557, 1617, 1491, 1422, 1277, 1356, 1188, 1116].map(dps => dps / 44100); // Sample rate = 44100
const ALLPASS_FREQUENCES = [225, 556, 441, 341]; // All this? Magic.
const DEFAULT_VOLUME = 0.8;

class AudioEngine {
    constructor(){
        // Create the audiocontext
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.started = false;
        this.audioContext = new AudioContext();
        this._noteOn = false;
        this.velocity = true;
        this.resetEnvelope = true;
        this.slideSpeed = 0.1;

        // Final node, used to control velocity
        this._gainM = this.audioContext.createGain();

        // Generate Components
        this.oscillatorA = new Oscillator(this.audioContext);
        this.oscillatorB = new Oscillator(this.audioContext);
        this.envelopeA = new Envelope(this.audioContext);
        this.envelopeB = new Envelope(this.audioContext);
        this.lowpass = new Filter(this.audioContext, 'lowpass');
        this.highpass = new Filter(this.audioContext, 'highpass');
        this.lfo = new LFO(this.audioContext);
        this.mod = new GainPan(this.audioContext);
        this.delay = new Delay(this.audioContext);
        this.reverb = new Freeverb(this.audioContext);

        // Connect everything 
        // Path A
        this.oscillatorA.node.connect(this.mod.left);
        this.mod.left.connect(this.envelopeA.node);
        this.envelopeA.node.connect(this.lowpass.node);

        // Path B
        this.oscillatorB.node.connect(this.mod.right);
        this.mod.right.connect(this.envelopeB.node);
        this.envelopeB.node.connect(this.lowpass.node);

        // Common
        this.lowpass.node.connect(this.highpass.node);
        this.highpass.node.connect(this.lfo.node);
        this.lfo.node.connect(this.delay.input);
        this.delay.output.connect(this.reverb.input);
        this.reverb.output.connect(this._gainM);
        this._gainM.connect(this.audioContext.destination);

        if(iOS)
            this.start();
    }

    // Activate the engine
    start(){
        if(this.started){
            console.log("AUDIOENGINE STARTED TWICE!");
            return;
        }

        this.started = true;
        // Wake up if suspended
        if(this.audioContext.state === 'suspended')
            this.audioContext.resume();
            
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

    release() {
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
    constructor(audioContext){
        this._shift = 0; // Long term pitch shift
        this._detune = 0; // Pitch wheel

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

/** An implementation of Freeverb following Anton Miselaytes' tutorial at 
 * https://itnext.io/algorithmic-reverb-and-web-audio-api-e1ccec94621a 
 */
class Freeverb {
    constructor(audioContext){
        this.audioContext = audioContext;
        this.input = audioContext.createGain();
        this.output = audioContext.createGain();
        this._dry = audioContext.createGain();
        this._wet = audioContext.createGain();
        
        this._merger = audioContext.createChannelMerger(2);
        this._doubler = {};
        this._doubler.left = audioContext.createGain();
        this._doubler.right = audioContext.createGain();
        this._wet.gain.value = 0.6;
        this._dry.gain.value = 0.4;

        // Route the wet/dry mixer
        this.input.connect(this._wet);
        this._wet.connect(this._doubler.left);
        this._wet.connect(this._doubler.right);

        this.input.connect(this._dry);
        this._dry.connect(this.output);

        // Create filters using Manfred Schroeder's tunings
        this._combFilters = COMB_FILTER_TUNINGS.map( 
            delay => new CombFilter(audioContext, delay));
        const combsLeft = this._combFilters.slice(0, 4);
        const combsRight = this._combFilters.slice(4);
        this._allPassFilters = [];
        for(var frequency of ALLPASS_FREQUENCES){
            var allpass = audioContext.createBiquadFilter();
            allpass.type = 'allpass';
            allpass.frequency.value = frequency;
            this._allPassFilters.push(allpass);
        }
        
        // Connect each set of comb filters to their respective channel
        combsLeft.forEach(combFilter => { // Channel 1
            // Route left channel into comb
            this._doubler.left.connect(combFilter.input); 
            // Route comb into merger
            combFilter.output.connect(this._merger, 0, 0);
        });
        combsRight.forEach(combFilter => { // Channel 2
            // Route right channel into comb
            this._doubler.right.connect(combFilter.input); 
            // Route comb into merger
            combFilter.output.connect(this._merger, 0, 1);
        });
        
        // Route the output from the comb filters to the allpass chain
        this._merger.connect(this._allPassFilters[0]);
        this._allPassFilters[0].connect(this._allPassFilters[1]);
        this._allPassFilters[1].connect(this._allPassFilters[2]);
        this._allPassFilters[2].connect(this._allPassFilters[3]);
        this._allPassFilters[3].connect(this.output); // And the last one to the output
    }

    get wet() { return this._wet.gain.value; }
    set wet(value) {
        this._wet.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
        this._dry.gain.setTargetAtTime((1-value)/2, this.audioContext.currentTime, 0.001);
    }

    get resonance() { return this._combFilters[0].resonance; }
    set resonance(value) {
        for(var combFilter of this._combFilters){
            combFilter.resonance = value;
        }
    }

    get dampening() { return this._combFilters[0].dampening; }
    set dampening(value) {
        for(var combFilter of this._combFilters){
            combFilter.dampening = value;
        }
    }
}

class CombFilter {
    constructor(audioContext, delay){
        this.audioContext = audioContext;
        this.input = audioContext.createGain();
        this.output = audioContext.createGain();
        this._lowPass = audioContext.createBiquadFilter();
        this._delay = audioContext.createDelay();
        this._gain = audioContext.createGain();

        this._lowPass.type = 'lowpass';
        this._lowPass.frequency.value = 440;
        this._delay.delayTime.value = delay;
        this._gain.gain.value = 0.5;

        this.input.connect(this._delay);
        this._delay.connect(this._lowPass);
        this._lowPass.connect(this._gain);
        this._gain.connect(this._delay);
        this._gain.connect(this.output);
    }

    get resonance(){ return this._gain.gain.value; }
    set resonance(value){ 
        value = remap(value, [0,10], [0,0.75]);
        this._gain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get dampening(){ return this._lowPass.frequency.value; }
    set dampening(value){
        value = DAMPENING_CURVE[value];
        this._lowPass.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }
}

class LFO extends Oscillator {
    constructor(audioContext){
        super(audioContext);
        // Oscillator and node were previously connected
        this._oscillator.disconnect(this.node);
    
        this._constant = audioContext.createConstantSource();
        this._gain = audioContext.createGain();
        
        this._oscillator.connect(this._gain);
        this._constant.connect(this._gain);
        this._gain.connect(this.node.gain)
    }

    get frequency(){ return this._oscillator.frequency.value; }
    set frequency(value){ 
        // Value is in [0, 10]
        value = value * value / 5; // Square in [0, 20];
        this._oscillator.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get gain(){ return this._gain.value; }
    set gain(value){
        // Scale the sine wave
        this._gain.gain.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
        // Shift it up by a constant
        value = (1 - value) / 2;
        this._constant.offset.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }
}

class Filter {
    constructor(audioContext, type){
        this.audioContext = audioContext;
        this.setValue = 0;
        this.node = audioContext.createBiquadFilter();
        this.node.type = type;
    }

    get frequency() { return this.node.frequency.value }
    set frequency(value) {
        if(this.node.type == 'lowpass')
            value = LOWPASS_CURVE[value];
        else if(this.node.type == 'highpass')
            value = HIGHPASS_CURVE[value];

        this.setValue = value;
        this.node.frequency.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }

    get q() { return this.node.Q.value; }
    set q(value) {
        // 1/2q = 0.1 -> 1 so 1/q = 0.2 -> 2 so q = 1/0.2 <- 1/2 so q = 5 <- 0.5
        value = remap(value, [0, 10], [0.25, 5]);
        this.node.Q.setTargetAtTime(value, this.audioContext.currentTime, 0.001);
    }
}
/** The play() and stop() methods interact with this class 
 * to control the output of the oscillators, instead of their respective
 * gain nodes. */
class Envelope {
    constructor(audioContext){
        this._open = false;
        this._sustain = 0;
        this._attack = 0;
        this._release = 0;
        this.decay = 0;

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
        this.node.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + dt);
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
    constructor(audioContext){
        this.audioContext = audioContext;

        this.input = audioContext.createGain();
        this._delay = audioContext.createDelay();
        this._feedback = audioContext.createGain();
        this.output = audioContext.createGain();

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

/** Not stereo, just two regular gains. Faking modulating oscillators */
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
///////////////////////////////////////
// main.js ////////////////////////////
// Globals
const DEBUG = false;
var haveMidi = false;
var scaleModifier = 0;
var onMobile, iOS;
var audioEngine;
var controller;
var renderer;
var stage;

function main(){
    // Meta settings
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.settings.ROUND_PIXELS = true;
    renderer = new PIXI.Renderer({ 
        view: pixicanvas,
        backgroundColor: 0x276E7B,
    }); 

    stage = new PIXI.Container();
    const ticker = PIXI.Ticker.shared;
    const loader = PIXI.Loader.shared;

    try{// Set up MIDI here
        navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        
        function onMIDIFailure() { console.log("MIDI Not Supported")};
        function onMIDISuccess(midiAccess) {
            haveMidi = true;

            // Add listeners to all midi inputs
            for (var input of midiAccess.inputs.values()){
                input.onmidimessage = Controller.processMIDIMessage;
            }

            // If a new device is input, listen to it
            midiAccess.onstatechange = (e) => {
                e.port.onmidimessage = Controller.processMIDIMessage;
            }
        }

    } catch(error) {
        // Midi not supported
    }

    onMobile = isMobile();
    iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // Double test to be sure
    var t = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
    if(t != iOS) // Tests give different results
        console.log("Confusion ensues! Two tests for iOS give two different results");

    loader
    .add("tooltipFont", "img/pixelmix.fnt")
    .add("sprites", "img/spritesheet.json")
    .load(setup);

    function setup() {
        // Build components
        audioEngine = new AudioEngine();
        controller = new Controller(0.5, 0.5);
        var overlay = createOverlay();
            
        // Attach size modifier
        var scaleUp = keybind("=");
        scaleUp.press = (event) => { 
            if(!event.getModifierState("Control"))
                return;
            scaleModifier++; 
            sizeRenderer();}
        var scaleUp = keybind("-");
        scaleUp.press = (event) => { 
            if(!event.getModifierState("Control"))
                return;
            scaleModifier--; 
            sizeRenderer();}

        // Resize handler
        window.addEventListener('resize', sizeRenderer);

        // Arrange everything
        sizeRenderer();

        // Add components to stage
        stage.addChild(controller); 
        stage.addChild(overlay);

        ticker.maxFPS = 30;
        ticker.add(() => { renderer.render(stage); });
        ticker.start();

        function sizeRenderer(){
            // Update vertical units (thanks, Apple)
            vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
          
            size = {
                width: pixicanvas.clientWidth,
                height: pixicanvas.clientHeight,
            }
            
            pixicanvas.width = size.width * devicePixelRatio; 
            pixicanvas.height = size.height * devicePixelRatio;

            // Resize renderer
            renderer.resize(size.width, size.height);

            let aspect = (size.width > size.height) ? 'landscape' : 'portrait';

            // Find the maximum scale we can use
            let w,h,scale;
            if(aspect == 'landscape'){
                w = Math.floor((size.width - 5) / controller.texture.width);
                h = Math.floor((size.height - 5) / controller.texture.height);
            }
            else {
                w = Math.floor((size.height - 5) / controller.texture.width);
                h = Math.floor((size.width - 5) / controller.texture.height);
            }
            scale = Math.min(w,h);
            scale += scaleModifier;

            if(scale == 0)
                alert("Where did you find a screen this small? Sorry, content won't fit!");

            // Rescale
            controller.scale.set(scale);
            overlay.scale.set(scale);

            // Reposition
            controller.position.set(renderer.screen.width / 2, renderer.screen.height / 2);
            overlay.position.set(renderer.screen.width / 2, renderer.screen.height / 2);
            if(aspect == 'portrait'){
                controller.angle = 90;
                overlay.angle = 90;
                overlay.buttons.position.set(renderer.screen.height / (2*scale), -renderer.screen.width / (2*scale) + 2);
            }
            else {
                controller.angle = 0;
                overlay.angle = 0;
                overlay.buttons.position.set(renderer.screen.width / (2*scale), -renderer.screen.height / (2*scale) + 2);
            }

            
        }
    }
}
///////////////////////////////////////
