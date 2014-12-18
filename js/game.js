﻿var sounds = [];

var N = 20; // количество строк
var M = 10; // количество столбцов
var cellWidth, cellHeight;
var gameBoard;
var gameBoardPosX, gameBoardPosY;
var gameState;
var currentFigure = new Figure(
        Math.round(Math.random() * MAX_FIGURE_CODE),
        Math.round(Math.random() * (MAX_COLOR_CODE - 1) + 1));
var nextFigure = new Figure(
        Math.round(Math.random() * MAX_FIGURE_CODE),
        Math.round(Math.random() * (MAX_COLOR_CODE - 1) + 1));
var myTimer = 0; // счетчик миллисекунд
var lastMove = myTimer; // для ограничения перемещений фигуры
var lastDownMove = myTimer; // для ограничений падения
var speed = 1.0; // скорость спуска фигуры (ячеек / в секунду)
var MAX_SPEED = 30;
var showFps = true;
var score = 0;

var MOVE = { LEFT: 1, RIGHT: 2, DOWN: 3, MOVE: 4, DROP: 5 };
var nextMove = 0;
var myCanvas = document.getElementById("myCanvas");
var drawContext = myCanvas.getContext('2d');

var MAX_COLOR_CODE = 6;
var COLOR_CODE_GRAY = 7; // серый для фона
var COLOR_GRAY = "#808080";
var COLOR_BLUE = "#0000FF";
var COLOR_BLACK = "#000000";
function getColor(colorCode) {
    switch (colorCode) {
        case 1:
            return "#FF0000";
        case 2:
            return "#00FF00";
        case 3:
            return COLOR_BLUE;
        case 4:
            return "#FFFF00";
        case 5:
            return "#FF00FF";
        case 6:
            return "#00FFFF";
        case COLOR_CODE_GRAY:
            return COLOR_GRAY;
        default:
            return "#D0D0D0";
    }
}

function resizeCanvas() {
    myCanvas.width = window.innerWidth;
    myCanvas.height = window.innerHeight;
    cellWidth = cellHeight = Math.floor(Math.min(myCanvas.width / M, (myCanvas.height) / (N + 2)));
    drawContext.font = cellWidth.toString() + 'px Arial';
    gameBoardPosX = (myCanvas.width - cellWidth * M) / 2;
    gameBoardPosY = cellHeight * 2;
}
var GAME_STATE = { MENU: 0, PLAY: 1, GAME_OVER: 2 };
function loadPage() {
    resizeCanvas();

    initAudio();
    initGame();

    setInterval(doStep, 1000 / (2 * MAX_SPEED));
    setInterval(draw, 1000 / 30); // 30 fps
}
function initGame() {
    var i, j;
    gameBoard = new Array(N);
    for (i = 0; i < N; ++i) {
        gameBoard[i] = new Array(M);
        for (j = 0; j < M; ++j)
            gameBoard[i][j] = 0;
    }
    // добавим "рамку" чтоб не проверять граничные условия
    for (i = 0; i < N; ++i)
        gameBoard[i][0] = gameBoard[i][M - 1] = COLOR_CODE_GRAY;
    for (j = 0; j < M; ++j)
        gameBoard[N - 1][j] = COLOR_CODE_GRAY;

    currentFigure = new Figure(
        Math.round(Math.random() * MAX_FIGURE_CODE),
        Math.round(Math.random() * (MAX_COLOR_CODE - 1) + 1));
    nextFigure = new Figure(
        Math.round(Math.random() * MAX_FIGURE_CODE),
        Math.round(Math.random() * (MAX_COLOR_CODE - 1) + 1));
    myTimer = new Date().getTime();
    lastMove = myTimer;
    lastDownMove = myTimer;
    speed = 1.0;
    score = 0;
    nextMove = 0;

    gameState = GAME_STATE.MENU;
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
    playSound('drop');
    // "положить" фигуру на поле
    var i, j;
    for (i = 0; i < 3; ++i)
        for (j = 0; j < 3; ++j) {
            if (currentFigure.data[i][j] != 0)
                gameBoard[currentFigure.i + i][currentFigure.j + j] = currentFigure.data[i][j];
        }
    currentFigure = nextFigure;
    nextFigure = new Figure(
        Math.round(Math.random() * MAX_FIGURE_CODE),
        Math.round(Math.random() * (MAX_COLOR_CODE - 1) + 1));
    if (tryMove(currentFigure, 1, 0) == false) {
        currentFigure.i--;
        gameState = GAME_STATE.GAME_OVER;
    }
    checkFilled();
}

