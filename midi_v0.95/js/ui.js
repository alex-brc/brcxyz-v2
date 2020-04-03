
class Window extends PIXI.NineSlicePlane{
    constructor(size){
        super(PIXI.Loader.shared.resources.ui.spritesheet.textures["window.png"],
        7, 7, 7, 7);

        size = size || {x: 17, y: 22};
        this.width = size.x;
        this.height = size.y;

        this.pivot.x = this.width * 0.5;
        this.pivot.y = this.height * 0.5;

        // Put an X button in the corner
        var dummyTex = new PIXI.NineSlicePlane(PIXI.Loader.shared.resources.ui.textures["dummy-texture.png"], 0, 0, 0, 0);
        this.xButton = new Button("x", undefined, {x: 1, y: 0}, undefined, dummyTex, dummyTex);
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
        this.text = text;
        this.foreground = textBmp;
        
        // Create button background
        var nsp = upTexture || new PIXI.NineSlicePlane(
            PIXI.Loader.shared.resources.ui.spritesheet.textures["button.png"],
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
            PIXI.Loader.shared.resources.ui.spritesheet.textures["button-clicked.png"],
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
            PIXI.Loader.shared.resources.ui.spritesheet.textures["tooltip.png"],
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

function createOverlay(){
    var root = new PIXI.Container();
    root.buttons = new PIXI.Container();
    root.buttons.name = "Buttons";
    var transparent = new PIXI.NineSlicePlane(PIXI.Loader.shared.resources.ui.textures["dummy-texture.png"], 0, 0, 0, 0);

    // Create tooltips for buttons
    root.tooltipSet = new TooltipSet();
    root.addChild(root.tooltipSet);
    root.tooltipSet.visible = true; 

    // Tooltip toggle button
    root.buttons.tooltips = new Button("?", undefined, {x: 1, y: 0}, 
        undefined, transparent, transparent);
    root.buttons.tooltips.face = new PIXI.Sprite(PIXI.Loader.shared.resources.ui.textures["question.png"]);
    root.buttons.tooltips.isToggle = true;
    root.buttons.tooltips.onOff = false
    root.buttons.tooltips.onToggle = (onOff) => { controller.tooltipSet.visible = onOff; };
    root.buttons.addChild(root.buttons.tooltips);
    
    // Fullscreen request
    var text = ""
    if(onMobile){
        text = "hey there you! " + "\nbefore you go on ahead, you should " +
        "really go into fullscreen, it's just nicer don't you think? " + 
        "also, if you're feeling lost, tap the \"?\" icon above. \nhave fun! \n\ngo fullscreen?";
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
    root.windows.fullscreen = new Window({x: controller.texture.width, y: controller.texture.height + 10});
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
    root.windows.addChild(root.windows.fullscreen);
    // Mobile 
    root.windows.fullscreen.buttonNah = new Button("nah...", {x: 60, y: 18}, {x: 1, y: 1});
    root.windows.fullscreen.buttonYeah = new Button("yeah!", {x: 60, y: 18}, {x: 0, y: 1});
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
        req = canvas.requestFullScreen || canvas.webkitRequestFullScreen || canvas.mozRequestFullScreen;
        req.call(canvas);
        root.windows.fullscreen.visible = false; }
    
    // Desktop
    root.windows.fullscreen.buttonLetsgo = new Button("let's go!", {x: 100, y: 18}, {x: 0.5, y: 1});
    root.windows.fullscreen.buttonLetsgo.position.set(root.windows.fullscreen.width / 2, root.windows.fullscreen.height - 6);
    root.windows.fullscreen.buttonLetsgo.onClick = () => { 
        // Start AudioEngine
        audioEngine.start();
        // Hide this
        root.windows.fullscreen.visible = false;}

    if(onMobile){
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

