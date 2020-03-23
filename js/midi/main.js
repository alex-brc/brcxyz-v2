// Globals
var noteRange = [48, 72];

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
    .add("../sprite/controller.json")
    .add("../sprite/buttons.json")
    .load(setup);

    // Create the components
    var audioEngine, controller;
        
    function setup() {
        // Alias the spritesheets
        const spritesheet = loader.resources["../sprite/controller.json"].spritesheet;
        const buttonsheet = loader.resources["../sprite/buttons.json"].spritesheet;

        // Build the components
        audioEngine = new AudioEngine();
        controller = new Controller(spritesheet, buttonsheet, renderer, audioEngine);
        
        // Add the controller to the stagex
        stage.addChild(controller.base);
        
        function loop(){
            renderer.render(stage);
        }

        ticker.add(loop)
        ticker.start();
    }
}