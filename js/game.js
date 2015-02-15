var N = 20; // количество строк
var M = 10; // количество столбцов
var cellSize;
var board;
var boardRect, infoPanelWidth, cornerSize;
var gameState;
var nextFigure = new Figure();
var currentFigure = nextFigure;
var myTimer = 0; // счетчик миллисекунд
var lastMove = myTimer; // для ограничения перемещений фигуры
var lastDownMove = myTimer; // для ограничений падения
var speed = 1.0; // скорость спуска фигуры (ячеек / в секунду)
var MAX_SPEED = 30;
var showFps = true;
var score = 0;
var bestScore = 0;
var scoreBoard;

var MOVE = { LEFT: 1, RIGHT: 2, DOWN: 3, MOVE: 4, DROP: 5 };
var nextMove = 0;
var myCanvas = document.getElementById("myCanvas");
var drawContext = myCanvas.getContext("2d");
var animRect;
var animText = null;
var lasti,lastj; // координаты упавшей фигуры (используется для анимации получения очков)
var bgColor1 = "#343629";
var bgColor2 = "#6B7353";
var bgColor3 = "#C4CFA1";
var bgColor4 = "#D0DBBD";

var KEY = { UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, ENTER: 13, SPACE: 32, ESC: 27, BACK: 461, PAUSE: 19, HID_BACK: 8 };

var GAME_STATE = { MENU: 0, PLAY: 1, PAUSE: 2, GAME_OVER: 3 };

// Обработка потери фокуса страницей
var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") {
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
}
document.addEventListener(visibilityChange, function() {
    if (document[hidden]) {
        setGameState(GAME_STATE.PAUSE);
    }
}, true);

// Обработка клавиши MRCU BACK
window.history.pushState();
window.addEventListener("popstate", function(inEvent) {
    if ( gameState == GAME_STATE.PLAY )
        setGameState(GAME_STATE.PAUSE);
});

function resizeCanvas() {
    myCanvas.width = window.innerWidth;
    myCanvas.height = window.innerHeight;
    cellSize = Math.floor(Math.min(myCanvas.width / M, (myCanvas.height) / (N + 4)));
    boardRect = new Rect(
        Math.floor((myCanvas.width - cellSize * M) / 2),
        cellSize * 3,
        cellSize * M,
        cellSize * N );
    infoPanelWidth = cellSize * (M - 2);
    cornerSize = Math.floor( cellSize/8 );
    drawContext.lineWidth = Math.ceil( cornerSize / 2 );
}

function loadPage() {
    resizeCanvas();

    initGame();

    drawContext.imageSmoothingEnabled = false;

    setInterval(doStep, 1000 / (2 * MAX_SPEED));
    setInterval(draw, 1000 / 30); // 30 fps
}
function initGame() {
    storage = window.localStorage;
    bestScore = storage["bestScore"] || 0;
    resources.load(["img/blocks.png","img/rem.png","img/font32.png"]);

    var i, j;
    board = new Array(N);
    for (i = 0; i < N; ++i) {
        board[i] = new Array(M);
        for (j = 0; j < M; ++j)
            board[i][j] = 0;
    }
    // добавим "рамку" чтоб не проверять граничные условия
    for (i = 0; i < N; ++i)
        board[i][0] = board[i][M - 1] = 1;
    for (j = 0; j < M; ++j)
        board[N - 1][j] = 1;
    nextFigure = new Figure();
    currentFigure = nextFigure;
    myTimer = new Date().getTime();
    lastMove = myTimer;
    lastDownMove = myTimer;
    speed = 1.0;
    score = 0;
    nextMove = 0;

    setGameState( GAME_STATE.MENU );
}

