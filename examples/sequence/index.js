var image   = document.getElementById('image');
var canvas  = document.getElementById('canvas');
var ctx     = canvas.getContext('2d');
var sprites = [];

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

TINA.onUpdate(function update(t, dt) {
	// At this point, all my tweens are up to date for the current iteration
	ctx.clearRect(0, 0, 400, 400);
	for (var i = 0; i < sprites.length; i++) {
		sprites[i].draw(ctx);
	}
});

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

sprites.push(new Sprite(image, { x: 100, y: 300 }));
sprites.push(new Sprite(image, { x: 200, y: 300 }));
sprites.push(new Sprite(image, { x: 300, y: 300 }));

var motionDuration = 400;
var sequence = new TINA.Sequence()
	.add(
		new TINA.Tween(sprites[0], ['y'])
			.from({ y: 300 })
			.to({ y: 100 }, motionDuration)
			.iterations(2)
			.pingpong(true)
	)
	.add(
		new TINA.Tween(sprites[1], ['y'])
			.from({ y: 300 })
			.to({ y: 100 }, motionDuration)
			.iterations(2)
			.pingpong(true)
	)
	.add(
		new TINA.Tween(sprites[2], ['y'])
			.from({ y: 300 })
			.to({ y: 100 }, motionDuration)
			.iterations(2)
			.pingpong(true)
	)
	.addDelay(100)
	.iterations(Infinity)
	.start();

