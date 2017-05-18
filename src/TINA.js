
var DoublyList = require('./DoublyList');

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

// Method to trigger automatic updates
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

var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.clearTimeout;

// Performance.now gives better precision than Date.now
var clock = root.performance || Date;

var TINA = {
	// List of active tweeners handled by TINA
	_activeTweeners: new DoublyList(),

	// List of inactive tweeners handled by TINA
	_inactiveTweeners: new DoublyList(),

	// List of tweeners that are not handled by this player anymore and are waiting to be removed
	_tweenersToRemove: new DoublyList(),

	// _tweeners: [],

	_defaultTweener: null,

	_startTime: 0,
	_time:      0,

	_requestFrameId: null,
	_paused: false,

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

	_onPlayableChanged: function () {},
	_onPlayableRemoved: function () {},
	_onAllPlayablesRemoved: function () {},

	isRunning: function () {
		return (this._requestFrameId !== null);
	},

	update: function () {
		if (this._paused) {
			return;
		}

		var now = clock.now() - this._startTime;
		var dt = now - this._time;
		if (dt < 0) {
			// Clock error
			// Date.now is based on a clock that is resynchronized
			// every 15-20 mins and could cause the timer to go backward in time.
			// (legend or reality? not sure, but I think I noticed it once)
			// To get some explanation from Paul Irish:
			// http://updates.html5rocks.com/2012/08/When-milliseconds-are-not-enough-performance-now
			dt = 1; // incrementing time by 1 millisecond
			this._startTime -= 1;
			this._time += 1;
		} else {
			this._time = now;
		}

		// Removing any tweener that is requested to be removed
		while (this._tweenersToRemove.length > 0) {
			// Removing from list of tweeners to remove
			var tweenerToRemove = this._tweenersToRemove.pop();

			// Removing from list of active tweeners
			tweenerToRemove._handle = this._activeTweeners.removeByReference(tweenerToRemove._handle);
		}

		// Activating any inactive tweener
		while (this._inactiveTweeners.length > 0) {
			// Removing from list of inactive tweeners
			var tweenerToActivate = this._inactiveTweeners.pop();

			// Adding to list of active tweeners
			tweenerToActivate._handle = this._activeTweeners.addBack(tweenerToActivate);
			tweenerToActivate._start();
		}

		for (var handle = this._activeTweeners.first; handle !== null; handle = handle.next) {
			handle.object._moveTo(this._time, dt);
		}

		if (this._onUpdate !== null) {
			this._onUpdate(this._time, dt);
		}
	},

	reset: function () {
		// Resetting the clock
		// Getting time difference between last update and now
		var now = clock.now();
		var dt = now - this._time;

		// Moving starting time by this difference
		// As if the time had virtually not moved
		this._startTime += dt;
		this._time = 0;
	},

	start: function () {
		if (this._startAutomaticUpdate() === false) {
			return;
		}

		if (this._onStart !== null) {
			this._onStart();
		}

		while (this._inactiveTweeners.length > 0) {
			var handle = this._inactiveTweeners.first;
			this._activate(handle.object);
		}

		return this;
	},

	stop: function () {
		if (this._stopAutomaticUpdate() === false) {
			return;
		}

		while (this._activePlayables.length > 0) {
			var handle = this._activePlayables.first;
			handle.object.stop();
		}

		if (this._onStop !== null) {
			this._onStop();
		}

		return this;
	},

	// Internal start method, called by start and resume
	_startAutomaticUpdate: function () {
		if (this._requestFrameId !== null) {
			return false;
		}

		function updateTINA() {
			TINA.update();
			TINA._requestFrameId = requestAnimFrame(updateTINA);
		}

		this.reset();

		// Starting the animation loop
		this._requestFrameId = requestAnimFrame(updateTINA);
		return true;
	},

	// Internal stop method, called by stop and pause
	_stopAutomaticUpdate: function () {
		if (this._requestFrameId === null) {
			return false;
		}

		// Stopping the animation loop
		cancelAnimationFrame(this._requestFrameId);
		this._requestFrameId = null;
		return true;
	},

	pause: function () {
		this._paused = true;
		if (this._onPause !== null) {
			this._onPause();
		}

		return this;
	},

	resume: function () {
		this._paused = false;
		this._startTime = clock.now() - this._time;

		if (this._onResume !== null) {
			this._onResume();
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

	_add: function (tweener) {
		// A tweener is starting
		if (this._requestFrameId === null) {
			// TINA is not running, starting now
			this.start();
		}

		if (tweener._handle === null) {
			// Tweener can be added
			tweener._handle = this._inactiveTweeners.add(tweener);
			tweener._player = this;
			tweener._time = (this._time - tweener._startTime) * tweener._speed;
			return;
		}

		// Tweener is already handled
		if (tweener._handle.container === this._tweenersToRemove) {
			// Playable was being removed, removing from playables to remove
			tweener._handle = this._tweenersToRemove.removeByReference(tweener._handle);
			return;
		}
	},

	add: function (tweener) {
		this._add(tweener);
		return this;
	},

	_reactivate: function (tweener) {
		this._add(tweener);
		return this;
	},

	_inactivate: function (tweener) {
		if (tweener._handle !== null) {
			this._activePlayables.removeByReference(tweener._handle);
		}

		tweener._handle = this._inactiveTweeners.addBack(tweener);
	},

	_remove: function (tweener) {
		if (tweener._handle === null) {
			return;
		}

		// Playable is handled, either by this player or by another one
		if (tweener._handle.container === this._activeTweeners) {
			// Tweener was active, adding to remove list
			tweener._handle = this._tweenersToRemove.add(tweener._handle);
			return;
		}

		if (tweener._handle.container === this._inactiveTweeners) {
			// Tweener was inactive, removing from inactive tweeners
			tweener._handle = this._inactiveTweeners.removeByReference(tweener._handle);
			return;
		}
	},

	remove: function (tweener) {
		this._remove(tweener);
		return this;
	},

	setDefaultTweener: function (tweener) {
		this._defaultTweener = tweener;
		return this;
	},

	getDefaultTweener: function () {
		if (this._defaultTweener === null) {
			// If a default tweener is required but none exist
			// Then we create one
			var DefaultTweener = this.Timer;
			this._defaultTweener = new DefaultTweener();
		}

		return this._defaultTweener;
	},

	_startDefaultTweener: function () {
		var defaultTweener = this.getDefaultTweener();
		this._add(defaultTweener);
		return defaultTweener;
	}
};

module.exports = root.TINA = TINA;