function doStep() {
    if (gameState != GAME_STATE.PLAY)
        return;
    var isTryDown = false;   // была попытка подвинуть вниз
    var isMovedDown = false; // был сдвиг вниз
    myTimer = new Date().getTime();
    if (myTimer - lastMove >= 1000 / MAX_SPEED && nextMove != 0) // команды пользователя
    {
        switch (nextMove) {
            case MOVE.LEFT:
                tryMove(currentFigure, 0, -1);
                break;
            case MOVE.RIGHT:
                tryMove(currentFigure, 0, 1);
                break;
            case MOVE.DOWN:
                if (tryMove(currentFigure, 1, 0)) {
                    isMovedDown = true;
                    lastDownMove = myTimer;
                }
                isTryDown = true;
                break;
            case MOVE.ROTATE:
                if (!tryTurn(currentFigure)) {
                    temp = new Figure();
                    copyFigure(temp, currentFigure)
                    if (temp.j < M-2) {
                        if (tryMove(temp, 0, 1) && tryTurn(temp))
                            copyFigure(currentFigure, temp);
                    }
                    if (temp.j > 0) {
                        if (tryMove(temp, 0, -1) && tryTurn(temp))
                            copyFigure(currentFigure, temp);
                    }
                }
                break;
            case MOVE.DROP:
                while (tryMove(currentFigure, 1, 0));
                putDown();
                break;
        }
        lastMove = myTimer;
        nextMove = 0;
    }
    if (myTimer - lastDownMove >= 1000 / speed) // падение
    {
        if (tryMove(currentFigure, 1, 0)) {
            isMovedDown = true;
            lastDownMove = myTimer;
        }
        isTryDown = true;
    }
    if (isTryDown && !isMovedDown) {
        putDown();
    }
}
function putDown() { // положить фигура
    // "положить" фигуру на поле
    var i, j;
    for (i = 0; i < 3; ++i)
        for (j = 0; j < 3; ++j) {
            if (currentFigure.data[i][j] != 0)
                board[currentFigure.i + i][currentFigure.j + j] = currentFigure.data[i][j];
        }
    lasti = currentFigure.i;
    lastj = currentFigure.j;
    currentFigure = nextFigure;
    nextFigure = new Figure();
    var rotateCnt = Math.round(Math.random() * 3)
    for (i = 0; i < rotateCnt; ++i)
        tryTurn(nextFigure);
    if (checkOverlap(currentFigure)) {
        setGameState(GAME_STATE.GAME_OVER);
    }
    checkFilled();
}

function ClearAnimInfo(row_)
{
    this.row = row_;
    this.cnt = 10; // счетчик/таймер анимации
}
var clearAnimateTime = 0;
var clearingRows = [];
function checkFilled() {
    var cnt = 0;
    for (var i = N - 2; i > 1; i--) {
        var isFullLine = true;
        var isEmptyLine = true;
        for (var j = 1; j < M - 1; ++j) {
            if (board[i][j] == 0)
                isFullLine = false;
            else
                isEmptyLine = false;
        }
        if (isEmptyLine)
            break;
        if (isFullLine) {
            var isPresent = false;
            for (var k = 0; k < clearingRows.length; k++)
                if (clearingRows[k].row == i) // строка уже есть в списке удаляемых(анимируемых)
                    isPresent = true;
            if (!isPresent) {
                for(var j=1;j<M-1;j++)
                    board[i][j]=0;
                clearingRows.push(new ClearAnimInfo(i));
            }
        }
    }
}
function animateRemoval()
{
    var clearedCount = 0;
    var i = 0;
    while (i < clearingRows.length) {
        if (clearingRows[i].cnt > 0) {
            var frameIdx = 10 - clearingRows[i].cnt;
            for(var k = 1; k < M-1; k++) {
                drawContext.drawImage(resources.get("img/rem.png"),
                    frameIdx * 64, 0, 64, 64,
                    boardRect.x+k*cellSize, boardRect.y + clearingRows[i].row * cellSize,
                    cellSize, cellSize);
            }
            clearingRows[i].cnt--;
            i++;
        } else {
            //удаление строки
            var k;
            for (k = clearingRows[i].row; k > 0; --k)
                board[k] = board[k - 1].slice();
            for (k = i + 1; k < clearingRows.length; ++k)
                clearingRows[k].row++;
            clearingRows.splice(i, 1);
            clearedCount++;
        }
    }
    var dScore = 0;
    if (clearedCount > 2)
        dScore = 2500;
    if (clearedCount > 1)
        dScore += 500;
    if (clearedCount == 1)
        dScore += 100;
    score += dScore;
    if (dScore > 0) {
        if (score / 10000 + 1 > speed)
            speed = Math.min(9, Math.floor(score / 10000 + 1));
        lastj++;
        if ( lastj < 2 ) lastj = 2; // чтоб оказаться в пределах игрового поля
        animText = new AnimatedText("+" + dScore.toString(),
            new Rect(boardRect.x + lastj * cellSize - score.toString().length/2 * cellSize/2,
                boardRect.y + lasti * cellSize,
                score.toString().length * cellSize/2, cellSize/2),
            new Rect(boardRect.x + lastj * cellSize - score.toString().length/2 * cellSize,
                boardRect.y + lasti * cellSize - cellSize,
                score.toString().length * cellSize, cellSize));
    }
}

