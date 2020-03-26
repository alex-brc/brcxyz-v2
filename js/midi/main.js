// Globals
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
        // Build the components
        controller = new Controller(renderer.screen.width / 2, renderer.screen.height / 2, 0.5, 0.5, 4);

        // Set up MIDI here
        navigator.requestMIDIAccess()
            .then(onMIDISuccess, onMIDIFailure);
        function onMIDISuccess(midiAccess) {
            // Add listeners to all midi inputs
            for (var input of midiAccess.inputs.values())
                input.onmidimessage = controller.processMIDIMessage;
        }
        function onMIDIFailure() {/* TODO: Tell there's no midi, ask to refresh page */ }
            
        // Add the controller to the stagex
        stage.addChild(controller);
        
        function loop(){
            renderer.render(stage);
        }

        ticker.add(loop)
        ticker.start();
    }
}