function ClearAnimInfo(row_)
{
    this.row = row_;
    this.cnt = 30; // счетчик/таймер анимации
}
var clearAnimateTime = 0;
var clearingRows = [];
function checkFilled() {
    var cnt = 0;
    for (var i = N - 2; i > 1; i--) {
        var isFullLine = true;
        var isEmptyLine = true;
        for (var j = 1; j < M - 1; ++j) {
            if (gameBoard[i][j] == 0)
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
            if (!isPresent)
                clearingRows.push(new ClearAnimInfo(i));
        }
    }
}
function animateRemoval()
{
    var i = 0;
    while (i < clearingRows.length) {
        if (clearingRows[i].cnt > 0) {
            // \todo анимация
            drawContext.fillStyle = COLOR_GRAY;
            drawContext.fillRect(gameBoardPosX, gameBoardPosY + clearingRows[i].row * cellHeight, cellWidth * M - 1, cellHeight);
            clearingRows[i].cnt--; 
            i++;
        } else {
            //удаление строки
            var k;
            for (k = clearingRows[i].row; k > 0; --k)
                gameBoard[k] = gameBoard[k - 1].slice();
            for (k = i + 1; k < clearingRows.length; ++k)
                clearingRows[k].row++;
            clearingRows.splice(i, 1);
        }
    }
}

function checkOverlap(figure) {
    var i, j;
    for (i = 0; i < 3; ++i)
        for (j = 0; j < 3; ++j) {
            if (figure.data[i][j] != 0 && gameBoard[figure.i + i][figure.j + j] != 0)
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
        //playSound('move');
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

function drawBoard() {
    drawContext.fillStyle = COLOR_GRAY;
    drawContext.fillRect(gameBoardPosX, 0, cellWidth * M - 1, cellHeight * 2);

    var i, j;
    for (i = 0; i < N; ++i) {
        for (j = 0; j < M; ++j) {
            drawContext.fillStyle = getColor(gameBoard[i][j]);
            if (gameBoard[i][j] != 0)
                drawContext.fillRect(
                    gameBoardPosX + j * cellHeight,
                    gameBoardPosY + i * cellWidth, cellWidth - 1, cellHeight - 1);
            else
                drawContext.fillRect(
                    gameBoardPosX + j * cellHeight,
                    gameBoardPosY + i * cellWidth, cellWidth, cellHeight);
        }
    }
}

var lastLoop = new Date().getTime();
function drawInfo() {
    var info = "";
    if (showFps) {
        var thisLoop = new Date().getTime();
        var fps = 1000 / (thisLoop - lastLoop);
        lastLoop = thisLoop;
        info = fps.toFixed(1) + ' fps ';
    }
    info += ' Score: ' + score;
    drawContext.fillStyle = COLOR_BLACK;
    drawContext.fillText(info, gameBoardPosX, cellHeight);
}

function drawFigure(figure) {
    drawContext.fillStyle = getColor(figure.colorCode);
    var i, j;
    for (i = 0; i < 3; ++i) {
        for (j = 0; j < 3; ++j) {
            if (figure.data[i][j] != 0)
                drawContext.fillRect(
                    gameBoardPosX + (figure.j + j) * cellHeight,
                    gameBoardPosY + (figure.i + i) * cellWidth, cellWidth - 1, cellHeight - 1);
        }
    }
}

function draw() {
    switch (gameState) {
        case GAME_STATE.MENU:
            {
                drawBoard();
                drawContext.fillStyle = COLOR_BLACK;
                drawContext.textAlign = "center";
                var str = "Press to start.";
                drawContext.fillText(str, myCanvas.width / 2, myCanvas.height / 2);
            } break;
        case GAME_STATE.PLAY:
            {
                drawContext.textAlign = "left";
                drawBoard();
                drawInfo();
                drawFigure(currentFigure);
                if (clearingRows.length > 0)
                    animateRemoval();
            } break;
        case GAME_STATE.GAME_OVER:
            {
                drawContext.fillStyle = COLOR_BLACK;
                drawContext.textAlign = "center";
                var str = "You result: " + score;
                drawContext.fillText(str, myCanvas.width / 2, myCanvas.height / 2);
            } break;
    }
}
var KEY = { UP: 38, DOWN: 40, LEFT: 37, RIGHT: 39, ENTER: 13, SPACE: 32 };
function keyDown() {
    switch (gameState) {
        case GAME_STATE.MENU:
            {
                gameState = GAME_STATE.PLAY;
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
                        nextMove = MOVE.DROP;
                        break;
                }
            } break;
        case GAME_STATE.GAME_OVER:
            {
                initGame();
                gameState = GAME_STATE.MENU;
            } break;
    }
}
var MB_LEFT = 1;
function mouseDown() {
    //if (event.button == MB_LEFT)
    nextMove = MOVE.ROTATE;
}