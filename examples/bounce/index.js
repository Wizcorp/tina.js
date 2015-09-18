var image   = document.getElementById('image');
var canvas  = document.getElementById('canvas');
var ctx     = canvas.getContext('2d');
var sprite  = new Sprite(image);

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

TINA.onUpdate(function update(t, dt) {
	// At this point, all my tweens are up to date for the current iteration
	ctx.clearRect(0, 0, 400, 400);
	sprite.draw(ctx);
});

createAnimation();
