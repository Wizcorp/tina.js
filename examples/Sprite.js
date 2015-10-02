function Sprite(image, params) {
	params = params || {};

	this.image    = image;
	this.x        = params.x        || 0;
	this.y        = params.y        || 0;
	this.pivotX   = params.pivotX   || 0;
	this.pivotY   = params.pivotY   || 0;
	this.rotation = params.rotation || 0;
	this.scale    = params.scale    || 1;
	this.alpha    = params.alpha !== undefined ? params.alpha : 1;
}

Sprite.prototype.draw = function (ctx) {
	ctx.save();
	ctx.globalAlpha *= this.alpha;
	ctx.translate(this.x , this.y);
	ctx.rotate(this.rotation);
	ctx.scale(this.scale, this.scale);
	ctx.translate(-this.pivotX - this.image.width / 2, -this.pivotY - this.image.height / 2);
	ctx.drawImage(this.image, 0, 0);
	ctx.restore();
};
