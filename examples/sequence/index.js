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
			.onStart(function () {
				console.log('starting 0!')
			})
			.onUpdate(function (t, dt) {
				console.log('updating 0!', t, dt)
			})
			.onComplete(function (overflow) {
				console.log('completing 0!', overflow)
			})
			.iterations(2)
			.pingpong(true)
	)
	.add(
		new TINA.Tween(sprites[1], ['y'])
			.from({ y: 300 })
			.to({ y: 100 }, motionDuration)
			.onStart(function () {
				console.log('starting 1!')
			})
			.onUpdate(function (t, dt) {
				console.log('updating 1!', t, dt)
			})
			.onComplete(function (overflow) {
				console.log('completing 1!', overflow)
			})
			.iterations(2)
			.pingpong(true)
	)
	.add(
		new TINA.Tween(sprites[2], ['y'])
			.from({ y: 300 })
			.to({ y: 100 }, motionDuration)
			.onStart(function () {
				console.log('starting 2!')
			})
			.onUpdate(function (t, dt) {
				console.log('updating 2!', t, dt)
			})
			.onComplete(function (overflow) {
				console.log('completing 2!', overflow)
			})
			.iterations(2)
			.pingpong(true)
	)
	// .addDelay(100)
	.iterations(2)
	// .pingpong(true)
	.start();



//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
sequence.onUpdate(function update(t, dt) {
		console.log('sequence time', t, dt)
	// At this point, all my tweens are up to date for the current iteration
	// console.log('**** NEW UPDATE ****');
	// console.log(t, dt);
	// console.log(sprites[0].y);
	// console.log(sprites[1].y);
	// console.log(sprites[2].y);
});

