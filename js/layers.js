

gsap.utils.toArray(".sliding").forEach(item => {
    gsap.to(item,{ 
        ease: Power0.easeNone,
        y: toPX("40vh"),
        scrollTrigger: {
            trigger: item,
            scrub: true,
            start: "center center",
        }
    });
});

gsap.from("#links-panel",{ 
    y: toPX("-40vh"),
    scrollTrigger: {
        trigger: "#links-panel",
        scrub: true,
        start: "center center",
    }
});


function toPX(value) {
    return parseFloat(value) / 100 * (/vh/gi.test(value) ? window.innerHeight : window.innerWidth);
}