function checkOverlap(figure) {
    var i, j;
    for (i = 0; i < 3; ++i)
        for (j = 0; j < 3; ++j) {
            if (figure.data[i][j] != 0 && board[figure.i + i][figure.j + j] != 0)
                return true;
        }
    return false;
}

function tryMove(figure, di, dj) {
    var movedFigure = new Figure();
    copyFigure(movedFigure, figure);
    movedFigure.i += di;
    movedFigure.j += dj;
    if (checkOverlap(movedFigure) == false) {
        figure.i = movedFigure.i;
        figure.j = movedFigure.j;
        return true;
    }
    return false;
}

function tryTurn(figure) {
    if (figure.code == FIGURE_CODE.CUBE)
        return false;
    var turnedFigure = new Figure();
    copyFigure(turnedFigure, figure);
    var i, j;
    for (i = 0; i < 3; ++i)
        for (j = 0; j < 3; ++j)
            turnedFigure.data[i][j] = figure.data[2 - j][i];
    if (checkOverlap(turnedFigure) == false) {
        for (i = 0; i < 3; ++i)
            for (j = 0; j < 3; ++j)
                figure.data[i][j] = turnedFigure.data[i][j];
        return true;
    }
    return false;
}

function drawBlock(idx, x, y) {
    var BLOCK_SIZE = 64;
    var i = idx-1;
    drawContext.drawImage(resources.get("img/blocks.png"),
        i * BLOCK_SIZE, 0, BLOCK_SIZE, BLOCK_SIZE,
        x, y, cellSize, cellSize);
}

function drawBoard() {
    drawContext.fillStyle = bgColor2;
    drawContext.fillRect( boardRect.x - cellSize, boardRect.y - 2 * cellSize,
        boardRect.w + 2 * cellSize, boardRect.h + 3 * cellSize);
    drawContext.fillStyle = bgColor4;
    drawContext.fillRect( boardRect.x + cellSize - cornerSize, boardRect.y - cornerSize,
        boardRect.w - 2 * cellSize + 2 * cornerSize, boardRect.h - cellSize + 2 * cornerSize,
        cornerSize, true, false );
    var i, j;
    for (i = 0; i < N-1; ++i) {
        for (j = 1; j < M-1; ++j) {
            if (board[i][j] != 0)
                drawBlock(board[i][j],
                    boardRect.x + j * cellSize,
                    boardRect.y + i * cellSize, cellSize, cellSize);
        }
    }
    for(i = 0; i < N + 3; i++ )
    {
        drawBlock(1,
            boardRect.x - 2 * cellSize,
            boardRect.y + i * cellSize - 2 * cellSize, cellSize, cellSize);
        drawBlock(1,
            boardRect.x2() + cellSize,
            boardRect.y + i * cellSize - 2 * cellSize, cellSize, cellSize);
    }
}

