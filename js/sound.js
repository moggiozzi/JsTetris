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
            ],
            function () { }
        );
        bufferLoader.load();
    }
}
var isWebKit = false;
function playSound(id) {
    if (isWebKit) {
        playSoundForWebKit(id);
        return;
    }
    var element = document.getElementById(id);
    if (sounds[id] == undefined) {
        sounds[id] = new Audio("./sounds/" + id + ".wav");
        sounds[id].load();
    }
    if (sounds[id].played.length == 0 || sounds[id].ended)
        sounds[id].play();
}

function playSoundForWebKit(id) {
    var source = context.createBufferSource(); // может не стоит каждый раз вызывать?
    var idx = 0;
    switch (id) { // fixme сделать список звуков
        case 'move': idx = 0; break;
        case 'drop': idx = 1; break;
        case 'clear': idx = 2; break;
    }
    source.buffer = window.bufferLoader.bufferList[idx];
    source.connect(context.destination);
    source.start(0);
}