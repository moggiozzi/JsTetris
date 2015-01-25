function initAudio() {
    if (getBrowserName() == "safari") // for Lg WebOS
    {
        isWebKit = true;
        window.context;
        window.bufferLoader;
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        context = new AudioContext();
        bufferLoader = new BufferLoader(
            context,
            [
                './sounds/move.wav',
                './sounds/drop.wav',
                './sounds/clear.wav',
                './sounds/music.mp3',
            ],
            function () { }
        );
        bufferLoader.load();
    }
}
var isWebKit = false;
function playSound(id,isLoop) {
    if ( soundsOn == false )
        return;
    if (isWebKit) {
        playSoundForWebKit(id);
        return;
    }
    if (sounds[id] == undefined) {
        sounds[id] = new Audio( id );
        sounds[id].loop = isLoop;
        sounds[id].load();
    }
    //if (sounds[id].played.length == 0 || sounds[id].ended)
        sounds[id].play();
}
function stopSound(id) {
    if (isWebKit) {
        stopSoundForWebKit(id);
        return;
    }
    if (sounds[id] == undefined)
        return;
    sounds[id].pause();
    sounds[id].currentTime = 0;
}

function playSoundForWebKit(id) {
    var source = context.createBufferSource(); // может не стоит каждый раз вызывать?
    var idx = 0;
    switch (id) { // fixme сделать список звуков
        case "./sounds/move.wav": idx = 0; break;
        case "./sounds/drop.wav": idx = 1; break;
        case "./sounds/clear.wav": idx = 2; break;
        case "./sounds/music.mp3": idx = 3; break;
    }
    source.buffer = window.bufferLoader.bufferList[idx];
    source.connect(context.destination);
    source.start(0);
}