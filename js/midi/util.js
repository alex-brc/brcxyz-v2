function decNote(note){
    let octave = note / 12;
    note %= 12;
    return {
        key: note,
        octave
    };
}

function round(number, step) {
    return Math.floor(number / step ) * step;
}

function remap(number, from, to){
    return to[0] + (number-from[0])*(to[1]-to[0])/(from[1]-from[0]); 
}

const NUMBER_TO_NAME = 
             {0:  'C',  1:  'C#', 2:  'D',
              3:  'Eb', 4:  'E',  5:  'F',
              6:  'F#', 7:  'G',  8:  'Ab',
              9:  'A',  10: 'Bb', 11: 'B' }

const NAME_TO_NUMBER = 
             {'B#': 0, 'C':  0, 
              'C#': 1, 'Db': 1, 
              'D':  2,
              'D#': 3, 'Eb': 3, 
              'E':  4, 'Fb': 4, 
              'E#': 5, 'F':  5, 
              'F#': 6, 'Gb': 6, 
              'G':  7,  
              'G#': 8, 'Ab': 8, 
              'A':  9, 
              'A#': 10,'Bb': 10,
              'B':  11,'Cb': 11 }
