let textShadowDepth = 8;
let speed = 1;

let green = `#6a8d73`;
let yellow = `#e3b23c`;
let blue = `#197bbd`;
let accent = `#fd5e53`;

let t;
let greenTextShadowString = '-1px 1px ' + green;
let fromGreenTextShadowString = '0px 0px ' + green;
let yellowTextShadowString = '-1px 1px ' + yellow;
let fromYellowTextShadowString = '0px 0px ' + yellow;
let blueTextShadowString = '-1px 1px ' + blue;
let fromBlueTextShadowString = '0px 0px ' + blue;
let accentTextShadowString = '-1px 1px ' + accent;
let fromAccentTextShadowString = '0px 0px ' + accent;

for (let i = 2; i <= textShadowDepth; i++) {    
    t = `, -${i}px ${i}px `;
    greenTextShadowString += t + green;
    fromGreenTextShadowString += ', 0px 0px ' + green;
    yellowTextShadowString += t + yellow;
    fromYellowTextShadowString += ', 0px 0px ' + yellow;
    blueTextShadowString += t + blue;
    fromBlueTextShadowString += ', 0px 0px ' + blue;
    accentTextShadowString += t + accent;
    fromAccentTextShadowString += ', 0px 0px ' + accent;
}
console.log(blueTextShadowString);

gsap.fromTo("#title-A", speed,
    {textShadow: fromGreenTextShadowString}, // from
    {textShadow: greenTextShadowString, x: '8px', y:'-8px',
    delay: 2}); // to

gsap.fromTo("#title-B", speed,
    {textShadow: fromYellowTextShadowString}, // from
    {textShadow: yellowTextShadowString, x: '8px', y:'-8px',
    delay: 2}); // to

// First panel:
let hiTimeline = gsap.timeline({
    delay: 0.5,
    scrollTrigger: {
        trigger: "#hi-panel",
        start: "top center",
        toggleActions: "play none none reset"
    }
});
// Pop "hi!"
hiTimeline.fromTo("#hi-box", speed,
    {textShadow: fromGreenTextShadowString},
    {textShadow: greenTextShadowString, x: '8px', y:'-8px', ease: "power2.out",
}); 

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
            newClass: "blue"
        }
    });
});

// Second panel
let likesTimeline = gsap.timeline({
    delay: 0.5,
    scrollTrigger: {
        trigger: "#likes-panel", 
        start: "top center",
        toggleActions: "play none none reverse",
        markers: true,
    }
})
likesTimeline.fromTo("#what-box", speed,
    {textShadow: fromBlueTextShadowString},
    {textShadow: blueTextShadowString, x: '8px', y:'-8px', ease: "power2.out",
    delay: 0.5
}); 

// Animate texts

let randomisedLikes = gsap.utils.toArray(".like");
gsap.utils.shuffle(randomisedLikes);

randomisedLikes.forEach((like) => { 
    likesTimeline.from(like, {
        duration: 0.5,
        text: {
            value: "",
            padSpace: true 
        }
    });
});


// Third panel
let skillsTimeline = gsap.timeline({
    delay: 0.5,
    scrollTrigger: {
        trigger: "#skills-panel", 
        start: "top center",
        toggleActions: "play none none reverse",
    }
})

skillsTimeline.fromTo("#how-box", speed,
    {textShadow: fromAccentTextShadowString},
    {textShadow: accentTextShadowString, x: '8px', y:'-8px', ease: "power2.out",
    delay: 0.5
}); 
let randomisedSkills = gsap.utils.toArray(".skill");
gsap.utils.shuffle(randomisedSkills);

randomisedSkills.forEach((skill) => { 
    skillsTimeline.from(skill, {
        duration: 0.5,
        text: {
            value: "",
            padSpace: true 
        }
    });
});
