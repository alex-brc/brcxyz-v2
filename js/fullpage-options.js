new fullpage('#fullpage', {
  licenseKey: 'CEAEB2F9-D07E42AF-A8725A3C-A5162A1F', // hide this somehow 
  scrollingSpeed: 1000,
  easing: 'easeOutQuad',
 onLeave: function(origin, destination, direction){
    if(direction == 'down')
      // parallax down
      $("#webgl").css("position", "absolute").animate({
        top: '-=10vh'
      }, 1000, 'easeOutQuad');
    else if(direction == 'up')
      // parallax up
      $("#webgl").css("position", "absolute").animate({
        top:  '+=10vh'
      }, 1000, 'easeOutQuad');
	} 
});