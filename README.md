# TINA

[![Install with NPM](https://nodei.co/npm/tina.png?downloads=true&stars=true)](https://nodei.co/npm/tina/)

**Tweening and INterpolations for Animation**

Animation library to easily create customisable tweens, timelines, sequences and other playable components.

* **Easy to use**, friendly API
* **Easy to debug**
* **High performance** (optimised for speed)
* **Open source** and MIT License
* A consequent library of easing and interpolation methods
* A variety of components such as **Timeline**, **Sequence** and **Recorder**
* **High flexibility** (tween parameters can easily be modified after creation and even when they are running)
* **High customizability** (possibility to integrate custom easing and interpolation functions and playable components)
* Good synchronisation between tweens
* No rounding errors on classical tweens (the last property value is guaranteed to be reached)
* Managed loss of focus of the page (user changes tab or minimise the application)
* Creation and removal of tweens within the callback of another tween will not result in any unwanted side effect

* Coming Soon: Running options (delay, speed, iterations, pingpong, persist)
* Coming Soon: Possibility to alter objects while they are tweening (enabled by relative tweening)

## How to use

Include tina's build in your html using either the [minified library](https://raw.githubusercontent.com/Wizcorp/tina/master/build/tina.min.js) or the [unminified version](https://raw.githubusercontent.com/Wizcorp/tina/master/build/tina.js).

```html
<script src="tina.min.js"></script>
```

## API

Existing playable components are: Tween, Timeline, Sequence, Recorder, Delay.
The following is a non-exhaustive list of possibilities offered by the API.

To create and start a **tween** (it will be automaticall updated):
``` javascript
	var myObject = { x: 0 };
	var duration = 2; // in seconds
	var myTween = new TINA.Tween(myObject, ['x']).to(duration, { x: 1 }).start();
```

To create a **tween** without affecting it to a variable:
``` javascript
	TINA.Tween(myObject, ['x']).to(duration, { x: 1 }).start();
```

To tween an **array**:
``` javascript
	var myArray = [0, 1, 0];
	var myTween = new TINA.Tween(myArray)
		.to(duration, [0, 2, 1])
		.start();
```

To create and start a tween on **several properties**:
``` javascript
	var myTween = new TINA.Tween(myObject, ['x', 'y'])
		.to(duration, { x: 1, y: 0 })
		.start();
```

To create **several transitions**:
``` javascript
	var myTween = new TINA.Tween(myObject, ['x'])
		.to(duration1, { x: 1 })
		.to(duration2, { x: 2 })
		.start();
```

To start a tween after a given **delay**:
``` javascript
	var myTween = new TINA.Tween(myObject, ['x']).to(duration, { x: 1 }).delay(1);
```

To add **callbacks** on specific events:
``` javascript
	var myTween = new TINA.Tween(myObject, ['x'])
		.to(duration, { x: 1 })
		.onStart(function () {
			console.log('Tweening will now start');
		})
		.onUpdate(function (time, dt) {
			console.log('My object at time', time, 'is', myObject);
		})
		.onComplete(function () {
			console.log('Tweening is complete');
		})
		.delay(1);
```

To use an **easing** function:
``` javascript
	var myObject = { x: 0 };
	var easingParameter = 2;

	var myTween = new TINA.Tween(myObject, ['x'])
		.to(duration, { x: 1 }, 'elasticInOut', easingParameter)
		.start();
	// or
	var myTween = new TINA.Tween(myObject, ['x'])
		.to(duration, { x: 1 }, TINA.easing.elasticInOut, easingParameter)
		.start();
```

To use **interpolation** functions:
``` javascript
	var myObject = { abc: 'Hello' };

	var myTween = new TINA.Tween(myObject, ['abc'])
		.interpolations({ abc: 'string' })
		.to(duration, { abc: 'World' })
		.start();
	// or
	var myTween = new TINA.Tween(myObject, ['abc'])
		.interpolations({ abc: TINA.interpolation.string })
		.to(duration, { abc: 'World' })
		.start();
```

To create a **timeline**:
``` javascript
	var timePosTweenA = 0;
	var timePosTweenB = 2;
	var myTimeline = new TINA.Timeline()
		.add(timePosTweenA, myTweenA)
		.add(timePosTweenB, myTweenB)
		.start();
```

To create a **sequence**:
``` javascript
 	// 1 second delay between the end of myTweenB and the start of myTweenC
	var mySequence = new TINA.Sequence()
		.add(myTweenA)
		.add(myTweenB)
		.addDelay(1)
		.add(myTweenC)
		.start();
```

### Tweener

A **tweener** is responsible for tweening playable components.
The tweener can be either a **timer** or a **ticker**.

If no tweener is specified, any started playable will be tweened by the default tweener.
``` javascript
	// myTween will be tweened by the default tweener
	var myTween = new TINA.Tween(myObject, ['x'])
		.to(1, { x: 5 })
		.start();
```

To manually specify a tweener for a playable component:
``` javascript
	// myTween will be tweened by myTimer
	var myTween = new TINA.Tween(myObject, ['x'])
		.to(1, { x: 5 })
		.tweener(myTweener)
		.start();
```

To specify the default tweener for every tween:
``` javascript
	// I choose a timer as my tweener
	var myTimer = new TINA.Timer().useAsDefault();
	// myTween will be attached to myTimer and will take 0.5 seconds to tween
	var myTween = new TINA.Tween(myObject, ['x']).to(30, { x: 5 }).start();
```

#### Timer
At every update the timer increases the time of all its tweens by a time proportional to the time elapsed since the previous update.
To create a default timer that will update automatically:
``` javascript
	var tups = 60;
	var myTimer = new TINA.Timer(tups).useAsDefault().start();
```

To create a timer and update it manually:
``` javascript
	var myTimer = new TINA.Timer();
	TINA.add(myTimer);

	function update() {
	 	TINA.update();
	 	requestAnimationFrame(update);
	}

	requestAnimationFrame(update);
```

It is possible to specify the speed at which time will elapse for the timer.
This flexbility allows the user to use units that he is comfortable with:

Either 1 unit per second, 24 u/s, 60 u/s or 1000 u/s (or even 237.6 u/s if you come from another planet).

By default the timer goes at a speed of 1 unit per second.
The following example demonstrates how to create a timer that goes at a speed of 60 units per second.
Therefore, at 60 updates per second, each new update increases the time of the timer by 1.
``` javascript
	var tups = 60; // Time units per second
	var myTimer = new TINA.Timer(tups);
```

Effect of changing the tups of a timer:
``` javascript
	var myTimer1 = new TINA.Timer(1);
	var myTimer60 = new TINA.Timer(60);
	var myTimer1000 = new TINA.Timer(1000);

	// The following will tween myObject in 10 seconds
	TINA.Tween(myObject, ['x']).to(10, { x: 1}).tweener(myTimer1);

	// The following will tween myObject in 1 / 6 seconds
	TINA.Tween(myObject, ['x']).to(10, { x: 1}).tweener(myTimer60);

	// The following will tween myObject in 0.01 seconds
	TINA.Tween(myObject, ['x']).to(10, { x: 1}).tweener(myTimer1000);
```

#### Ticker
At every update the time is increased by a fixed amount.

To create a ticker with **automatic updates**:
``` javascript
	var myTicker = new TINA.Ticker().start();
```

To create a ticker and update it manually:
``` javascript
	var myTicker = new TINA.Ticker();
	TINA.add(new TINA.Ticker());

	function update() {
	 	TINA.update();
	 	requestAnimationFrame(update);
	}

	requestAnimationFrame(update);
```

Similarly to a timer it is possible to specify how fast the time goes for a ticker.
At every update the time will increase by the specified tupt:
``` javascript
	var tupt = 2; // Time units per tick/update
	var myTicker = new TINA.Ticker(tupt);
```

In the case when tweeners automatically update, TINA can be used as the main loop of the application.
``` javascript
	// t is the total time elapsed since TINA started
	// dt is the time elapsed since the previous update of TINA
	// both durations are in milliseconds
	TINA.onUpdate(function (t, dt) {
		myGameLogic.update(t, dt);
		myPhysics.update(dt);
		myRenderer.update();
		...
	});
```

## How to build
You would need to have component and uglify installed:

```
	npm install -g component
	npm install -g uglifyjs
```

If component and uglify are already install, use the following command to build:
```
	component build; mv build/build.js build/tina.js; uglifyjs build/tina.js -o build/tina.min.js
```

Made in [Wizcorp](http://www.wizcorp.jp).