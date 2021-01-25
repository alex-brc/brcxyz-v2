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
            node.style.height = height+"px";
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
    "<h6> wait... browsers can do MIDI? </h6> <br>" +

    "<i> tl;dr: made synthesizer in browser. it's cool, try it </i> <br> <br>" +

    "a while back i started getting into music production, synthesizers and the like. " +
    "i don't know how exactly, but at some point i stumbled upon this really cool synthesizer pixel art. i thought: \"would be cool if that thing actually played\". " +
    "so i looked into it for a bit. imagine, then, my excitement when i found out that modern browsers don't <i>just</i> come with digital oscillators and filters, " +
    "but also natively support the MIDI protocol!" +
    "i took that as an opportunity to step outside my comfort zone and make a minimalistic synthesizer that lives and breathes inside the browser. <br> <br>" +

    "my main goals were stability and sound quality, and for the most part, it turned out great. as an added bonus, i even managed to stick a reverb onto it! " + 
    "we played it in a jam session that summer, using an iPhone hooked up to " +
    "a MIDI controller, and we had a real blast. <br> <br>" +


    "probably my biggest issue with this project is the fact that i couldn't manage to get rid of delay issues on windows and android. " +
    "after some fiddling, i got the app to work pretty much as intended on major platforms and browsers and i concluded that the delay issue most likely resides within the windows and android " +
    "audio stacks. in the end, i'm sure a genuine audio wizard could've pulled something off, but that ain't me, and for now i'm okay with that fact. <br> <br>" +
    "something else i wish i'd done better would be a nice set of instructions for mobile users. desktop users can hover over controls to get some info about them, " +
    "but as it sits, mobile users have pretty much nothing. <br> <br>" +


    "in the end, i was very happy with the result. turns out playing an instrument you made yourself is really satisfying, i'm really glad i took this on. " +
    "i'd really encourage you to check it out " + 
    "<a href=\"https://brc.xyz/portfolio/pixel-synth/\">here</a>, or by clicking the title. " +
    "it's pretty fun to play with! if you're interested in the full list of features and some technical details, check it out on " + 
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



// OUTFIELER
let accent = `#fd5e53`;
var outfielderTl = buildAnimations("outfielder", accent, 
    "<h6> sports sciences? i hope it's not me doing the running </h6> <br>" +

    "<i> tl;dr: did virtual reality testing environment for sports problem. " + 
    "learned alot, interdisciplinary project == cool.</i> <br> <br> " +

    "my largest undertaking by far up until now has been my final year project. " +
    "it involved the outfielder problem, an active subject of debate in the fields of " +
    "sport sciences and psychology. i do recommend checking out my <a href=\"https://docs.google.com/presentation/d/e/2PACX-1vRr_pa0IS0OTeS_Za6GELklBXJSkZnN1QCpEc2cmNM4M_IyyldM3t_a8Dry0PzY3eHsCnxmMP5klTLb/pub?start=false&loop=false&delayms=3000\">" + 
    "slides</a> for an overview if you're interested in reading on (there's videos in it). <br> <br>" +

    "the aim of the project was to construct a virtual reality environment which can be used " +
    "to study this problem. in broad terms, strap a headset onto a participant, run some trials, collect data and " +
    "also perform some predictions based on proposed mathematical models and if everything goes right, " +
    "show that there's a preference for one model or the other. <br> <br>" +

    "funnily enough, for a computer science project, it wasn't very technically demanding. " +
    "the real challenge was getting familiar enough with topics completely outside of my domain " +
    "in order to deliver a product that is scientifically appropriate for the task at hand; in other words, " +
    "we wanted this virtual environment to model the real world scenario closely enough so that the data we collected " +
    "is determinably relevant. turns out science is hard and in the end, it kind of worked, but it had its shortcomings*. <br> <br> " +
    
    "scientific rigour aside, the software itself is intentionally simplistic, but offers a rich (though admittedly dull) interface for monitoring ongoing trials " +
    "as well as potentially limitless configurability by supporting custom code to be introduced at runtime (in straight C#). " +
    "this was the first time i encountered the concept of reflection in C# and my mind was promptly blown. <br> <br>" +

    "it's been a very exciting project for me, having to apply computer science in a very different field, " +
    "particularly since i had a chance to work with experts in computer science as well as sports sciences. " +
    "working on such a large project has also taught me some valuable lessons about the necessity of planning " +
    "and having a clear set of goals in mind when pushing for a deadline. <br> <br> " +
    "*note: if this piqued your interest, you can download the full report, for your own private viewing, " + 
    "<a href=\"doc/The-Outfielder-Problem-A-Virtual-Reality-Testing-Environment-REPORT.pdf\">here</a>, or by clicking the title.");

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
