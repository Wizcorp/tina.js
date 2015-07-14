# TINA
**Tweening and INterpolations for Animation**

[![Install with NPM](https://nodei.co/npm/tina.png?downloads=true&stars=true)](https://nodei.co/npm/tina/)

## Warning: Still in beta version!

Javascript Animation Library to easily create customisable tweens, timelines, sequences and other playable components.

* **Easy to use** (API strongly inspired by Tweenjs)
* **Easy to debug** (Proper warnings)
* **High performance** (Competitive with Tweenjs)
* **High flexibility** (tween parameters can easily be modified after creation and even when they are running)
* **High customizability** (possibility to use custom easing and interpolation functions and playable components)
* **Running options** (delay, iterations, pingpong, persist and speed)
* **Open source** and MIT License (use it as you please)
* A consequent library of **easing and interpolation methods**
* A variety of components such as **Timeline** and **Sequence** (**Recorder** coming soon)
* **Good synchronisation** between tweens
* **Relative tweening** enables the possibility to alter objects while they are tweening
* **Nested object tweening** enables the possibility to alter nested objects using a single tween
* Bonus: Creation and removal of tweens within the callback of another tween will not result in any unwanted side effect

## How to use

Include tina's build in your html using either the [minified library](https://raw.githubusercontent.com/Wizcorp/tina/master/build/tina.min.js) or the [unminified version](https://raw.githubusercontent.com/Wizcorp/tina/master/build/tina.js).

```html
<script src="tina.min.js"></script>
```

## API

Existing playable components are: Tween, Timeline, Sequence, Timer, Ticker, Recorder, Delay.
The following is a non-exhaustive list of possibilities offered by the API.

### Tween
To create and start a **tween** (it will be automatically updated):
``` javascript
	var myObject = { x: 0 };
	var propertiesToTween = ['x'];
	var duration = 500; // in milliseconds
	var myTween = new TINA.Tween(myObject, propertiesToTween)
		.to({ x: 1 }, duration)
		.start();
```

To create and start a **tween** without affecting it to a variable:
``` javascript
	TINA.Tween(myObject, ['x'])
		.to({ x: 1 }, duration)
		.start();
```

To tween an **array**:
``` javascript
	var myArray = [0, 1, 0];
	var myTween = new TINA.Tween(myArray)
		.to([0, 2, 1], duration)
		.start();
```

To tween **several properties**:
``` javascript
	var myTween = new TINA.Tween(myObject, ['x', 'y'])
		.to({ x: 1, y: 0 }, duration)
		.start();
```

To chain **several transitions**:
``` javascript
	var myTween = new TINA.Tween(myObject, ['x'])
		.to({ x: 1 }, duration1)
		.to({ x: 2 }, duration2)
		.start();
```

To **ease** the tweening:
``` javascript
	var myObject = { x: 0 };
	var easingParameter = 2;

	var myTween = new TINA.Tween(myObject, ['x'])
		.to({ x: 1 }, duration, 'elasticInOut', easingParameter)
		.start();
	// or
	var myTween = new TINA.Tween(myObject, ['x'])
		.to({ x: 1 }, duration, TINA.easing.elasticInOut, easingParameter)
		.start();
```

To use **interpolation** functions:
``` javascript
	var myObject = { abc: 'Hello' };

	var myTween = new TINA.Tween(myObject, ['abc'])
		.to({ abc: 'World' }, duration)
		.interpolations({ abc: 'string' })
		.start();
	// or
	var myTween = new TINA.Tween(myObject, ['abc'])
		.to({ abc: 'World' }, duration)
		.interpolations({ abc: TINA.interpolation.string })
		.start();
```

To start tweening after a given **delay**:
``` javascript
	var myTween = new TINA.Tween(myObject, ['x'])
		.to({ x: 1 }, duration)
		.delay(1000);
```

To add **callbacks** on specific events:
``` javascript
	var myTween = new TINA.Tween(myObject, ['x'])
		.to({ x: 1 }, duration)
		.onStart(function () {
			console.log('Tweening will now start');
		})
		.onUpdate(function (time, dt) {
			console.log('My object at time', time, 'is', myObject);
		})
		.onComplete(function () {
			console.log('Tweening is complete');
		})
		.delay(1000);
```

### NestedTween
Nested tweens give the ability to tween nested objects using a single tween.
A nested tween allows to interpolation between the given nested objects.
To tween a **nested tween**:
``` javascript
	var nestedObject = {
		position: { x: 0, y: 0 },
		alpha: 0
	}

	var myNestedTween = new TINA.NestedTween(nestedObject, ['position.x', 'position.y', 'alpha'])
	.to({
		position: { x: 10, y: 20 },
		alpha: 1
	}, 500)
	.start();
```
Note: the NestedTween API remains identical to Tween and all the functionalities of Tween are available to a NestedTween object.

### Timeline
Timelines are used to play tweens in parallel.
To create a **timeline**:
``` javascript
	var timePosTweenA = 0;
	var timePosTweenB = 2000;
	var myTimeline = new TINA.Timeline()
		.add(timePosTweenA, myTweenA)
		.add(timePosTweenB, myTweenB)
		.start();
```

### Sequence
Sequences are used to chain tweens.
To create a **sequence**:
``` javascript
 	// 1 second delay between the end of myTweenB and the start of myTweenC
	var mySequence = new TINA.Sequence()
		.add(myTweenA)
		.add(myTweenB)
		.addDelay(1000)
		.add(myTweenC)
		.start();
```

### Delay
To create a **delay**:
``` javascript
	var myDelay = new TINA.Delay(duration);
```
Delays can be used as a ```setTimeout``` that would be synchronised with all the other tweens.
It can also be used to apply some treatment to objects for a given duration.
For example, moving a particle for a fixed duration and then destroy it:
``` javascript
	var particleSpeedX = 5;
	var particleSpeedY = 0;
	var myParticle = new Particle();
	Delay(duration)
		.onUpdate(function (time, dt) {
			myParticle.x += particleSpeedX * dt;
			myParticle.y += particleSpeedY * dt;

			particleSpeedX *= Math.pow(0.95, dt);
			particleSpeedY += gravity * dt;
		})
		.onComplete(function () {
			myParticle.destroy()
		})
		.start();
```

### Tweener

A **tweener** is responsible for tweening playable components.
The tweener can be either a **timer** or a **ticker**.

If no tweener is specified, any started playable will be tweened by the default tweener.
``` javascript
	// myTween will be tweened by the default tweener
	var myTween = new TINA.Tween(myObject, ['x'])
		.to({ x: 5 }, 1000)
		.start();
```

To manually specify a tweener for a playable component:
``` javascript
	// myTween will be tweened by myTweener
	var myTween = new TINA.Tween(myObject, ['x'])
		.to({ x: 5 }, 1000)
		.tweener(myTweener)
		.start();
```

To specify the default tweener for every tween:
``` javascript
	// I choose a timer as my default tweener
	var myTimer = new TINA.Timer().useAsDefault();
	// myTween will be attached to myTimer and will take 500 milliseconds to tween
	var myTween = new TINA.Tween(myObject, ['x']).to({ x: 5 }, 500).start();
```

#### Timer
At every update its internal time is increased by a fixed proportion of the time elapsed since the previous update.
To create a default timer that will update automatically:
``` javascript
	var myTimer = new TINA.Timer().useAsDefault().start();
```

To create a timer and update it manually:
``` javascript
	var myTimer = new TINA.Timer().useAsDefault();
	TINA.add(myTimer);

	function update() {
	 	TINA.update();
	 	requestAnimationFrame(update);
	}

	requestAnimationFrame(update);
```

It is possible to specify the speed at which time will elapse for the timer.
This flexbility allows the user to use units that he is comfortable with.
It could be ```1 unit per second```, ```24 ups```, ```60 ups``` or ```1000 ups``` (or even ```237.6 ups``` if you come from another planet).

By default the timer goes at a speed of 1000 units per second (milliseconds).
Every second, the time will increase by the given ```tups```:
``` javascript
	var tups = 60; // Time units per second
	var myTimer = new TINA.Timer(tups);
```

Effect of different values for the ```tups```:
``` javascript
	var myTimer1 = new TINA.Timer(1);
	var myTimer60 = new TINA.Timer(60);
	var myTimer1000 = new TINA.Timer(1000);

	// The following will tween myObject in 100 seconds
	TINA.Tween(myObject, ['x']).to({ x: 1 }, 100).tweener(myTimer1);

	// The following will tween myObject in 1.667 seconds
	TINA.Tween(myObject, ['x']).to({ x: 1 }, 100).tweener(myTimer60);

	// The following will tween myObject in 0.1 seconds
	TINA.Tween(myObject, ['x']).to({ x: 1 }, 100).tweener(myTimer1000);
```

#### Ticker
At every update its internal time is increased by a fixed amount.

To create a ticker with **automatic updates**:
``` javascript
	var myTicker = new TINA.Ticker().useAsDefault().start();
```

To create a ticker and update it manually:
``` javascript
	var myTicker = new TINA.Ticker().useAsDefault();
	TINA.add(new TINA.Ticker());

	function update() {
	 	TINA.update();
	 	requestAnimationFrame(update);
	}

	requestAnimationFrame(update);
```

Similarly to a timer it is possible to specify how fast the time goes for a ticker.
At every update the time will increase by the given ```tupt```:
``` javascript
	var tupt = 2; // Time units per tick/update
	var myTicker = new TINA.Ticker(tupt);
```

Effect of different values for the ```tupt```:
``` javascript
	var myTicker1 = new TINA.Ticker(1);
	var myTicker10 = new TINA.Ticker(10);
	var myTicker20 = new TINA.Ticker(20);

	// The following will tween myObject in 100 updates
	TINA.Tween(myObject, ['x']).to({ x: 1 }, 100).tweener(myTicker1);

	// The following will tween myObject in 10 updates
	TINA.Tween(myObject, ['x']).to({ x: 1 }, 100).tweener(myTicker10);

	// The following will tween myObject in 5 updates
	TINA.Tween(myObject, ['x']).to({ x: 1 }, 100).tweener(myTicker20);
```

#### TINA's update callback
In the case when tweeners automatically update, TINA can be used as the main loop of the application.
``` javascript
	// t is the total time elapsed since TINA started
	// dt is the time elapsed since the TINA's previous update
	// both durations are in milliseconds
	TINA.onUpdate(function (t, dt) {
		// At this point,
		// all my tweens are up to date
		// for the current iteration
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