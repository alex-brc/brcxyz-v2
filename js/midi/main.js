// Globals
var audioEngine;
var controller;

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

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    
    window.addEventListener('rezize', resizeEventListener);
    function resizeEventListener(){
        renderer.resize(window.innerWidth, window.innerHeight);
    }

    const stage = new PIXI.Container();
    const ticker = PIXI.Ticker.shared;
    const loader = PIXI.Loader.shared;

    
    loader.onProgress.add(loadHandler);

    loader
    .add("tooltipFont", "../sprite/pixelmix.fnt")
    .add("common", "../sprite/common.json")
    .add("controller", "../sprite/controller.json")
    .load(afterLoading);
    // Create the components

    function loadHandler(loader, resource) {
        //Display the file `url` currently being loaded
        console.log("loading: " + resource.name + " from " + resource.url); 

        //Display the percentage of files currently loaded
        console.log("progress: " + loader.progress + "%");
    }

    function afterLoading() {
        buildEnvironment();
        buildComponents();
    }

    function buildEnvironment() {
        ticker.add(() => { renderer.render(stage); });
        ticker.start();

        // Set up MIDI here
        const requestMIDIAccess = navigator['requestMIDIAccess'];
        if (requestMIDIAccess) {
            requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
        } 
        else { /* MIDI not supported */ }

        function onMIDIFailure() {/* TODO: Tell there's no midi, ask to refresh page */ }
        function onMIDISuccess(midiAccess) {
            // Add listeners to all midi inputs
            for (var input of midiAccess.inputs.values())
                input.onmidimessage = Controller.processMIDIMessage;
        }

        
        // Tooltip button 
        var tooltips
    }
        
    function buildComponents() {
        audioEngine = new AudioEngine();
        controller = new Controller(renderer.screen.width / 2, renderer.screen.height / 2, 0.5, 0.5, 4);
        
        // Tooltip toggle
        var toggle = TooltipSet.createToggle(controller.tooltipSet);
        toggle.x = renderer.screen.width;
        toggle.y = 0;
        toggle.scale.set(4);

        // Add the controller to the stagex
        stage.addChild(controller);
        stage.addChild(toggle);
    }
}
