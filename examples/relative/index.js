var image   = document.getElementById('image');
var canvas  = document.getElementById('canvas');
var ctx     = canvas.getContext('2d');
var sprite  = new Sprite(image, { y: 200 });

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

TINA.onUpdate(function update(t, dt) {
	// At this point, all my tweens are up to date for the current iteration
	ctx.clearRect(0, 0, 400, 400);
	sprite.draw(ctx);
});

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

new TINA.Tween(sprite, ['x', 'rotation'])
	.relative(true)
	.iterations(Infinity)
	.pingpong(true)
	.from({ x: 100, rotation: -3 })
	.to({   x: 300, rotation:  3 }, 2000, TINA.easing.sineInOut)
	.start();

new TINA.Tween(sprite, ['x', 'rotation'])
	.relative(true)
	.iterations(Infinity)
	.pingpong(true)
	.from({ x: -30, rotation: -0.5 })
	.to({   x:  30, rotation:  0.5 }, 260, TINA.easing.sineInOut)
	.start();
