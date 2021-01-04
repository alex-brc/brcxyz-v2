gsap.registerPlugin(ScrollTrigger);

gsap.set(".left", {rotate: -15});
gsap.set(".right", {rotate: 15});

gsap.from("#hi-panel", {x: innerWidth, duration: 3,
    scrollTrigger: {
        trigger: "#trigger1",
        scrub: true,
    }
});
gsap.from("#interests-panel", {x: -innerWidth, duration: 3,
    scrollTrigger: {
        trigger: "#trigger2",
        scrub: true,
    }
});
gsap.from("#skills-panel", {x: innerWidth, duration: 3,
    scrollTrigger: {
        trigger: "#trigger3",
        scrub: true,
    }
});
gsap.from("#links-panel", {x: -innerWidth, duration: 3,
    scrollTrigger: {
        trigger: "#trigger4",
        scrub: true,
    }
});