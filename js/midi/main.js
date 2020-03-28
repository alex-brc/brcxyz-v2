// Globals
var audioEngine;
var controller;
var renderer;

// Start program
main();

function main(){
    // Meta settings
    renderer = new PIXI.Renderer({ 
        view: pixicanvas,
        backgroundColor: 0x276E7B,
        width: window.innerWidth,      
        height: window.innerHeight,
        resolution: devicePixelRatio,
        autoDensity: true,
        antialias: false
    }); 

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    const stage = new PIXI.Container();
    const ticker = PIXI.Ticker.shared;
    const loader = PIXI.Loader.shared;

    
    loader.onProgress.add(loadHandler);

    loader
    .add("tooltipFont", "../sprite/pixelmix.fnt")
    .add("common", "../sprite/common.json")
    .add("controller", "../sprite/controller.json")
    .load(afterLoading);

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
    }
        
    function buildComponents() {
        audioEngine = new AudioEngine();
        controller = new Controller(0.5, 0.5);
        
        // Tooltip toggle
        var toggle = TooltipSet.createToggle(controller.tooltipSet);

        // Resize handler
        window.addEventListener('resize', sizeRenderer);

        // Arrange everything
        sizeRenderer();
        sizeRenderer();

        // Add components to stage
        stage.addChild(controller);
        stage.addChild(toggle);

        function sizeRenderer(){
            // Resize renderer
            renderer.resize(window.innerWidth, window.innerHeight);
            let aspect = (window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait';

            // Find the maximum scale we can use
            let w,h,scale;
            if(aspect == 'landscape'){
                w = Math.floor(renderer.screen.width / controller.texture.width);
                h = Math.floor(renderer.screen.height / controller.texture.height);
            }
            else {
                w = Math.floor(renderer.screen.height / controller.texture.width);
                h = Math.floor(renderer.screen.width / controller.texture.height);
            }
            scale = Math.min(w,h);
            console.log(aspect, scale);
            console.log(renderer.screen.width, renderer.screen.height);
            console.log(controller.texture.width, controller.texture.height);

            // Reposition
            controller.position.set(renderer.screen.width / 2, renderer.screen.height / 2);
            if(aspect == 'portrait'){
                controller.angle = 90;
                toggle.angle = 90;
                toggle.position.set(renderer.screen.width, renderer.screen.height);
            }
            else {
                controller.angle = 0;
                toggle.position.set(renderer.screen.width, 0);
            }

            // Rescale
            controller.scale.set(scale, scale);
            toggle.scale.set(scale, scale);


        }
    }
}
