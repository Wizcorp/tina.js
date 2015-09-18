function Sprite(image) {
	this.image    = image;
	this.x        = 0;
	this.y        = 0;
	this.pivotX   = image.width  / 2;
	this.pivotY   = image.height / 2;
	this.scale    = 1;
	this.rotation = 0;
	this.alpha    = 1;
}

Sprite.prototype.draw = function (ctx) {
	ctx.save();
	ctx.globalAlpha *= this.alpha;
	ctx.translate(this.x , this.y);
	ctx.rotate(this.rotation);
	ctx.scale(this.scale, this.scale);
	ctx.translate(-this.pivotX, -this.pivotY);
	ctx.drawImage(this.image, 0, 0);
	ctx.restore();
};
