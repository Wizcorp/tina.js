# TINA

Tweening and INterpolations for Animation

Animation library to easily create and customisable tweens, timelines, sequences and other playable components.

## Why use TINA?
* Easy to use, friendly API
* Open source and MIT License
* High flexibility (tween parameters can easily be modified after creation and even when they are running)
* High customizability (possibility to integrate easing and interpolation functions)
* A consequent library of easing and interpolation methods
* Running options (delay, speed, iterations, pingpong, persist) (Coming soon)
* Easy to debug (thanks to a smart warning system)
* A variety of components such as Timeline, Sequence, Delay and Recorder
* Possibility to alter objects while they are tweening (enabled by relative tweening) (Coming soon)
* Optimised in speed for handling large amounts of tweens (also fast for small amounts)
* Good synchronisation between tweens
* No rounding errors on classical tweens (the last property value is guaranteed to be reached)
* Managed lost page focus
* Altering the state of a playable within the callback of another playable will not result in any unwanted side effect

## API

To create a tween and start it (it will be automaticall updated):
```
	var myObject = { x: 0 };
	var duration = 2;
	var myTween = new TINA.Tween(myObject, ['x']).to(duration, { x: 1 }).start();
```

To create several transitions:
```
	var myObject = { x: 0 };
	var duration1 = 2;
	var duration2 = 1;
	var myTween = new TINA.Tween(myObject, ['x']).to(duration1, { x: 1 }).to(duration2, { x: 2 }).start();
```

To start a tween after a given delay:
```
	var myTween = new TINA.Tween(myObject, ['x']).to(duration, { x: 1 }).delay(1);
```

To add callbacks on specific events:
```
	var myTween = new TINA.Tween(myObject, ['x']).to(duration, { x: 1 }).delay(1);

	myTween.onStart(function () {
		console.log('Tweening will now start');
	});

	myTween.onUpdate(function (time, dt) {
		console.log('My object at time', time, 'is', myObject);
	});

	myTween.onComplete(function () {
		console.log('Tweening is complete');
	});
```

To create a tweener:
```
	var myTweener = new TINA.Timer();
```

To create the tweener that updates automatically:
```
	var myTweener = new TINA.Timer().start();
```

To manually update TINA
```
	var myTweener = new TINA.Timer();
	var myTween = new TINA.Tween(myObject, ['x']).to(duration, { x: 1 }).start();
	onRequestAnimationFrame() {
		TINA.update();
	}
```

Made in [Wizcorp](http://www.wizcorp.jp).