var image   = document.getElementById('image');
var canvas  = document.getElementById('canvas');
var ctx     = canvas.getContext('2d');
var sprite  = new Sprite(image);

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

TINA.onUpdate(function update(t, dt) {
	// At this point, all my tweens are up to date for the current iteration
	ctx.clearRect(0, 0, 400, 400);
	sprite.draw(ctx);
});

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

var duration = 2000;
var bouncing = 4;

TINA.Tween(sprite, ['x', 'rotation'])
	.from({ x:   0, rotation: 0 })
	.to({   x: 500, rotation: 9 }, duration)
	.iterations(Infinity) // loop forever
	.start();

TINA.Tween(sprite, ['y'])
	.from({ y: -100 })
	.to({   y:  300 }, duration, TINA.easing.bounceOut, bouncing) // using bounce easing for y position
	.iterations(Infinity) // loop forever
	.start();
