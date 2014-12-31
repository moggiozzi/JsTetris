function getBrowserName() {
        var ua = navigator.userAgent;
        var name = function () {
            if (ua.search(/MSIE/) > -1) return "ie";
            if (ua.search(/Firefox/) > -1) return "firefox";
            if (ua.search(/Opera/) > -1) return "opera";
            if (ua.search(/Chrome/) > -1) return "chrome";
            if (ua.search(/Safari/) > -1) return "safari";
            if (ua.search(/Konqueror/) > -1) return "konqueror";
            if (ua.search(/Iceweasel/) > -1) return "iceweasel";
            if (ua.search(/SeaMonkey/) > -1) return "seamonkey";}();
		return name;
}

/**
 * Draws a rounded rectangle using the current state of the canvas. 
 * If you omit the last three params, it will draw a rectangle 
 * outline with a 5 pixel border radius 
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate 
 * @param {Number} width The width of the rectangle 
 * @param {Number} height The height of the rectangle
 * @param {Number} radius The corner radius. Defaults to 5;
 * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
}

function cornerRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == "undefined") {
        stroke = true;
    }
    if (typeof radius === "undefined") {
        radius = 5;
    }
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.lineTo(x + width - radius, y + radius);
    ctx.lineTo(x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.lineTo(x + width - radius, y + height - radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.lineTo(x + radius, y + height - radius);
    ctx.lineTo(x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.lineTo(x + radius, y + radius);
    ctx.lineTo(x + radius, y);
    ctx.closePath();
    if (stroke) {
        ctx.stroke();
    }
    if (fill) {
        ctx.fill();
    }
}

function Rect(x_,y_,w_,h_) {
    this.x = x_ || 0;
    this.y = y_ || 0;
    this.w = w_ || 0;
    this.h = h_ || 0;
    this.x2 = function(){return this.x+this.w;}
    this.y2 = function(){return this.y+this.h;}
    this.cx = function(){return this.x+this.w/2;}
    this.cy = function(){return this.y+this.h/2;}
    this.eq = function(r){
        return this.x == r.x && this.y == r.y &&
            this.w == r.w && this.h == r.h; }
}

function AnimatedRect(startRect_, stopRect_, framesCount_)
{
    this.dx = Math.round((stopRect_.x - startRect_.x)/10);
    this.dy = Math.round((stopRect_.y - startRect_.y) / 10);
    this.dw = Math.round((stopRect_.w - startRect_.w) / 10);
    this.dh = Math.round((stopRect_.h - startRect_.h) / 10);
    this.stopRect = stopRect_;
    this.currRect = startRect_;
    this.framesCount = framesCount_ || 10;
    this.next = function(){
        if (Math.abs(this.currRect.x - this.stopRect.x) >= Math.abs(this.dx))
            this.currRect.x += this.dx;
        else
            this.currRect.x = this.stopRect.x;
        if (Math.abs(this.currRect.y - this.stopRect.y) >= Math.abs(this.dy))
            this.currRect.y += this.dy;
        else
            this.currRect.y = this.stopRect.y
        if (Math.abs(this.currRect.w - this.stopRect.w) >= Math.abs(this.dw))
            this.currRect.w += this.dw;
        else
            this.currRect.w = this.stopRect.w;
        if (Math.abs(this.currRect.h - this.stopRect.h) >= Math.abs(this.dh))
            this.currRect.h += this.dh;
        else
            this.currRect.h = this.stopRect.h;
    }
    this.isAnimFinish = function(){return this.currRect.eq(this.stopRect);}
}