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

var sequence = new TINA.Sequence()
	.add(
		new TINA.Tween(sprites[0], ['x', 'y'])
			.from({ x: 100, y: 300 })
			.to({   x: 100, y: 100 }, 500)
			.iterations(2)
			.pingpong(true)
	)
	.add(
		new TINA.Tween(sprites[1], ['x', 'y'])
			.from({ x: 200, y: 300 })
			.to({   x: 200, y: 100 }, 500)
			.iterations(2)
			.pingpong(true)
	)
	.add(
		new TINA.Tween(sprites[2], ['x', 'y'])
			.from({ x: 300, y: 300 })
			.to({   x: 300, y: 100 }, 500)
			.iterations(2)
			.pingpong(true)
	)
	.addDelay(100)
	.iterations(Infinity)
	.start();