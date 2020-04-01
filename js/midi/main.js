// Globals
var audioEngine;
var controller;
var renderer;

// Start program
main();

function main(){
    // Meta settings
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    PIXI.settings.ROUND_PIXELS = true;
    renderer = new PIXI.Renderer({ 
        view: pixicanvas,
        backgroundColor: 0x276E7B,
    }); 

    const stage = new PIXI.Container();
    const ticker = PIXI.Ticker.shared;
    const loader = PIXI.Loader.shared;

    loader
    .add("tooltipFont", "../sprite/pixelmix.fnt")
    .add("ui", "../sprite/ui.json")
    .add("controller", "../sprite/controller.json")
    .load(setup);

    function setup() {
        // Build components
        audioEngine = new AudioEngine();
        controller = new Controller(0.5, 0.5);
        var overlay = createOverlay();


        // Resize handler
        window.addEventListener('resize', sizeRenderer);

        // Arrange everything
        sizeRenderer();

        // Add components to stage
        stage.addChild(controller); 
        stage.addChild(overlay);

        ticker.add(() => { renderer.render(stage); });
        ticker.start();

        function sizeRenderer(){
            pixicanvas.width = window.innerWidth * renderer.resolution; 
            pixicanvas.height = window.innerHeight * renderer.resolution;

            // Resize renderer
            renderer.resize(pixicanvas.width, pixicanvas.height);

            // Scale the canvas down with CSS        
            pixicanvas.style.width = window.innerWidth + 'px';
            pixicanvas.style.height = window.innerHeight + 'px';
            
            // renderer.resize(window.innerWidth, window.innerHeight);

            let aspect = (window.innerWidth > window.innerHeight) ? 'landscape' : 'portrait';

            // Find the maximum scale we can use
            let w,h,scale;
            if(aspect == 'landscape'){
                w = Math.floor((renderer.screen.width - 5) / controller.texture.width);
                h = Math.floor((renderer.screen.height - 5) / controller.texture.height);
            }
            else {
                w = Math.floor((renderer.screen.height - 5) / controller.texture.width);
                h = Math.floor((renderer.screen.width - 5) / controller.texture.height);
            }
            scale = Math.min(w,h);
            scale = Math.min(scale, 6);
            
            // Rescale
            // renderer.resolution = 1 / 4;
            controller.scale.set(scale, scale);
            overlay.scale.set(scale, scale);

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
