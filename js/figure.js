var FIGURE_CODE = { CUBE: 0, LINE: 1, VISOR1: 2, VISOR2: 3, STAIR1: 4, STAIR2: 5, LEDGE: 6 };
var MAX_FIGURE_CODE = 7
function Figure(figureCode, colorCode) {
    this.code = figureCode;
    this.colorCode = colorCode;
    // координаты появления
    this.j = Math.floor((M - 3) / 2);
    this.i = 0; // todo -2
    var c = colorCode;
    switch (figureCode) {
        case FIGURE_CODE.LINE:
            this.data = [
                [0, c, 0],
                [0, c, 0],
                [0, c, 0],
            ];
            break;
        case FIGURE_CODE.VISOR1:
            this.data = [
                [0, c, c],
                [0, c, 0],
                [0, c, 0],
            ];
            break;
        case FIGURE_CODE.VISOR2:
            this.data = [
                [c, c, 0],
                [0, c, 0],
                [0, c, 0],
            ];
            break;
        case FIGURE_CODE.STAIR1:
            this.data = [
                [0, 0, c],
                [0, c, c],
                [0, c, 0],
            ];
            break;
        case FIGURE_CODE.STAIR2:
            this.data = [
                [c, 0, 0],
                [c, c, 0],
                [0, c, 0],
            ];
            break;
        case FIGURE_CODE.LEDGE:
            this.data = [
                [0, c, 0],
                [0, c, c],
                [0, c, 0],
            ];
            break;
            //case FIGURE_CODE.CUBE:
        default:
            this.data = [
                [0, 0, 0],
                [0, c, c],
                [0, c, c],
            ];
            break;
    }
}
function copyFigure(figureDst, figureSrc) {
    figureDst.code = figureSrc.code;
    figureDst.j = figureSrc.j;
    figureDst.i = figureSrc.i;
    var i, j;
    for (i = 0; i < 3; ++i)
        for (j = 0; j < 3; ++j)
            figureDst.data[i][j] = figureSrc.data[i][j];
}
