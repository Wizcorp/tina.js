var image   = document.getElementById('image');
var canvas  = document.getElementById('canvas');
var ctx     = canvas.getContext('2d');
var sprite  = null;

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
function createAnimation(x, y) {
	var duration = 1500;
	var easingParameter = 4;

	TINA.Tween(sprite, ['x', 'rotation'])
		.from({ x:   0, rotation: 0 })
		.to({   x: 500, rotation: 9 }, duration)
		.iterations(Infinity)
		.start();

	TINA.Tween(sprite, ['y'])
		.from({ y: -100 })
		.to({   y:  300 }, duration, TINA.easing.bounceOut, easingParameter)
		.iterations(Infinity)
		.start();
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

function Sprite() {
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
	ctx.drawImage(image, 0, 0);
	ctx.restore();
};

sprite = new Sprite();

TINA.onUpdate(function update(t, dt) {
	// At this point, all my tweens are up to date for the current iteration
	ctx.clearRect(0, 0, 400, 400);
	sprite.draw(ctx);
});

createAnimation();

