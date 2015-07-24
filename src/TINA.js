
/**
 *
 * @module TINA
 *
 * @author Brice Chevalier
 *
 * @desc 
 *
 * Tweening and INterpolations for Animation
 *
 * Note: if you want a particular component to be added
 * create an issue or contribute at https://github.com/Wizcorp/tina.js
 */

// window within a browser, global within node
var root;
if (typeof(window) !== 'undefined') {
	root = window;
} else if (typeof(global) !== 'undefined') {
	root = global;
} else {
	console.warn('[TINA] Your environment might not support TINA.');
	root = this;
}

// Method to trigger automatic update of TINA
var requestAnimFrame = (function(){
	return root.requestAnimationFrame    || 
		root.webkitRequestAnimationFrame || 
		root.mozRequestAnimationFrame    || 
		root.oRequestAnimationFrame      || 
		root.msRequestAnimationFrame     ||
		function(callback){
			root.setTimeout(callback, 1000 / 60);
		};
})();

// Performance.now gives better precision than Date.now
var clock = root.performance || Date;

var TINA = {
	_tweeners: [],

	_defaultTweener: null,

	_startTime: 0,
	_time:      0,

	_running: false,

	// callbacks
	_onStart:  null,
	_onPause:  null,
	_onResume: null,
	_onUpdate: null,
	_onStop:   null,

	_pauseOnLostFocus:            false,
	_pauseOnLostFocusInitialised: false,

	onStart: function (onStart) {
		this._onStart = onStart;
		return this;
	},

	onUpdate: function (onUpdate) {
		this._onUpdate = onUpdate;
		return this;
	},

	onStop: function (onStop) {
		this._onStop = onStop;
		return this;
	},

	onPause: function (onPause) {
		this._onPause = onPause;
		return this;
	},

	isRunning: function () {
		return (this._running === true);
	},

	update: function () {
		var now = clock.now() - this._startTime;
		var dt = now - this._time;
		if (dt < 0) {
			// Clock error, ignoring this update
			// Date.now is based on a clock that is resynchronized
			// every 15-20 mins and could cause the timer to go backward in time.
			// (legend or reality? not sure, but I think I noticed it once)
			// To get some explanation from Paul Irish:
			// http://updates.html5rocks.com/2012/08/When-milliseconds-are-not-enough-performance-now
			return;
		}

		this._time = now;

		// Making a copy of the tweener array
		// to avoid funky stuff happening
		// due to addition or removal of tweeners
		// while iterating them
		var runningTweeners = this._tweeners.slice(0);
		for (var t = 0; t < runningTweeners.length; t += 1) {
			runningTweeners[t]._moveTo(this._time, dt);
		}

		if (this._onUpdate !== null) {
			this._onUpdate(this._time, dt);
		}
	},

	reset: function () {
		this._startTime = clock.now();
		this._time = 0;
	},

	start: function () {
		if (this._startAutomaticUpdate() === false) {
			return;
		}

		if (this._onStart !== null) {
			this._onStart();
		}

		// Setting the clock
		this._startTime = clock.now();
		this._time = 0;

		for (var t = 0; t < this._tweeners.length; t += 1) {
			this._tweeners[t]._start();
		}

		return this;
	},

	stop: function () {
		if (this._stopAutomaticUpdate() === false) {
			return;
		}

		var runningTweeners = this._tweeners.slice(0);
		for (var t = 0; t < runningTweeners.length; t += 1) {
			runningTweeners[t]._stop();
		}

		// Stopping the tweeners have the effect of automatically removing them from TINA
		// In this case we want to keep them attached to TINA
		this._tweeners = runningTweeners;

		if (this._onStop !== null) {
			this._onStop();
		}

		return this;
	},

	// internal start method, called by start and resume
	_startAutomaticUpdate: function () {
		if (this._running === true) {
			console.warn('[TINA.start] TINA is already running');
			return false;
		}

		function updateTINA() {
			if (TINA._running === true) {
				TINA.update();
				requestAnimFrame(updateTINA);
			}
		}

		// Starting the animation loop
		this._running = true;
		requestAnimFrame(updateTINA);
		return true;
	},

	// Internal stop method, called by stop and pause
	_stopAutomaticUpdate: function () {
		if (this._running === false) {
			console.warn('[TINA.pause] TINA is not running');
			return false;
		}

		// Stopping the animation loop
		this._running = false;
		return true;
	},

	pause: function () {
		if (this._stopAutomaticUpdate() === false) {
			return;
		}

		for (var t = 0; t < this._tweeners.length; t += 1) {
			this._tweeners[t]._pause();
		}

		if (this._onPause !== null) {
			this._onPause();
		}
		return this;
	},

	resume: function () {
		if (this._startAutomaticUpdate() === false) {
			return;
		}

		if (this._onResume !== null) {
			this._onResume();
		}

		// Resetting the clock
		// Getting time difference between last update and now
		var now = clock.now();
		var dt = now - this._time;

		// Moving starting time by this difference
		// As if the time had virtually not moved
		this._startTime += dt;

		for (var t = 0; t < this._tweeners.length; t += 1) {
			this._tweeners[t]._resume();
		}

		return this;
	},

	_initialisePauseOnLostFocus: function () {
		if (this._pauseOnLostFocusInitialised === true) {
			return;
		}

		if (document === undefined) {
			// Document is not defined (TINA might be running on node.js)
			console.warn('[TINA.pauseOnLostFocus] Cannot pause on lost focus because TINA is not running in a webpage (node.js does not allow this functionality)');
			return;
		}

		// To handle lost of focus of the page
		var hidden, visbilityChange; 
		if (typeof document.hidden !== 'undefined') {
			// Recent browser support 
			hidden = 'hidden';
			visbilityChange = 'visibilitychange';
		} else if (typeof document.mozHidden !== 'undefined') {
			hidden = 'mozHidden';
			visbilityChange = 'mozvisibilitychange';
		} else if (typeof document.msHidden !== 'undefined') {
			hidden = 'msHidden';
			visbilityChange = 'msvisibilitychange';
		} else if (typeof document.webkitHidden !== 'undefined') {
			hidden = 'webkitHidden';
			visbilityChange = 'webkitvisibilitychange';
		}

		if (typeof document[hidden] === 'undefined') {
			console.warn('[Tweener] Cannot pause on lost focus because the browser does not support the Page Visibility API');
			return;
		}

		this._pauseOnLostFocusInitialised = true;

		// Handle page visibility change
		var wasRunning = false;
		document.addEventListener(visbilityChange, function () {
			if (document[hidden]) {
				// document is hiding
				wasRunning = TINA.isRunning();
				if (wasRunning && TINA._pauseOnLostFocus) {
					TINA.pause();
				}
			}

			if (!document[hidden]) {
				// document is back (we missed you buddy)
				if (wasRunning && TINA._pauseOnLostFocus) {
					// Running TINA only if it was running when the document focus was lost
					TINA.resume();
				}
			}
		}, false);
	},

	pauseOnLostFocus: function (pauseOnLostFocus) {
		if (pauseOnLostFocus === true && this._pauseOnLostFocusInitialised === false) {
			this._initialisePauseOnLostFocus();
		}

		this._pauseOnLostFocus = pauseOnLostFocus;
		return this;
	},

	setDefaultTweener: function (tweener) {
		this._defaultTweener = tweener;
		this._tweeners.push(this._defaultTweener);
	},

	getDefaultTweener: function () {
		return this._defaultTweener;
	},

	_add: function (tweener) {
		// A tweener is starting
		if (this._running === false) {
			// TINA is not running, starting now
			this.start();
		}

		this._tweeners.push(tweener);
	},

	add: function (tweener) {
		this._tweeners.push(tweener);
		return this;
	},

	_inactivate: function (tweener) {
		var tweenerIdx = this._tweeners.indexOf(tweener);
		if (tweenerIdx !== -1) {
			this._tweeners.splice(tweenerIdx, 1);
		}
	},

	remove: function (tweener) {
		this._inactivate(tweener);
		return this;
	},

	_getDefaultTweener: function () {
		if (this._defaultTweener === null) {
			// If a default tweener is required but non exist
			// Then it is started in addition to being created
			var DefaultTweener = this.Timer;
			this._defaultTweener = new DefaultTweener().start();
		}

		return this._defaultTweener;
	}
};

module.exports = global.TINA = TINA;
