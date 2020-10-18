

// Initialise fullpage
new fullpage('#fullpage', {
    licenseKey: 'CEAEB2F9-D07E42AF-A8725A3C-A5162A1F', // hide this somehow 
    scrollingSpeed: 1000,
    scrollOverflow: false,
    fitToSection: false,
    css3: true,
    easingcss3: 'ease',
    autoScrolling: false
// Disabled parallaxing background cause it's a bit too intense
/* onLeave: function(origin, destination, direction){
    if(direction == 'down')
    // parallax down
    $("#webgl").css("position", "absolute").animate({
        top: '-=15vh'
    }, 1000, 'easeOutQuad');
    else if(direction == 'up')
    // parallax up
    $("#webgl").css("position", "absolute").animate({
        top:  '+=15vh'
    }, 1000, 'easeOutQuad'); }*/
// Title moving down animation
/* onLeave: function(origin, destination, direction) {
    if(origin.index == 0 && destination.index == 1){
    $("#title-div").css("position", "relative").animate({
        top: "+=20vh"}, 1000, 'easeOutQuad');
    }
    else if(origin.index == 1 && destination.index == 0){
    $("#title-div").css("position", "relative").animate({
        top: "-=20vh"}, 1000, 'easeOutQuad');
    }
} */
/* 
    // Autoscroll only for first section
    afterLoad: function(origin, destination, direction) {
        if(origin.index == 0 && destination.index == 1){
        // Turn off autoscrolling
            fullpage_api.setAutoScrolling(false);
        }
    },
    */
});

/* 
// Only autoscroll webgl section
var moving = false;
$(window).scroll(function(){
    let pos = $(window).scrollTop();
    // If scroll is less than window height, scroll to top
    if(!moving && pos > 3 && pos + 1 < $(window).height()){
        moving = true;
        $('html, body').animate({scrollTop: '0px'}, 1000);

        console.log("pos is "+pos);
        console.log("max is "+$(window).height());
        // Turn on autoscroll
        setTimeout(function () {moving = false; fullpage_api.setAutoScrolling(true);}, 999);
    }
});
*/

// Initialise scroll animations
AOS.init({
    duration: 400,
    mirror: false,
    anchorPlacement: 'top-bottom',
    easing: 'ease-out',
});
  
  