var canvas  = document.createElement('canvas');
var context = canvas.getContext('2d');

console.log('Got a context', context);

// var myTweener = new TINA.Timer(60).debug(true).start();

// myTweener.onUpdate(function (dt) {
// 	console.log('updating!!', dt, objectA.x, objectB.x);
// });

var objectA = {
	x: 20,
	y: 10,
	vec: [0, 1, 2],
	abc: 'Hello'
}

var objectB = {
	vec: [0, 1, 2],
	abc: 'Hello'
}

var transition1 = {
	x: 5,
	y: 10,
	abc: 'World',
	vec: [2, 1, 0]
}

var transition2 = {
	x: 10,
	y: 5,
	abc: 'Hello',
	vec: [0, 1, 2]
}

// var myTweener1 = new Timer(60).start();
// var myTweener2 = new Timer(60).start();
// var myTweener3 = new Timer(60).start();

// TINA.onUpdate(function (time, dt) {

// });

// var onComplete = function () {
// 	var myTween = new TINA.Tween(objectA, ['x']).from(transition2).to(100, transition1).start();
// 	myTween.onComplete(onComplete);
// }

// var nbTweens = 100000;
// for (var i = 0; i < nbTweens; i += 1) {
// 	var myTweenA = new TINA.Tween(objectA, ['x']).from(transition2).to(100, transition1).start();
// 	// var myTweenA = new TINA.Tween(objectA, ['abc', 'vec']).interpolations({ abc: 'string', vec: 'vector' }).to(100, transition1, 'flash', 1).start();

// 	// myTweenA.onUpdate(function (time, dt) {
// 	// 	console.log('updating tweenA!', time, dt, objectA.abc, objectA.vec);
// 	// 	// this.goToBeginning();
// 	// });


// 	myTweenA.onComplete(onComplete);
// }

var myTweenA = new TINA.Tween(objectA, ['x', 'y']).to(1, transition1).start();
// var myTweenA = new TINA.Tween(objectA, ['abc', 'vec']).interpolations({ abc: 'string', vec: 'vector' }).to(100, transition1, 'flash', 1).start();

myTweenA.onUpdate(function (time, dt) {
	console.log('updating myTweenA!', time, dt, objectA);
	// this.goToBeginning();
});

// myTweenA.onComplete(function (overflow) {
// 	console.log('completed myTweenA!', overflow);
// 	// console.log('DadoudaA!', overflow);
// });

// var myTweenB = new TINA.Tween(objectB, ['abc', 'vec']).interpolations({ abc: 'string', vec: 'vector' }).to(20, transition1).to(10, transition2).start();

// myTweenB.onUpdate(function (time, dt) {
// 	console.log('updating myTweenB!', time, dt, objectB.abc, objectB.vec);
// 	// this.goToBeginning();
// });

// myTweenB.onComplete(function (overflow) {
// 	console.log('completed myTweenB!', overflow);
// });


// var myTimeline = new TINA.Timeline().add(0, myTweenA).add(205, myTweenB).start();

// // myTimeline.onUpdate(function (time, dt) {
// // 	console.log('UPDATING TIMELING', time, dt, objectA, objectB, myTimeline._duration);
// // });

// myTimeline.onComplete(function (overflow) {
// 	console.log('completed timeline', overflow, objectA, objectB);
// });

// var mySequence = new TINA.Sequence().add(myTweenA).wait(50).add(myTweenB).start();

// mySequence.onUpdate(function (time, dt) {
// 	console.log('UPDATING Sequence', time, dt, objectA, objectB, mySequence._duration);
// });

var tweeners = TINA.getRunningTweeners();
console.log('My tweener is', tweeners);

