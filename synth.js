
function Synth(audioContext, numberOfVoices, waveType){
    // Properties
      // Number of Voices
  var numVoices = numberOfVoices;
      // Type
  var type = waveType;
      // Graph
        // Root
  var root = initRoot(audioContext);
        // Voices
  var voices = initVoices(audioContext, numVoices, root, type);
      // State
  var state = {
        // Voices
          // Free
    freeVoices: initFreeVoices(numVoices),
        // Frequencies
          // Active
    acts: []
  };

    // Interface
  return {
    get numVoices() {
      return numVoices;
    },

    set numVoices(newVal) {
      numVoices = newVal;
    },

    get type () {
      return type;
    },

    set type (newType) {
      type = newType;
      updateVoicesType();
    },

    get amp() {
      return root.gain.value;
    },

    set amp(newVal) {
      root.gain.value = newVal;
    },

    get frequencies() {
      var result = [];

      acts.forEach(function(act){
        result.push(act.freq.val);
      });

      return result;
    },

    fireFreq: function(frequency, amplitude){
      var termedFreq;
      var voiceInd;
      var voice;

      var actInd = indexOfFreq(frequency);

      if(actInd != undefined) {
        var lastAct = state.acts.splice(actInd,1)[0];

        termedFreq = null;

        voiceInd = lastAct.voiceInd;

        voice = voices[voiceInd];
      }
      else if(state.freeVoices.length != 0){
        termedFreq = null;

        voiceInd = state.freeVoices.shift();

        voice = voices[voiceInd];
      }
      else {
        var lastAct = state.acts.shift();

        termedFreq = lastAct.freq.val;

        voiceInd = lastAct.voiceInd;

        voice = voices[voiceInd];
      }

      voice.src.frequency.value = frequency.val;

      voice.out.gain.value = amplitude;

      state.acts.push({
        freq: frequency,
        voiceInd: voiceInd
      });

      return termedFreq;
    },

    termFreq: function(frequency){
      var termedFreq;

      var actInd = indexOfFreq(frequency);

      if(actInd == undefined){
        termedFreq = null;
      }
      else {
        var lastAct = state.acts.splice(actInd,1)[0];

        var voiceInd = lastAct.voiceInd;

        var voice = voices[voiceInd];

        voice.src.frequency.value = 0;
        voice.out.gain.value = 0;

        state.freeVoices.push(voiceInd);
      }

      return termedFreq;
    }
  }

    // Utilities
      // Initialize Root
  function initRoot(audioContext){
    var result = audioContext.createGain();

    result.connect(audioContext.destination);

    result.gain.value = 0;

    return result;
  }
      // Initialize Voices
  function initVoices(audioContext, numVoices, root, type){
    var result = [];

    for (var i = 0; i < numVoices; i++) {
      var currOsc = audioContext.createOscillator();

      var currGain = audioContext.createGain();
      result.push({
        src: currOsc,
        out: currGain
      });

      currGain.connect(root);
      currOsc.connect(currGain);

      currGain.gain.value = 0;
      currOsc.frequency.value = 0;

      currOsc.type = type;

      currOsc.start();
    }

    return result;
  }
      // Initialize Free Voices
  function initFreeVoices(numVoices){
    var result = [];

    for (var i = 0; i < numVoices; i++) {
      result.push(i);
    }

    return result;
  }
      // Update Each Voices Type
  function updateVoicesType(){
    voices.forEach(function(voice){
      voice.src.type = type;
    });
  }
      // Checks If A Certain Frequency Is Active
  function indexOfFreq(frequency){
    for (var i = 0; i < state.acts.length; i++) {
      if(state.acts[i].freq === frequency){
        return i;
      }
    }
    return undefined;
  }
}
