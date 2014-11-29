var N = 32; // количество строк
var M = 16; // количество столбцов
var cellWidth = 16, cellHeight = 16;
var gameBoard;

function getColor(colorCode) {
    switch(colorCode)
    {
        case 1:
            return "#FF0000";
        case 2:
            return "#00FF00";
        case 3:
            return "#0000FF";
        case 4:
            return "#00FFFF";
        default:
            return "#000000";
    }
}

function Figure(figureCode,colorCode) {
    var c = colorCode;
    switch (figureCode) {
        case 1:
            this.data = [
                [0, c, 0],
                [0, c, 0],
                [0, c, 0],
            ];
            break;
        case 2:
            this.data = [
                [0, c, c],
                [0, c, 0],
                [0, c, 0],
            ];
            break;
        case 3:
            this.data = [
                [c, c, 0],
                [0, c, 0],
                [0, c, 0],
            ];
            break;
        case 4:
            this.data = [
                [0, 0, c],
                [0, c, c],
                [0, c, 0],
            ];
            break;
        case 5:
            this.data = [
                [c, 0, 0],
                [c, c, 0],
                [0, c, 0],
            ];
            break;
        case 6:
        default:
            this.data = [
                [0, 0, 0],
                [0, c, c],
                [0, c, c],
            ];
            break;
    }
}

function initGame() {
    var i, j;
    gameBoard = new Array(N);
    for (i = 0; i < N; ++i) {
        gameBoard[i] = new Array(M);
        for (j = 0; j < M; ++j)
            gameBoard[i][j] = 0;
    }
    for (j = 0; j < M; ++j)
        gameBoard[3][j] = 1;//test
    draw();
}

function draw() {
    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext('2d');
//    context.strokeStyle = "#0000FF";
  //  context.lineWidth = 5;
    //context.strokeRect(10, 10, canvas.width - 10, canvas.height - 10);
    //context.fillStyle = "#FF0000";
    //context.fillRect(30, 30, 30, 30);
    var f = new Figure(1);
    var i, j;
    for (i = 0; i < N; ++i) {
        for (j = 0; j < M; ++j) {
            if (gameBoard[i][j] != 0) {
                context.fillStyle = getColor(gameBoard[i][j]);
                context.fillRect(j * cellHeight, i * cellWidth, cellWidth - 1, cellHeight - 1);
            } else {
                context.fillStyle = "#FF0000";
                context.fillRect(j * cellHeight, i * cellWidth, cellWidth - 1, cellHeight - 1);
            }
        }
    }
}