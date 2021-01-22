let textShadowDepth = 8;
let popSpeed = 1;
let textSpeed = 10;
var timelines = [];

function popShadow(timeline, target, color) {
    // Prepare strings
    let shadowString = '-1px 1px ' + color;
    let fromShadowString = '0px 0px ' + color;

    // Populate them
    for (let i = 2; i <= textShadowDepth; i++) {    
        shadowString += `, -${i}px ${i}px ` + color;
        fromShadowString += ', 0px 0px ' + color;
    }

    // Add tween to timeline
    timeline.set(target, {textShadow: fromShadowString});
    timeline.to(target, popSpeed, {textShadow: shadowString, x: '8px', y:'-8px'});
}

function buildAnimations(name, popColor, content) {
    // Create IDs
    var section = "#" + name + "-section";
    var title = "#" + name + "-title";
    var box = "#" + name + "-box";
    
    // Create a timeline
    var tl = gsap.timeline({delay: 0.5, paused: true});

    // Add it to the list

    timelines.push(tl);
    // Pop title
    popShadow(tl, title, popColor);

    // Record initial offsets
    var titleNode = document.getElementById(title.substring(1));
    var initialTitleOffset = {x: titleNode.offsetLeft, y: titleNode.offsetTop};
    gsap.set(section, {"justify-content": "center"});

    // Now to move title up
    // First, set final flex
    tl.set(section, {"justify-content": "flex-start"});
    // Same frame, reposition title to adjust for this change
    tl.set(title, {
        x: 8 + titleNode.offsetLeft - initialTitleOffset.x,
        y: -8 + titleNode.offsetTop - initialTitleOffset.y,
    }); // Magic numbers are just the 8px shadow pop
    // Tween to final position
    tl.to(title, 1, {x: 0, y: 0, ease: Power2.easeInOut});

    // Have text box fill the page then fix its height
    tl.set(box, {
        "flex-grow": 1,
        width: 0, 
        borderTopWidth: "2px",
        ease: Power2.easeInOut,

        onComplete: function() {
            let node = document.getElementById(box.substring(1));
            let height = node.getBoundingClientRect().height;
            node.style.maxHeight = height+"px";
        }
    });
    // Expand width
    tl.to(box, 0.8, {
        width: 0.8 * window.innerWidth,
    });
    // Text animation:
    tl.to(box, {
        delay: 0.2,
        text: {
            value: content,
            speed: textSpeed,
            ease: Power0.easeNone
        }
    });

    return tl;
}
// WELCOME
let blue = `#197bbd`;
var welcomeTl = buildAnimations("welcome", blue, 
"this is where i keep a summary of some of my completed projects. <br <br>" +
"scroll down for some short descriptions and stories about each one. " + 
"you can find links/downloads for them in the descriptions, but you can also click the titles on each page. <br> <br>" +
"if you want to know more about any of these or just wanna chat, don't hesitate to drop me a message anywhere!");

// SYNTH
let otherBlue = '#35a3ec';
var synthTl = buildAnimations("synth", otherBlue, 
    "<i> wait... browsers can do MIDI? </i> <br> <br>" +
    "a while back i started getting into music production, synthesizers and the like. <br> <br>" +
    "i don't know how exactly, but at some point i stumbled upon this really cool synthesizer pixel art. i thought: \"would be cool if that thing actually played\". <br> <br>" +
    "so i looked into it for a bit. imagine, then, my excitement when i found out that modern browsers don't <i>just</i> come with digital oscillators and filters, " +
    "but also natively support the MIDI protocol! <br> <br>" +
    "i took that as an opportunity to step outside my comfort zone and make a minimalistic synthesizer that lives and breathes inside the browser. <br> <br>" +
    "my main goals were stability and sound quality, and for the most part, it turned out great. as an added bonus, i even managed to stick a reverb onto it! we played it in a jam session that summer, using an iPhone hooked up to " +
    "a MIDI controller, and we had a real blast. <br> <br>" +
    "probably my biggest issue with this project is the fact that i couldn't manage to get rid of delay issues on windows and android. " +
    "after some fiddling, i got the app to work pretty much as intended on major platforms and browsers and i concluded that the delay issue most likely resides within the windows and android " +
    "audio stacks. in the end, i'm sure a genuine audio wizard could've pulled something off, but that ain't me, and for now i'm okay with that fact. <br> <br>" +
    "something else i wish i'd done better would be a nice set of instructions for mobile users. desktop users can hover over controls to get some info about them, " +
    "but as it sits, mobile users have pretty much nothing. <br> <br>" +
    "in the end, i was very happy with the result. turns out playing an instrument you made yourself is really satisfying, i'm really glad i took this on. <br> <br>" +
    "i'd really encourage you to check it out " + 
    "<a href=\"https://brc.xyz/portfolio/pixel-synth/\">here</a>" +
    ". it's pretty fun to play with! if you're interested in the full list of features and some technical details, check it out on " + 
    "<a href=\"https://github.com/alex-brc/brc.xyz/tree/master/portfolio/pixel-synth\">github</a>.");

// Moving background
var synthBackground = gsap.timeline({
    repeat: -1, 
    yoyo: true,
});

synthBackground.fromTo("#synth-section", 30,
    {backgroundPosition: "10% center"},
    {backgroundPosition: "50% center", ease: Power0.easeNone}
);



// OUTFIELDER
let accent = `#fd5e53`;
var outfielderTl = buildAnimations("outfielder", accent, 
    "");

// Background
var outfielderBackground = gsap.timeline({
    repeat: -1, 
    yoyo: true,
});

outfielderBackground.fromTo("#outfielder-section", 30,
    {backgroundPosition: "50% center"},
    {backgroundPosition: "10% center", ease: Power0.easeNone}
);


// BATTLESHIP
var battleshipTl = buildAnimations("battleship", accent, "");

// Backgrounds
var battleshipBackground = gsap.timeline({
    repeat: -1, 
    yoyo: true, 
});

battleshipBackground.fromTo("#battleship-section", 30,
    {backgroundPosition: "10% center"},
    {backgroundPosition: "50% center", ease: Power0.easeNone}
);


    
new fullpage('#fullpage', {
    licenseKey: 'CEAEB2F9-D07E42AF-A8725A3C-A5162A1F',
    normalScrollElements: "#synth-box, #outfielder-box, #battleship-box",
	navigation: true,
	navigationPosition: 'right',

    afterLoad: function(origin, destination, direction){
        // Play animation
        timelines[destination.index].play();
    },
            
  });
