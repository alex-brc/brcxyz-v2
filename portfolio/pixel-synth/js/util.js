// By kittyattack on github, at
// https://github.com/kittykatattack/learningPixi#keyboard
function keybind(value) {
    let key = {};
    key.value = value;
    key.isDown = false;
    key.isUp = true;
    key.press = undefined;
    key.release = undefined;
    //The `downHandler`
    key.downHandler = event => {
        if (event.key === key.value) {
            if (key.isUp && key.press) {
                key.press(event);
            }
            key.isDown = true;
            key.isUp = false;
            event.preventDefault();
        }
    };

    //The `upHandler`
    key.upHandler = event => {
        if (event.key === key.value) {
            if (key.isDown && key.release) 
                key.release(event);
            key.isDown = false;
            key.isUp = true;
            event.preventDefault();
        }
    };

    //Attach event listeners
    const downListener = key.downHandler.bind(key);
    const upListener = key.upHandler.bind(key);

    window.addEventListener(
        "keydown", downListener, false
    );
    window.addEventListener(
        "keyup", upListener, false
    );

    // Detach event listeners
    key.unsubscribe = () => {
        window.removeEventListener("keydown", downListener);
        window.removeEventListener("keyup", upListener);
    };

    return key;
}
if (!Array.prototype.last){
    Array.prototype.last = function(){
        return this[this.length - 1];
    };
};
if(!Array.prototype.removeFrom){
    Array.prototype.removeFrom = function(p){
        return this.splice(p, 1);
    };
};

function round(number, step) {
    return Math.floor(number / step ) * step;
}

function remap(number, from, to){
    return to[0] + (number-from[0])*(to[1]-to[0])/(from[1]-from[0]); 
}

// Detect mobile
function isMobile() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
    };
    

const KEY_TYPES = [
    "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "rightkey",
    "leftkey", "blackkey", "midkey", "blackkey", "midkey", "blackkey", "rightkey-logo", "lastkey"];
const BUTTON_TYPE = [
    "button-up.png","button-up-green.png","button-up-yellow.png","button-up-blue.png", 
    "button-down.png","button-down-green.png","button-down-yellow.png","button-down-blue.png"];
const SLIDER_RANGE = [21, 41];
function frequency(note){
    return NOTE_TO_FREQ[note];
}
// Index = note number. All midi notes from 0 - 127
const NOTE_TO_FREQ = new Float32Array([
    8.1757989156,
    8.6619572180,
    9.1770239974,
    9.7227182413,
    10.3008611535,
    10.9133822323,
    11.5623257097,
    12.2498573744,
    12.9782717994,
    13.7500000000,
    14.5676175474,
    15.4338531643,
    16.3515978313,
    17.3239144361,
    18.3540479948,
    19.4454364826,
    20.6017223071,
    21.8267644646,
    23.1246514195,
    24.4997147489,
    25.9565435987,
    27.5000000000,
    29.1352350949,
    30.8677063285,
    32.7031956626,
    34.6478288721,
    36.7080959897,
    38.8908729653,
    41.2034446141,
    43.6535289291,
    46.2493028390,
    48.9994294977,
    51.9130871975,
    55.0000000000,
    58.2704701898,
    61.7354126570,
    65.4063913251,
    69.2956577442,
    73.4161919794,
    77.7817459305,
    82.4068892282,
    87.3070578583,
    92.4986056779,
    97.9988589954,
    103.8261743950,
    110.0000000000,
    116.5409403795,
    123.4708253140,
    130.8127826503,
    138.5913154884,
    146.8323839587,
    155.5634918610,
    164.8137784564,
    174.6141157165,
    184.9972113558,
    195.9977179909,
    207.6523487900,
    220.0000000000,
    233.0818807590,
    246.9416506281,
    261.6255653006,
    277.1826309769,
    293.6647679174,
    311.1269837221,
    329.6275569129,
    349.2282314330,
    369.9944227116,
    391.9954359817,
    415.3046975799,
    440.0000000000,
    466.1637615181,
    493.8833012561,
    523.2511306012,
    554.3652619537,
    587.3295358348,
    622.2539674442,
    659.2551138257,
    698.4564628660,
    739.9888454233,
    783.9908719635,
    830.6093951599,
    880.0000000000,
    932.3275230362,
    987.7666025122,
    1046.5022612024,
    1108.7305239075,
    1174.6590716696,
    1244.5079348883,
    1318.5102276515,
    1396.9129257320,
    1479.9776908465,
    1567.9817439270,
    1661.2187903198,
    1760.0000000000,
    1864.6550460724,
    1975.5332050245,
    2093.0045224048,
    2217.4610478150,
    2349.3181433393,
    2489.0158697766,
    2637.0204553030,
    2793.8258514640,
    2959.9553816931,
    3135.9634878540,
    3322.4375806396,
    3520.0000000000,
    3729.3100921447,
    3951.0664100490,
    4186.0090448096,
    4434.9220956300,
    4698.6362866785,
    4978.0317395533,
    5274.0409106059,
    5587.6517029281,
    5919.9107633862,
    6271.9269757080,
    6644.8751612791,
    7040.0000000000,
    7458.6201842894,
    7902.1328200980,
    8372.0180896192,
    8869.8441912599,
    9397.2725733570,
    9956.0634791066,
    10548.081821211,
    11175.303405856,
    11839.821526772,
    12543.853951416]);

