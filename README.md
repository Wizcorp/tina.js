# TINA

Tweening and INterpolations for Animation

Animation library to easily create and customisable tweens, timelines, sequences and other playable components.

* Easy to use, friendly API
* Easy to debug
* High performance (optimised for speed)
* Open source and MIT License
* A consequent library of easing and interpolation methods
* A variety of components such as Timeline, Sequence, Delay and Recorder
* High flexibility (tween parameters can easily be modified after creation and even when they are running)
* High customizability (possibility to integrate custo, easing and interpolation functions and playable components)
* Running options (delay, speed, iterations, pingpong, persist) (Coming soon)
* Possibility to alter objects while they are tweening (enabled by relative tweening) (Coming soon)
* Good synchronisation between tweens
* No rounding errors on classical tweens (the last property value is guaranteed to be reached)
* Managed loss of focus of the page (user changes tab or minimise the application)
* Creation and removal of tweens within the callback of another tween will not result in any unwanted side effect

## How to use

Include tina's build in your html using either the [minified library](https://raw.githubusercontent.com/Wizcorp/tina/master/build/tina.min.js) or the [unminified version](https://raw.githubusercontent.com/Wizcorp/tina/master/build/tina.js).

```html
<script src="tina.min.js"></script>
```

## API

To create and start a tween (it will be automaticall updated):
```
	var myObject = { x: 0 };
	var duration = 2;
	var myTween = new TINA.Tween(myObject, ['x']).to(duration, { x: 1 }).start();
```

To create and start a tween on several properties:
```
	var myObject = { x: 0, y: 5 };
	var duration = 2;
	var myTween = new TINA.Tween(myObject, ['x', 'y']).to(duration, { x: 1, y: 0 }).start();
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

To use an easing function:
```
	var myObject = { x: 0 };
	var easingParameter = 2;
	var myTween = new TINA.Tween(myObject, ['abc']).to(duration, { x: 1 }, 'elasticInOut', easingParameter).start();
```

To use interpolation functions (allows to tween other types that number):
```
	var myObject = { vec: [0, 1, 0] };
	var myTween = new TINA.Tween(myObject, ['abc']).interpolations({ abc: 'vector' }).to(duration, { vec: [0, 2, 1] }).start();
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

## How to build
You would need to have component and uglify installed

```
	npm install -g component
	npm install -g uglifyjs
```

```
	component build; mv build/build.js build/tina.js; uglifyjs build/tina.js -o build/tina.min.js
```

Made in [Wizcorp](http://www.wizcorp.jp).