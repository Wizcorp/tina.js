# TINA

**Tweening and INterpolations for Animation**

[![Install with NPM](https://nodei.co/npm/tina.png?downloads=true&stars=true)](https://nodei.co/npm/tina/)

A comprehensive, high performance, easy to use, open source animation library in JavaScript. 

* **Easy to use** (API strongly inspired by Tween.js)
* **Easy to debug** (Proper warnings)
* **High performance** (Competitive with Tweenjs and GSAP, benchmark coming soon)
* **High flexibility** (tween transitions can easily be modified after creation)
* **High customizability** (possibility to use custom easings, interpolations and components)
* **Running options** (delay, iterations, pingpong, persist and speed)
* **Open source** and MIT License (use it as you please)
* A consequent library of **easing and interpolation methods**
* A variety of components such as **Timeline**, **Sequence** and **Recorder** (**CSSTween** coming soon)
* **Good synchronisation** between tweens
* **Relative tweening** enables the possibility to alter objects while they are tweening
* **Nested object tweening** enables the possibility to alter nested objects using a single tween
* **Compatible with Node.js!**
* Bonus: Creation and removal of tweens within the callback of another tween will not result in any unwanted side effect (infamous bug of other tweening libraries)

Note: Do not hesitate to contribute by reporting issues or by submitting your own components and interpolations.

Warning: Still in beta version! Do not be shy, [report issues](https://github.com/Wizcorp/tina.js/issues)

## How to use

### In a browser
Include TINA's build in your html using either the [minified library](https://rawgit.com/Wizcorp/tina/master/build/tina.min.js) or the [unminified version](https://raw.githubusercontent.com/Wizcorp/tina/master/build/tina.js).

```html
<script src="tina.min.js"></script>
```

### In Node.js
Install TINA using ```npm install tina```, then require it:
```javascript
var TINA = require('tina');
```

## JSFiddle examples
- [bounce](http://jsfiddle.net/cstoquer/k8dghonL/)
- [particules](http://jsfiddle.net/cstoquer/eo5ex47b/)

## API

Existing playable components are: **Tween, NestedTween, Timeline, Sequence, Delay, Timer, Ticker, Recorder** (CSSTween coming soon).
The following is a non-exhaustive list of possibilities offered by TINA.

### Tween
To create and start a **tween** (it will be automatically updated):
``` javascript
var myObject = { x: 0 };
var properties = ['x'];
var duration = 500; // in milliseconds
var myTween = new TINA.Tween(myObject, properties)
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
	.interpolations({ abc: 'string' })
	.to({ abc: 'World' }, duration)
	.start();
// or
var myTween = new TINA.Tween(myObject, ['abc'])
	.interpolations({ abc: TINA.interpolation.string })
	.to({ abc: 'World' }, duration)
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
A nested tween allows to interpolate between nested objects.
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
Note: the NestedTween API remains identical to Tween and all the functionalities of Tween are available to the NestedTween component.

### Timeline
Timelines are used to play tweens in parallel.
To create a **timeline**:
``` javascript
var timePosTweenA = 0;
var timePosTweenB = 2000;
var myTimeline = new TINA.Timeline()
	.add(myTweenA, timePosTweenA)
	.add(myTweenB, timePosTweenB)
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
// myTween will be attached to myTimer
var myTween = new TINA.Tween(myObject, ['x'])
	.to({ x: 5 }, 1000)
	.start();
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

By default the ticker goes at a speed of 1 unit per update.
But similarly to a timer it is possible to specify how fast the time goes for a ticker.
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
// dt is the time elapsed since TINA's previous update
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

Made in [Wizcorp](http://www.wizcorp.jp).
