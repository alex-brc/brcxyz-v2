invaders();

function invaders() {
    const INVADERS_STEP_SIZE = '6vw';
    const INVADERS_SCREEN_SIZE = viewportToPixels('100vw');
    const INVADERS_TIMING = 200;
    var invadersStepSize = viewportToPixels(INVADERS_STEP_SIZE);
    var currentInvaderRow = 0;
    var onOff = true;

    // Populate row arrays
    var invaderRows = [];
    $('.invader-row').each(function(){
        invaderRows.push($(this));
    });

    // Save initial state
    var initialInvadersOffset = invaderRows[0].offset();

    function swapInvaders() {
        // Move current row by some distance
        var c = invaderRows[currentInvaderRow];
        // c.offset({top: c.offset().top, left: c.offset().left 
        //    + invadersStepSize});
        currentInvaderRow = (++currentInvaderRow) % invaderRows.length;

        // For all children invaders, change backround img
        if(onOff){
            c.find('.invader.A').each(function () {
                $(this).css("background-image", "url(img/invaders/typeA-off.png)");});
            c.find('.invader.B').each(function () {
                $(this).css("background-image", "url(img/invaders/typeB-off.png)");});
            c.find('.invader.C').each(function () {
                $(this).css("background-image", "url(img/invaders/typeC-off.png)");});
        }
        else {
            c.find('.invader.A').each(function () {
                $(this).css("background-image", "url(img/invaders/typeA-on.png)");});
            c.find('.invader.B').each(function () {
                $(this).css("background-image", "url(img/invaders/typeB-on.png)");});
            c.find('.invader.C').each(function () {
                $(this).css("background-image", "url(img/invaders/typeC-on.png)");});
        }
        onOff = !onOff;
    }

    function resetInvaders() {
        clearInterval(INVADERS_SCRIPT);
        invaderRows.forEach(el => {
            el.offset({left: initialInvadersOffset.left});
        });
        currentInvaderRow = 0;
    }

    var INVADERS_SCRIPT;
    var running = false;
    // Start rolling invaders on trigger from aos
    document.addEventListener('aos:in:invaders', ({ detail }) => {
        if(running){
            running = false;
            resetInvaders();
        } 
        else {
            running = true;
            swapInvaders();
            INVADERS_SCRIPT = setInterval(swapInvaders, INVADERS_TIMING);
        }
    });
}
// Plain stole this from https://stackoverflow.com/questions/34166341/convert-vh-units-to-px-in-js
// Thanks Pablo Albornoz
function viewportToPixels(value) {
    var parts = value.match(/([0-9\.]+)(vh|vw)/)
    var q = Number(parts[1])
    var side = window[['innerHeight', 'innerWidth'][['vh', 'vw'].indexOf(parts[2])]]
    return side * (q/100)
  }