function drawMyRect(x,y,w,h,col){
    drawContext.fillStyle = col || bgColor4;
    cornerRect(drawContext, x, y, w, h, cornerSize, true, false);
    drawContext.fillStyle = bgColor2;
    cornerRect(drawContext, x + cornerSize, y + cornerSize,
        w - 2 * cornerSize, h - 2 * cornerSize, cornerSize, false, true);
}
var lastLoop = new Date().getTime();
function drawInfo() {
    var info = "";
    if (showFps) {
        var thisLoop = new Date().getTime();
        var fps = 1000 / (thisLoop - lastLoop);
        lastLoop = thisLoop;
        info = fps.toFixed(1) + " fps ";
    }
    drawContext.fillStyle = bgColor1;
    var x = boardRect.x2()+2*cellSize,
        y = 3 * cellSize;

    drawContext.fillStyle = bgColor4;
    drawContext.fillRect(x, y, infoPanelWidth, 4 * cellSize);
    drawContext.fillStyle = bgColor2;
    drawContext.fillRect(x, y + cellSize / 4, infoPanelWidth, 1.5 * cellSize);
    drawContext.fillRect(x, y + 1.5 * cellSize, infoPanelWidth, cellSize / 4);
    drawContext.fillRect(x, y + 3.5 * cellSize, infoPanelWidth, cellSize / 4);

    var px = x + cellSize;
    var pw = infoPanelWidth - 2 * cellSize;
    drawMyRect( px, y - cellSize, pw, 2 * cellSize );
    var str = "SCORE";
    drawText(str, px + pw / 2 - str.length / 2 * cellSize, y - 0.5 * cellSize, cellSize);
    drawText(score.toString(), x + infoPanelWidth / 2 - score.toString().length/2 * cellSize, y + 2 * cellSize, cellSize);

    drawMyRect( px, y + 6 * cellSize, pw, 3 * cellSize );
    str = "LEVEL";
    drawText( str, x + infoPanelWidth/2 - str.length / 2 * cellSize, y + 6.5 * cellSize, cellSize );
    str = speed.toString();
    drawText( str, x + infoPanelWidth/2 - str.length / 2 * cellSize, y + 7.5 * cellSize, cellSize );

    drawMyRect( px, y + 10 * cellSize - cornerSize, pw, 4 * cellSize + 2 * cornerSize );
    str = "NEXT";
    drawText( str, x + infoPanelWidth/2 - str.length / 2 * cellSize, y + 10 * cellSize, cellSize );
    var fx = px + 1.5 * cellSize;
    var fy = y + 11 * cellSize;
    if (nextFigure.isLeft())   fx += 0.5 * cellSize;
    if (nextFigure.isRight())  fx -= 0.5 * cellSize;
    if (nextFigure.isTop())    fy += 0.5 * cellSize;
    if (nextFigure.isBottom()) fy -= 0.5 * cellSize;
    drawFigure( nextFigure, fx, fy);
}

function drawFigure(figure, x, y) {
    if (arguments.length < 3 ) {
        x = boardRect.x + figure.j * cellSize;
        y = boardRect.y + figure.i * cellSize;
    }
    var i, j;
    for (i = 0; i < 3; ++i) {
        for (j = 0; j < 3; ++j) {
            if (figure.data[i][j] != 0)
                drawBlock(figure.data[i][j],
                    x + j * cellSize,
                    y + i * cellSize, cellSize, cellSize);
        }
    }
}

