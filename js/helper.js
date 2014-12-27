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

function AnimatedRect(start_, stop_, framesCount_)
{
    this.dx = (stop_.x - start_.x)/10;
    this.dy = (stop_.y - start_.y)/10;
    this.dw = (stop_.w - start_.w)/10;
    this.dh = (stop_.h - start_.h)/10;
    this.stop = stop_;
    this.curr = start_;
    this.framesCount = framesCount_ || 10;
    this.next = function(){
        if ( Math.abs( this.curr.x - this.stop.x ) >= Math.abs(this.dx) )
            this.curr.x += this.dx;
        else
            this.curr.x = this.stop.x;
        if ( Math.abs( this.curr.y - this.stop.y ) >= Math.abs(this.dy) )
            this.curr.y += this.dy;
        else
            this.curr.y = this.stop.y
        if ( Math.abs( this.curr.w - this.stop.w ) >= Math.abs(this.dw) )
            this.curr.w += this.dw;
        else
            this.curr.w = this.stop.w;
        if ( Math.abs( this.curr.h - this.stop.h ) >= Math.abs(this.dh) )
            this.curr.h += this.dh;
        else
            this.curr.h = this.stop.h;
    }
    this.isAnimFinish = function(){return this.curr.eq(this.stop);}
}