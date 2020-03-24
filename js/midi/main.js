// Globals
var noteRange = [48, 72];
var audioEngine = new AudioEngine();

// Pixi Settings
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

// Start program
main();

function main(){
    // Meta settings
    const renderer = new PIXI.Renderer({ 
        view: pixicanvas,
        backgroundColor: 0x276E7B,
        width: window.innerWidth,      
        height: window.innerHeight,
        resolution: devicePixelRatio,
        autoDensity: true,
        antialias: false

    }); 
    window.addEventListener('rezize', resizeEventListener);
    function resizeEventListener(){
        renderer.resize(window.innerWidth, window.innerHeight);
    }

    const stage = new PIXI.Container();
    const ticker = PIXI.Ticker.shared;
    const loader = PIXI.Loader.shared;

    // Load all sprites
    loader
    .add("controller", "../sprite/controller.json")
    .add("common", "../sprite/common.json")
    .add("tooltipFont", "../sprite/pixelmix.fnt")
    .add("tooltip", "../sprite/tooltip.png")
    .load(setup);

    // Create the components
    var controller;
        
    function setup() {
        // Alias the spritesheets
        const spritesheet = loader.resources.controller.spritesheet;
        const commonsheet = loader.resources.common.spritesheet;

        // Build the components
        controller = new Controller(spritesheet, commonsheet, renderer);

        // Bind controls
        audioEngine.masterGain = 1.0 * controller.searchComponent("master").value / 10;
        
        // Add the controller to the stagex
        stage.addChild(controller.base);
        
        function loop(){
            renderer.render(stage);
        }

        ticker.add(loop)
        ticker.start();
    }
}