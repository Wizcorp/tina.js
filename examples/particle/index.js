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

function createAnimation(x, y) {
	for (var i = 0; i < sprites.length; i++) {
		var sprite = sprites[i];
		sprite.scale = 0.5 * Math.random() + 0.1;

		var tween = TINA.Tween(sprite, ['x', 'y', 'rotation', 'alpha']);
		var duration = 300 + Math.random() * 200;
		var easingParameter = 1;

		tween.from({
			x: x,
			y: y,
			rotation: 0,
			alpha: 1
		});

		tween.to({
			x: x + (Math.random() - 0.5) * 400,
			y: y + (Math.random() - 0.5) * 400,
			rotation: 10 * (Math.random() - 0.5),
			alpha: 0
		}, duration, TINA.easing.expOut, easingParameter);

		tween.start();
	}
}

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
for (var i = 0; i < 100; i++) {
	sprites.push(new Sprite(image));
}

function triggerParticles() {
	var x = Math.random() * 400;
	var y = Math.random() * 400;
	createAnimation(x, y);

	TINA.Delay(500)
		.onComplete(triggerParticles)
		.start();
}

triggerParticles();

// canvas.addEventListener('mousedown', function onTap(e) {
// 	e.preventDefault();
// 	createAnimation(e.layerX, e.layerY);
// }, false);