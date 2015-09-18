function Sprite(image) {
	this.image    = image;
	this.x        = 0;
	this.y        = 0;
	this.pivotX   = 0;
	this.pivotY   = 0;
	this.scale    = 1;
	this.rotation = 0;
	this.alpha    = 1;

	if (image.width) {
		this.pivotX = image.width  / 2;
		this.pivotY = image.height / 2;
	} else {
		var self = this;

		function onImageLoad() {
			self.pivotX = this.width / 2;
			self.pivotY = this.height / 2;
			this.removeEventListener('load', onImageLoad);
		}
		
		image.addEventListener('load', onImageLoad);
	}
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
