gsap.to("#title-panel",{ 
    ease: Power0.easeNone,
    y: toPX("40vh"),
    force3D: true,
    rotation: 0.1,
    scrollTrigger: {
        trigger: "#title-panel",
        scrub: true,
        start: "center center",
    }
});

gsap.utils.toArray(".sliding").forEach(item => {
    gsap.to(item,{ 
        ease: Power0.easeNone,
        y: toPX("40vh"),
        force3D: true,
        rotation: 0.1,
        scrollTrigger: {
            trigger: item,
            scrub: true,
            start: "top center",
        }
    });
});

gsap.from("#links-panel",{ 
    y: toPX("-40vh"),
    force3D: true,
    rotation: 0.1,
    scrollTrigger: {
        trigger: "#links-panel",
        scrub: true,
        start: "top center",
    }
});


function toPX(value) {
    return parseFloat(value) / 100 * (/vh/gi.test(value) ? window.innerHeight : window.innerWidth);
}