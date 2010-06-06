function createSignals(duration, f) {
  var hz      = 44100;
  var t       = Math.round(duration * hz);
  var signal;
  var signals = new Array(t);
  var phase   = 0;
  var freq    = f * 2.0 * Math.PI / hz;

  for (var i = 0; i < t; i++) {
    signal = Math.sin(phase);
    signal = (signal + 1) / 2 * 255;
//    signal = signal > 128 ? 180 : 75;  // (この行を有効にすると矩形波になる)
    signals[i] = Math.floor(signal);

    phase += freq;
  }

  // ぶちぶち音対策
  signal = signals[signals.length-1];
  if (signal > 128) {
    for (; signal >= 128; signal--) {
      signals.push(signal);
    }
  }
  else if (signal < 128) {
    for (; signal <= 128; signal++) {
      signals.push(signal);
    }
  }

  return signals;
}

function mixSignals(signals, offset) {
  var length = signals.length;

  var mixed = new Array(length)
  for (var i = 0; i < length; i++) {
    mixed[i] = 0;
  }

  for (var i = 0; i < length; i++) {
    mixed[i + offset] += + signals[i];
  }

  return mixed;
}

function createPitchList(){
  var list = {
    "C1"  : 261.6/4, "C1#" : 277.2/4, "D1"  : 293.7/4, "D1#" : 311.1/4,
    "E1"  : 329.6/4, "F1"  : 349.2/4, "F1#" : 370.0/4, "G1"  : 392.0/4,
    "G1#" : 415.3/4, "A1"  : 440.0/8, "A1#" : 466.2/8, "B1"  : 493.9/8,
  };

  for (var current = 2; current < 8; current++) {
    var currentString = current.toString(10);
    var prev          = current - 1;
    var prevString    = prev.toString(10);
    for (var key in list) {
      if (key.match(new RegExp(prevString))) {
        list[key.replace(prevString, currentString)] = list[key] * 2;
      }
    }
  }

  return list;
}

function convertToBinary(signals) {
  var binary = "";
  var length = signals.length;

  for (var i = 0; i < length; i++) {
    if (signals[i] > 255){
      binary += String.fromCharCode(255);
    }
    else {
      binary += String.fromCharCode(signals[i]);
    }
  }

  return binary;
}

var bpm       =  6;
var minlen    = 16;
var pitchList = createPitchList();

function playSound(key, octave, length) {
  var signals = createSignals(((60.0 / bpm) / (minlen / 4)) * length, pitchList[key.toUpperCase() + octave.toString(10)]);
  var schema  = convertToURL(convertToBinary(signals));

  $("<audio>").attr({ src: schema })
  .bind("canplay", function() {
    this.play();
  })
  .bind("ended", function() {
    $(this).remove();
  })
  .appendTo($("body"));
}
