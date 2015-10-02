var image = document.getElementById('image');
var ctx   = document.getElementById('canvas').getContext('2d');

var nestedObject = {
	a: new Sprite(image, { x: 100, y: 200 }),
	b: new Sprite(image, { x: 300, y: 200 })
};

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

TINA.onUpdate(function update(t, dt) {
	// At this point, all my tweens are up to date for the current iteration
	ctx.clearRect(0, 0, 400, 400);
	nestedObject.a.draw(ctx);
	nestedObject.b.draw(ctx);
});

//▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄

TINA.NestedTween(nestedObject, ['a.rotation', 'b.rotation'])
	.from({ a: { rotation: 0 }, b: { rotation: 5 } })
	.to(  { a: { rotation: 5 }, b: { rotation: 0 } }, 1000)
	.pingpong(true)
	.iterations(Infinity)
	.start();
