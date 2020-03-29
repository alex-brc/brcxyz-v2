
class Window extends PIXI.Container{
    constructor(size){
        super();
        // Create button background
        var nsp = new PIXI.NineSlicePlane(
            PIXI.Loader.shared.resources.common.spritesheet.textures["tooltip.png"],
            4, 4, 4, 4);
        // And set it up
        nsp.width = size.x;
        nsp.height = size.y;
        this.background = nsp;
        this.addChild(nsp);
    }

    // Awkward name cause it hid something from PIXI.Container
    get dimensions() { return {x: this.background.width, y: this.background.height }}
    set dimensions(value){
        this.background.width = value.x;
        this.background.height = value.y;
    }
}

class Settings extends Window {
    constructor(size){
        super(size);

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