function draw() {
    drawContext.fillStyle = bgColor1;
    drawContext.fillRect(0, 0, myCanvas.width, myCanvas.height);
    drawBoard();
    switch (gameState) {
        case GAME_STATE.MENU:
            {
                drawText("Press", myCanvas.width / 2 - 2.5 * cellSize, myCanvas.height / 2 - cellSize, cellSize);
                drawText("to", myCanvas.width / 2 - cellSize, myCanvas.height / 2, cellSize);
                drawText("start", myCanvas.width / 2 - 2.5 * cellSize, myCanvas.height / 2 + cellSize, cellSize);
            } break;
        case GAME_STATE.PLAY:
            {
                drawFigure(currentFigure);
                if (clearingRows.length > 0)
                    animateRemoval();
            } break;
        case GAME_STATE.PAUSE:
            {
                drawFigure(currentFigure);
                animRect.next();
                drawContext.globalAlpha = 0.8;
                drawMyRect( animRect.currRect.x, animRect.currRect.y, animRect.currRect.w, animRect.currRect.h, bgColor3 );
                drawContext.globalAlpha = 1;
                if ( animRect.isAnimFinish() ) {
                    drawText("Press", myCanvas.width / 2 - 2.5 * cellSize, myCanvas.height / 2 - cellSize, cellSize);
                    drawText("to", myCanvas.width / 2 - cellSize, myCanvas.height / 2, cellSize);
                    drawText("resume", myCanvas.width / 2 - 3 * cellSize, myCanvas.height / 2 + cellSize, cellSize);
                }
            } break;
        case GAME_STATE.GAME_OVER:
            {
                animRect.next();
                drawContext.globalAlpha = 0.8;
                drawMyRect( animRect.currRect.x, animRect.currRect.y, animRect.currRect.w, animRect.currRect.h, bgColor3 );
                drawContext.globalAlpha = 1;
                if ( animRect.isAnimFinish() ) {
                    drawText("Game", boardRect.cx() - 2 * cellSize, boardRect.cy() - 3 * cellSize, cellSize);
                    drawText("Over", boardRect.cx() - 2 * cellSize, boardRect.cy() - 2 * cellSize, cellSize);
                    drawText("Result", boardRect.cx() - 3 * cellSize, boardRect.cy() + 1 * cellSize, cellSize);
                    drawText(score.toString(),
                        boardRect.cx() - score.toString().length / 2 * cellSize,
                        boardRect.cy() + 2 * cellSize, cellSize);
                    //var str = "Record: " + bestScore;
                    //drawContext.fillText(str, myCanvas.width / 2, myCanvas.height / 2+30);
                    if (score > bestScore)
                        storage["bestScore"] = bestScore = score;
                }
            } break;
    }
    drawInfo();
    if (animText != null) {
        animText.next();
        drawContext.globalAlpha = animText.currAlpha;
        drawTextInRect(animText.text, animText.animRect.currRect);
        drawContext.globalAlpha = 1;
        if (animText.isAnimFinish())
            animText = null;
    }
}

function keyDown() {
    switch (gameState) {
        case GAME_STATE.MENU:
            {
                setGameState( GAME_STATE.PLAY );
            } break;
        case GAME_STATE.PLAY:
            {
                switch (event.keyCode) {
                    case KEY.UP:
                        nextMove = MOVE.ROTATE;
                        break;
                    case KEY.DOWN:
                        nextMove = MOVE.DOWN;
                        break;
                    case KEY.LEFT:
                        nextMove = MOVE.LEFT;
                        break;
                    case KEY.RIGHT:
                        nextMove = MOVE.RIGHT;
                        break;
                    case KEY.SPACE:
                    case KEY.ENTER:
                        nextMove = MOVE.DROP;
                        break;
                    case KEY.ESC:
                    case KEY.PAUSE:
                    case KEY.BACK:
                    case KEY.HID_BACK:
                        setGameState( GAME_STATE.PAUSE );
                        break;
                }
            } break;
        case GAME_STATE.PAUSE:
        {
            setGameState( GAME_STATE.PLAY );
        }break;
        case GAME_STATE.GAME_OVER:
            {
                initGame();
                setGameState( GAME_STATE.MENU );
            } break;
    }
}
function setGameState(gs)
{
    if ( gameState != gs )
    {
        switch (gs)
        {
            case GAME_STATE.GAME_OVER:
                animRect = new AnimatedRect(
                    new Rect(boardRect.cx(), boardRect.cy(), 0, 0),
                    new Rect(boardRect.cx() - 3.5 * cellSize, boardRect.cy() - 4 * cellSize, 7 * cellSize, 8 * cellSize));
                break;
            case GAME_STATE.PLAY:
                nextFigure = new Figure();
                window.history.forward();
                break;
            case GAME_STATE.PAUSE:
                animRect = new AnimatedRect(
                    new Rect(boardRect.cx(), boardRect.cy(), 0, 0),
                    new Rect(boardRect.cx() - 3.5 * cellSize, boardRect.cy() - 3.5 * cellSize, 7 * cellSize, 7 * cellSize));
                break;
        }
        gameState = gs;
    }
}