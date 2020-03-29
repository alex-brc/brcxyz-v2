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
        navigator.requestMIDIAccess()
        .then(onMIDISuccess, onMIDIFailure);

        function onMIDIFailure() {console.log("No midi")};
        function onMIDISuccess(midiAccess) {
            // Add listeners to all midi inputs
            for (var input of midiAccess.inputs.values())
                input.onmidimessage = Controller.processMIDIMessage;
        }
    }
        
    function buildComponents() {
        audioEngine = new AudioEngine();
        controller = new Controller(0.5, 0.5);
        controller.tooltipSet.visible = false;

        var root = new PIXI.Container();
        root.tooltipSet = new TooltipSet();
        root.addChild(root.tooltipSet);
        root.tooltipSet.visible = true;

        // Tooltip toggle
        var dummyTex = new PIXI.NineSlicePlane(loader.resources.common.textures["dummy-texture.png"], 0, 0, 0, 0);
        root.toggle = new Button("?", undefined, {x: 1, y: 0}, 
            root.tooltipSet.create("show tooltips", 'right', {x: 1.05, y: -1}),
            dummyTex, dummyTex);
        root.addChild(root.toggle);
        root.toggle.isToggle = true;
        root.toggle.onOff = false
        root.toggle.onToggle = (onOff) => { controller.tooltipSet.visible = onOff; };

        // Resize handler
        window.addEventListener('resize', sizeRenderer);

        // Arrange everything
        sizeRenderer();

        // Add components to stage
        stage.addChild(controller);
        stage.addChild(root);

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
            // Rescale
            controller.scale.set(scale, scale);
            root.scale.set(scale, scale);

            // Reposition
            controller.position.set(renderer.screen.width / 2, renderer.screen.height / 2);
            if(aspect == 'portrait'){
                controller.angle = 90;
                root.angle = 90;
                root.position.set(renderer.screen.width, renderer.screen.height);
            }
            else {
                controller.angle = 0;
                root.angle = 0;
                root.position.set(renderer.screen.width, 0);
            }

        }
    }
}
