let textShadowDepth = 8;
let popSpeed = 1;

let green = `#6a8d73`;
let yellow = `#e3b23c`;
let blue = `#197bbd`;
let accent = `#fd5e53`;

let timelines = [];

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

function sectionTimeline(panel) {
    var tl = gsap.timeline({
        delay: 0,
        paused: true,
    });


    timelines.push(tl);

    return tl;
}

function typeText(timeline, box,duration = 0.3){
    timeline.from(box, {
        duration: duration,
        text: {
            value: "",
            padSpace: true 
        }
    });
}

// Pop Titles
var titleATl = gsap.timeline({delay: 2});
popShadow(titleATl, "#title-A", green);
var titleBTl = gsap.timeline({delay: 2}); 
popShadow(titleBTl, "#title-B", yellow);

// First panel:
let hiTimeline = sectionTimeline("#hi-section");
// Pop "hi!"
popShadow(hiTimeline, "#hi-title", green);

hiTimeline.from("#im-box", {
    duration: 1,
    text: {
        value: "",
        padSpace: true 
    }
});

// Animate text
const values = ["a developer", "a nerd", "a maker", "a gamer", "a gradute", "a funny guy", 
"not annoying", "not <i>that</i> funny", "running out of stuff", "a volunteer", "sure you're bored", 
"urging you to go on", "starting to lose it", "out of things to say"];

values.forEach (item => {
    hiTimeline.to("#who-box", {
        duration: 1,
        yoyo: true,
        repeat: 1,
        repeatDelay: 1,
        text: {
            value: item,
            newClass: "green"
        }
    });
});

// Second panel
let likesTimeline = sectionTimeline("#likes-section");
popShadow(likesTimeline, "#what-title", yellow);

// Animate texts
let randomisedLikes = gsap.utils.toArray(".like");
gsap.utils.shuffle(randomisedLikes);

randomisedLikes.forEach((like) => { typeText(likesTimeline, like); });

// Third panel
let skillsTimeline = sectionTimeline("#skills-section");
popShadow(skillsTimeline, "#how-title", accent);

let randomisedSkills = gsap.utils.toArray(".skill");
gsap.utils.shuffle(randomisedSkills);

randomisedSkills.forEach((skill) => { typeText(skillsTimeline, skill); });

// Links
let linksTimeline = sectionTimeline("#links-section");
popShadow(linksTimeline, "#cool-title", green);
typeText(linksTimeline, "#check-box", 0.6);
typeText(linksTimeline, "#contact-box", 0.6);

new fullpage('#fullpage', {
    licenseKey: 'CEAEB2F9-D07E42AF-A8725A3C-A5162A1F',
	navigation: true,
	navigationPosition: 'right',

    afterLoad: function(origin, destination, direction){

        // On scrolling up, restart timelines
        if(direction == 'up'){
            timelines[origin.index - 1].restart(true); // preserve delay
            timelines[origin.index - 1].pause();
        }

        if(destination.index != 0)
            timelines[destination.index - 1].play();
    },
            
  });
