/**
 * Require the module at `name`.
 *
 * @param {String} name
 * @return {Object} exports
 * @api public
 */

function require(name) {
  var module = require.modules[name];
  if (!module) throw new Error('failed to require "' + name + '"');

  if (!('exports' in module) && typeof module.definition === 'function') {
    module.client = module.component = true;
    module.definition.call(this, module.exports = {}, module);
    delete module.definition;
  }

  return module.exports;
}

/**
 * Meta info, accessible in the global scope unless you use AMD option.
 */

require.loader = 'component';

/**
 * Internal helper object, contains a sorting function for semantiv versioning
 */
require.helper = {};
require.helper.semVerSort = function(a, b) {
  var aArray = a.version.split('.');
  var bArray = b.version.split('.');
  for (var i=0; i<aArray.length; ++i) {
    var aInt = parseInt(aArray[i], 10);
    var bInt = parseInt(bArray[i], 10);
    if (aInt === bInt) {
      var aLex = aArray[i].substr((""+aInt).length);
      var bLex = bArray[i].substr((""+bInt).length);
      if (aLex === '' && bLex !== '') return 1;
      if (aLex !== '' && bLex === '') return -1;
      if (aLex !== '' && bLex !== '') return aLex > bLex ? 1 : -1;
      continue;
    } else if (aInt > bInt) {
      return 1;
    } else {
      return -1;
    }
  }
  return 0;
}

/**
 * Find and require a module which name starts with the provided name.
 * If multiple modules exists, the highest semver is used. 
 * This function can only be used for remote dependencies.

 * @param {String} name - module name: `user~repo`
 * @param {Boolean} returnPath - returns the canonical require path if true, 
 *                               otherwise it returns the epxorted module
 */
require.latest = function (name, returnPath) {
  function showError(name) {
    throw new Error('failed to find latest module of "' + name + '"');
  }
  // only remotes with semvers, ignore local files conataining a '/'
  var versionRegexp = /(.*)~(.*)@v?(\d+\.\d+\.\d+[^\/]*)$/;
  var remoteRegexp = /(.*)~(.*)/;
  if (!remoteRegexp.test(name)) showError(name);
  var moduleNames = Object.keys(require.modules);
  var semVerCandidates = [];
  var otherCandidates = []; // for instance: name of the git branch
  for (var i=0; i<moduleNames.length; i++) {
    var moduleName = moduleNames[i];
    if (new RegExp(name + '@').test(moduleName)) {
        var version = moduleName.substr(name.length+1);
        var semVerMatch = versionRegexp.exec(moduleName);
        if (semVerMatch != null) {
          semVerCandidates.push({version: version, name: moduleName});
        } else {
          otherCandidates.push({version: version, name: moduleName});
        } 
    }
  }
  if (semVerCandidates.concat(otherCandidates).length === 0) {
    showError(name);
  }
  if (semVerCandidates.length > 0) {
    var module = semVerCandidates.sort(require.helper.semVerSort).pop().name;
    if (returnPath === true) {
      return module;
    }
    return require(module);
  }
  // if the build contains more than one branch of the same module
  // you should not use this funciton
  var module = otherCandidates.sort(function(a, b) {return a.name > b.name})[0].name;
  if (returnPath === true) {
    return module;
  }
  return require(module);
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Register module at `name` with callback `definition`.
 *
 * @param {String} name
 * @param {Function} definition
 * @api private
 */

require.register = function (name, definition) {
  require.modules[name] = {
    definition: definition
  };
};

/**
 * Define a module's exports immediately with `exports`.
 *
 * @param {String} name
 * @param {Generic} exports
 * @api private
 */

require.define = function (name, exports) {
  require.modules[name] = {
    exports: exports
  };
};
require.register("tina/src/Delay.js", function (exports, module) {
var Playable = require('tina/src/Playable.js');

/**
 * @classdesc
 * Manages tweening of one property or several properties of an object
 */

function Delay(duration) {
	if ((this instanceof Delay) === false) {
		return new Delay(duration);
	}

	Playable.call(this);
	this._duration = duration;
}
Delay.prototype = Object.create(Playable.prototype);
Delay.prototype.constructor = Delay;
module.exports = Delay;
});

require.register("tina/src/DoublyList.js", function (exports, module) {
/**
 * DOUBLY LIST Class
 *
 * @author Brice Chevalier
 *
 * @desc Doubly list data structure
 *
 *    Method                Time Complexity
 *    ___________________________________
 *
 *    add         O(1)
 *    remove      O(1)
 *    clear       O(n)
 *
 *    Memory Complexity in O(n)
 */

function ListNode(obj, prev, next, container) {
	this.object    = obj;
	this.prev      = prev;
	this.next      = next;
	this.container = container;
}

function DoublyList() {
	this.first  = null;
	this.last   = null;
	this.length = 0;
}
module.exports = DoublyList;

DoublyList.prototype.addFront = function (obj) {
	var newNode = new ListNode(obj, null, this.first, this);
	if (this.first === null) {
		this.first = newNode;
		this.last  = newNode;
	} else {
		this.first.prev = newNode;
		this.first      = newNode;
	}

	this.length += 1;
	return newNode;
};
DoublyList.prototype.add = DoublyList.prototype.addFront;

DoublyList.prototype.addBack = function (obj) {
	var newNode = new ListNode(obj, this.last, null, this);
	if (this.first === null) {
		this.first = newNode;
		this.last  = newNode;
	} else {
		this.last.next = newNode;
		this.last      = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.popFront = function (obj) {
	var object = this.first.object;
	this.remove(this.first);
	return object;
};
DoublyList.prototype.pop = DoublyList.prototype.popFront;

DoublyList.prototype.popBack = function (obj) {
	var object = this.last.object;
	this.remove(this.last);
	return object;
};

DoublyList.prototype.remove = function (node) {
	if (node.container !== this) {
		console.warn('[DoublyList.remove] Trying to remove a node that does not belong to the list');
		return node;
	}

	if (node.next === null) {
		this.last = node.prev;
	} else {
		node.next.prev = node.prev;
	}

	if (node.prev === null) {
		this.first = node.next;
	} else {
		node.prev.next = node.next;
	}

	node.container = null;
	this.length -= 1;

	return null;
};

DoublyList.prototype.clear = function () {
	// Making sure that nodes containers are being resetted
	for (var node = this.first; node !== null; node = node.next) {
		node.container = null;
	}

	this.first  = null;
	this.last   = null;
	this.length = 0;
};
});

require.register("tina/src/easing.js", function (exports, module) {
/**
 *
 * @file A set of ease functions
 *
 * @author Brice Chevalier
 *
 * @param {Number} t Progress of the transition in [0, 1]
 * @param (Number) p Additional parameter, when required.
 *
 * @return {Number} Interpolated time
 *
 * @desc Ease functions
 *
 * Initial and final values of the ease functions are either 0 or 1.
 * All the ease functions are continuous for times t in [0, 1]
 *
 * Note: if you want a particular easing method to be added
 * create an issue or contribute at https://github.com/Wizcorp/tina
 */

// Math constants (for readability)
var PI          = Math.PI;
var PI_OVER_TWO = Math.PI / 2;
var TWO_PI      = Math.PI * 2;
var EXP         = 2.718281828;

// No easing
exports.none = function() {
	return 1;
};

// Linear
exports.linear = function(t) {
	return t;
};

// Flash style transition
// ease in [-1, 1] for usage similar to flash
// but works with ease in ]-Inf, +Inf[
exports.flash = function(t, ease) {
	return t + t * ease - t * t * ease;
};

// Parabolic
exports.parabolic = function(t) {
	var r = (2 * t - 1);
	return 1 - r * r;
};

// Trigonometric, n = number of iterations in ]-Inf, +Inf[
exports.trigo = function(t, n) {
	return 0.5 * (1 - Math.cos(TWO_PI * t * n));
};

// Elastic, e = elasticity in ]0, +Inf[
exports.elastic = function(t, e) {
	if (t === 1) return 1;
	e = 1 - 1 / (e + 1); // inversing e for user friendlyness
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return Math.cos(n - PI_OVER_TWO) * Math.pow(e, n);
};

// Polynomial, p = power in ]0, + Inf[
exports.polyIn = function(t, p) { 
	return Math.pow(t, p);
};

exports.polyOut = function(t, p) {
	return 1 - Math.pow((1 - t) / 1, p);
};

exports.polyInOut = function(t, p) {
	if (t < 0.5) {
		return Math.pow(2 * t, p) / 2;
	} else {
		return (1 + (1 - Math.pow(2 * (1 - t), p))) / 2;
	}
};

// Sine
exports.sineIn = function(t) {
	return 1 - Math.cos(PI_OVER_TWO * t);
};

exports.sineOut = function(t) {
	return Math.sin(PI_OVER_TWO * t);
};

exports.sineInOut = function(t) {
	if (t < 0.5) {
		return (1 - Math.cos(PI * t)) / 2;
	} else {
		return (1 + Math.sin(PI * (t - 0.5))) / 2;
	}
};

// Exponential, e = exponent in ]0, + Inf[
exports.expIn = function(t, e) {
	return (1 - Math.pow(EXP, e * t)) / (1 - Math.pow(EXP, e));
};

exports.expOut = function(t, e) {
	return (1 - Math.pow(EXP, - e * t)) / (1 - Math.pow(EXP, - e));
};

exports.expInOut = function(t, e) {
	if (t < 0.5) {
		return (1 - Math.pow(EXP, 2 * e * t)) / (1 - Math.pow(EXP, e)) / 2;
	} else {
		return 0.5 + (1 - Math.pow(EXP, e - 2 * e * t)) / (1 - Math.pow(EXP, - e)) / 2;
	}
};

// Circular
exports.circIn = function(t) {
	return 1 - Math.sqrt(1 - Math.pow(t, 2));
};

exports.circOut = function(t) {
	return Math.sqrt(1 - Math.pow(1 - t, 2));
};

exports.circInOut = function(t) {
	if (t < 0.5) {
		return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
	} else {
		return (1 + Math.sqrt(-3 + 8 * t - 4 * t * t)) / 2;
	}
};

// Elastic, e = elasticity in ]0, +Inf[
exports.elasticIn = function(t, e) {
	if (t === 0) { return 0; }
	e /= (e + 1); // transforming e for user friendlyness
	var n = (1 + e) * Math.log(t) / Math.log(e);
	return Math.cos(n) * Math.pow(e, n);
};

exports.elasticOut = function(t, e) {
	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e for user friendlyness
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return 1.0 - Math.cos(n) * Math.pow(e, n);
};

exports.elasticInOut = function(t, e) {
	var n;
	if (t < 0.5) {
		if (t === 0) { return 0; }
		e /= (e + 1); // transforming e for user friendlyness
		n = (1 + e) * Math.log(2 * t) / Math.log(e);
		return 0.5 * Math.cos(n) * Math.pow(e, n);
	}

	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e for user friendlyness
	n = (1 + e) * Math.log(2 - 2 * t) / Math.log(e);
	return 0.5 + 0.5 * (1.0 - Math.cos(n) * Math.pow(e, n));
};

// Bounce, e = elasticity in ]0, +Inf[
exports.bounceIn = function(t, e) {
	if (t === 0) { return 0; }
	e /= (e + 1); // transforming e for user friendlyness
	var n = (1 + e) * Math.log(t) / Math.log(e);
	return Math.abs(Math.cos(n) * Math.pow(e, n));
};

exports.bounceOut = function(t, e) {
	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e for user friendlyness
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return 1.0 - Math.abs(Math.cos(n) * Math.pow(e, n));
};

exports.bounceInOut = function(t, e) {
	var n;
	if (t < 0.5) {
		if (t === 0) { return 0; }
		e /= (e + 1); // transforming e for user friendlyness
		n = (1 + e) * Math.log(2 * t) / Math.log(e);
		return Math.abs(0.5 * Math.cos(n) * Math.pow(e, n));
	}

	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e for user friendlyness
	n = (1 + e) * Math.log(2 - 2 * t) / Math.log(e);
	return 0.5 + 0.5 * (1.0 - Math.abs(Math.cos(n) * Math.pow(e, n)));
};

// Back, e = elasticity in [0, +Inf[
exports.backIn = function(t, e) {
	return t * t * ((e + 1) * t - e);
};

exports.backOut = function(t, e) {
	t -= 1;
	return t * t * ((e + 1) * t + e) + 1;
};

exports.backInOut = function(t, e) {
	if (t < 0.5) {
		t *= 2;
		return 0.5 * (t * t * ((e + 1) * t - e));
	}
	t = 2 * t - 2;
	return 0.5 * (t * t * ((e + 1) * t + e)) + 1;
};

});

require.register("tina", function (exports, module) {

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
 * Animation library to easily create and customisable tweens,
 * timelines, sequences and other playable components.
 *
 * Note: if you want a particular component to be added
 * create an issue or contribute at https://github.com/Wizcorp/tina
 */

// Method to trigger automatic update of TINA
var requestAnimFrame = (function(){
	return window.requestAnimationFrame    || 
		window.webkitRequestAnimationFrame || 
		window.mozRequestAnimationFrame    || 
		window.oRequestAnimationFrame      || 
		window.msRequestAnimationFrame     || 
		function(callback){
			window.setTimeout(callback, 1000 / 60);
		};
})();

// Performance.now gives better precision than Date.now
var clock = window.performance || Date;

var TINA = {
	Tweener:       require('tina/src/Tweener.js'),
	Timer:         require('tina/src/Timer.js'),
	Ticker:        require('tina/src/Ticker.js'),
	Playable:      require('tina/src/Playable.js'),
	Player:        require('tina/src/Player.js'),
	// Controller:    require('./Controller'), // TODO
	Tween:         require('tina/src/Tween.js'),
	// Warning: Using relative tweens can lead to rounding errors (very small).
	TweenRelative: require('tina/src/TweenRelative.js'),
	Timeline:      require('tina/src/Timeline.js'),
	Sequence:      require('tina/src/Sequence.js'),
	Recorder:      require('tina/src/Recorder.js'),
	Delay:         require('tina/src/Delay.js'),
	easing:        require('tina/src/easing.js'),
	interpolation: require('tina/src/interpolation.js'),

	_tweeners: [],
	_defaultTweener: null,
	_running: false,

	_startTime: 0,
	_time: 0,

	// callbacks
	_onStart:  null,
	_onPause:  null,
	_onResume: null,
	_onUpdate: null,
	_onStop:   null,

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
		return this._running;
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

	start: function () {
		if (this._running === true) {
			console.warn('[TINA.start] TINA is already running');
			return this;
		}

		var self = this;
		var selfUpdate = function () {
			if (self._running === true) {
				self.update();
				requestAnimFrame(selfUpdate);
			}
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

		this._running = true;

		// Starting the animation loop
		requestAnimFrame(selfUpdate);
		return this;
	},

	pause: function () {
		if (this._running === false) {
			console.warn('[TINA.pause] TINA is not running');
			return this;
		}

		this._running = false;
		for (var t = 0; t < this._tweeners.length; t += 1) {
			this._tweeners[t]._pause();
		}

		if (this._onPause !== null) {
			this._onPause();
		}
		return this;
	},

	resume: function () {
		if (this._running === true) {
			console.warn('[TINA.resume] TINA is already running');
			return this;
		}

		this._running = true;
		if (this._onResume !== null) {
			this._onResume();
		}

		for (var t = 0; t < this._tweeners.length; t += 1) {
			this._tweeners[t]._resume();
		}

		// Resetting the clock
		// Getting time difference between last update and now
		var now = clock.now();
		var dt = now - this._time;

		// Moving starting time by this difference
		// As if the time had virtually not moved
		this._startTime += dt;

		return this;
	},

	stop: function () {
		this._running = false;
		var runningTweeners = this._tweeners.slice(0);
		for (var t = 0; t < runningTweeners.length; t += 1) {
			runningTweeners[t]._stop();
		}

		if (this._onStop !== null) {
			this._onStop();
		}
		return this;
	},

	setDefaultTweener: function (tweener) {
		this._defaultTweener = tweener;
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

	_remove: function (tweener) {
		var tweenerIdx = this._tweeners.indexOf(tweener);
		if (tweenerIdx !== -1) {
			this._tweeners.splice(tweenerIdx, 1);
		}
	},

	remove: function (tweener) {
		this._remove(tweener);
		return this;
	},

	_getDefaultTweener: function () {
		if (this._defaultTweener === null) {
			var DefaultTweener = this.Timer;
			this._defaultTweener = new DefaultTweener().start();
		} else {
			// Is the default tweener running?
			var idx = this._tweeners.indexOf(this._defaultTweener);
			if (idx !== -1) {
				// Not running, starting it
				this._defaultTweener.start();
			}
		}

		return this._defaultTweener;
	}
};


// To handle lost of focus of the page
// Constants to manage lost of focus of the page
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
	this._warn('[Tweener] Cannot pause on lost focus because the browser does not support the Page Visibility API');
} else {
	// Handle page visibility change
	var wasRunning = false;
	document.addEventListener(visbilityChange, function () {
		if (document[hidden]) {
			// document is hiding
			wasRunning = TINA.isRunning();
			if (wasRunning) {
				TINA.pause();
			}
		}

		if (!document[hidden]) {
			// document is back (we missed you buddy)
			if (wasRunning) {
				// Running TINA only if it was running when the document focus was lost
				TINA.resume();
			}
		}
	}, false);
}

(function (root) {
	// Global variable
	root.TINA = TINA;
})(this);

module.exports = TINA;

});

require.register("tina/src/interpolation.js", function (exports, module) {
/**
 *
 * @file A set of interpolation functions
 *
 * @author Brice Chevalier
 *
 * @param {Number} t Progress of the transition in [0, 1]
 * @param (Number) a Value to interpolate from
 * @param (Number) b Value to interpolate to
 * @param (Number) p Additional parameter
 *
 * @return {Number} Interpolated value
 *
 * @desc Interpolation functions
 * Define how to interpolate between object a and b.
 * 
 * Note: if you want a particular interpolation method to be added
 * create an issue or contribute at https://github.com/Wizcorp/tina
 */

// TODO: Test them all!

exports.none = function(t, a, b) {
	return b;
};

exports.linear = function(t, a, b) {
	return a * (1 - t) + b * t;
};

// d = discretization
exports.discrete = function(t, a, b, d) {
	return Math.floor((a * (1 - t) + b * t) / d) * d;
};

// a, b = vectors
exports.vector = function(t, a, b) {
	var c = [];
	for (var i = 0; i < a.length; i += 1) {
		c[i] = a[i] * (1 - t) + b[i] * t;
	}
	return c;
};

// a, b = states, c = array of intermediary states
exports.state = function(t, a, b, c) {
	var nbStates = b.length + 2;
	var stateIdx = Math.floor(t * nbStates);
	if (stateIdx < 1) { return a; }
	if (stateIdx >= (nbStates - 1)) { return b; }
	return c[stateIdx - 1];
};

// a, b = colors
exports.colorRGB = function(t, a, b) {
	return {
		r: a.r * (1 - t) + b.r * t,
		g: a.g * (1 - t) + b.g * t,
		b: a.b * (1 - t) + b.b * t
	};
};

exports.colorRGBA = function(t, a, b) {
	return {
		r: a.r * (1 - t) + b.r * t,
		g: a.g * (1 - t) + b.g * t,
		b: a.b * (1 - t) + b.b * t,
		a: a.a * (1 - t) + b.a * t
	};
};

exports.colorRGBToHexa = function(t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);

	return '#' + cr.toString(16) + cg.toString(16) + cb.toString(16);
};

exports.colorRGBAToString = function(t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);
	var ca = Math.round(a.a * (1 - t) + b.a * t);

	return 'rgba(' + cr.toString(16) + ',' + cg.toString(16) + ',' + cb.toString(16) + ',' + ca + ')';
};

// Interpolation between 2 strings a and b
// Returns a string of the same size as b
exports.string = function(t, a, b) {
	var nbCharsA = a.length;
	var nbCharsB = b.length;
	var newString = '';

	for (var c = 0; c < nbCharsB; c += 1) {
		// Simple heuristic:
		// if charCodeB is closer to a capital letter
		// then charCodeA corresponds to an "A"
		// otherwise chardCodeA corresponds to an "a"
		var charCodeB = b.charCodeAt(c);
		var charCodeA = (c >= nbCharsA) ? ((charCodeB < 97) ? 65 : 97) : a.charCodeAt(c);

		var charCode = Math.round(charCodeA * (1 - t) + charCodeB * t);
		newString += String.fromCharCode(charCode);
	}

	return newString;
};

// TODO: introduce c = control points
// Bezier, c = array of control points in ]-Inf, +Inf[
exports.bezierQuadratic = function(t, a, b, c) {
	var u = 1 - t;
	return u * u * a + t * (2 * u * c[0] + t * b);
};

exports.bezierCubic = function(t, a, b, c) {
	var u = 1 - t;
	return u * u * u * a + t * (3 * u * u * c[0] + t * (3 * u * c[1] + t * b));
};

exports.bezierQuartic = function(t, a, b, c) {
	var u = 1 - t;
	var u2 = 2 * u;
	return u2 * u2 * a + t * (4 * u * u2 * c[0] + t * (6 * u2 * c[1] + t * (4 * u * c[2] + t * b)));
};

exports.bezierQuintic = function(t, a, b, c) {
	var u = 1 - t;
	var u2 = 2 * u;
	return u2 * u2 * u * a + t * (5 * u2 * u2 * c[0] + t * (10 * u * u2 * c[1] + t * (10 * u2 * c[2] + t * (5 * u * c[3] + t * b))));
};

exports.bezier = function(t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b;

	var term = n;
	for (k = 1; k < n; k -= 1) {
		x = x * t + term * Math.pow(u, k) * c[n - k];
		term *= (n - k) / (k + 1);
	}

	return x * t + a * Math.pow(u, n);
};

// Bezier 2D, c = array of control points in ]-Inf, +Inf[ ^ 2
exports.bezier2d = function(t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b[0];
	var y = b[1];

	var p, q;
	var term = n;
	for (var k = 1; k < n; k -= 1) {
		p = term * Math.pow(u, k);
		q = c[n - k];
		x = x * t + p * q[0];
		y = y * t + p * q[1];
		term *= (n - k) / (k + 1);
	}

	p = Math.pow(u, n);
	return [
		x * t + a[0] * p,
		y * t + a[1] * p
	]
};

// Bezier 3D, c = array of control points in ]-Inf, +Inf[ ^ 3
exports.bezier3d = function(t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b[0];
	var y = b[1];
	var z = b[2];

	var p, q;
	var term = n;
	for (var k = 1; k < n; k -= 1) {
		p = term * Math.pow(u, k);
		q = c[n - k];
		x = x * t + p * q[0];
		y = y * t + p * q[1];
		z = z * t + p * q[2];
		term *= (n - k) / (k + 1);
	}

	p = Math.pow(u, n);
	return [
		x * t + a[0] * p,
		y * t + a[1] * p,
		z * t + a[2] * p
	]
};

// Bezier k-dimensions, c = array of control points in ]-Inf, +Inf[ ^ k
exports.bezierKd = function(t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var k = a.length;

	var res = [];
	for (var i = 0; i < k; i += 1) {
		res[i] = b[i];
	}

	var p, q;
	var term = n;
	for (var l = 1; l < n; l -= 1) {
		p = term * Math.pow(u, l);
		q = c[n - l];

		for (i = 0; i < k; i += 1) {
			res[i] = res[i] * t + p * q[i];
		}

		term *= (n - l) / (l + 1);
	}

	p = Math.pow(u, n);
	for (i = 0; i < k; i += 1) {
		res[i] = res[i] * t + a[i] * p;
	}

	return res;
};

// CatmullRom, b = array of control points in ]-Inf, +Inf[
exports.catmullRom = function(t, a, b, c) {
	if (t === 1) {
		return b[b.length - 1];
	}

	// Finding index corresponding to current time
	var k = b[0].length;
	var n = b.length - 1;
	t *= n;
	var i = Math.floor(t);
	t -= i;

	var t2 = t * t;
	var t3 = t * t2;
	var w = -0.5 * t3 + 1.0 * t2 - 0.5 * t;
	var x =  1.5 * t3 - 2.5 * t2 + 1.0;
	var y = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
	var z =  0.5 * t3 - 0.5 * t2;

	var p0 = b[Math.max(0, i - 1)];
	var p1 = b[i];
	var p2 = b[Math.min(n, i + 1)];
	var p3 = b[Math.min(n, i + 2)];

	var res = [];
	for (var j = 0; j < k; j += 1) {
		res[j] = p0[j] * w + p1[j] * x + p2[j] * y + p3[j] * z;
	}

	return res;
};

// Noises functions! (you are welcome)
// Only 1d and 2d for now, if any request for 3d then I will add it to the list

// Creating a closure for the noise function to make 'perm' and 'grad' only accessible to it
exports.noise = (function() {
	// permutation table
	var perm = [
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216,
		182
	];

	// gradients
	var grad = [-1, 1];

	return function (t, a, b, p) {
		var amp = 2.0;   // amplitude
		var per = p.per || 1; // persistance
		var frq = p.frq || 2; // frequence
		var oct = p.oct || 4; // octaves
		var off = p.off || 0; // offset

		var c = 0;
		var x = p.x + off;

		for (var o = 0; o < oct; o += 1) {

			var i = (x | x) & 255;
			var x1 = x - (x | x);
			var x0 = 1.0 - x1;

			c += amp * (x0 * x0 * x1 * (3 - 2 * x0) * grad[perm[i] & 1] - x1 * x1 * x0 * (3 - 2 * x1) * grad[perm[i + 1] & 1]);

			x *= (x - off) * frq + off;
			amp *= per;
		}

		// Scaling the result
		var scale = ((per === 1) ? 1 / oct : 0.5 * (1 - per) / (1 - Math.pow(per, oct)));
		t = t + c * scale;
		return a * (1 - t) + b * t;
	}
})();

exports.simplex2d = (function() {
	// permutation table
	var perm = [
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216,
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216
	];

	// gradients
	var grad = [
		[1,1], [-1,1], [1,-1], [-1,-1],
		[1,0], [-1,0], [1,0], [-1,0],
		[0,1], [0,-1], [0,1], [0,-1],
		[1,1], [-1,1], [1,-1], [-1,-1]
	];

	function dot2D(g, x, y) {
		return g[0] * x + g[1] * y;
	}

	return function (t, a, b, p) {
		var amp = 2.0; // amplitude
		var per = p.per || 1; // persistance
		var frq = p.frq || 2; // frequence
		var oct = p.oct || 4; // octaves
		var off = p.off || { x: 0, y: 0 }; // offset

		var c = c;
		var x = p.x + off.x;
		var y = p.y + off.y;

		for (var o = 0; o < oct; o += 1) {
			var n0, n1, n2; // Noise contributions from the three corners

			// Skew the input space to determine which simplex cell we're in
			var f2 = 0.5 * (Math.sqrt(3.0) - 1.0);
			var s = (x + y) * f2; // Hairy factor for 2D
			var i = Math.floor(x + s);
			var j = Math.floor(y + s);
			var g2 = (3.0 - Math.sqrt(3.0)) / 6.0;
			var t = (i + j) * g2;

			var x0 = i - t; // Unskew the cell origin back to (x, y) space
			var y0 = j - t;
			x0 = x - x0; // The x, y distances from the cell origin
			y0 = y - y0;

			// For the 2D case, the simplex shape is an equilateral triangle.
			// Determine which simplex we are in.
			var i1, j1; // Offsets for second (middle) corner of simplex in (i, j) coords
			if (x0 > y0) {
				i1 = 1; j1 = 0; // lower triangle, XY order: (0, 0) -> (1, 0) -> (1, 1)
			} else {
				i1 = 0; j1 = 1; // upper triangle, YX order: (0, 0) -> (0, 1) -> (1, 1)
			}

			// A step of (1, 0) in (i, j) means a step of (1 - c, -c) in (x, y), and
			// a step of (0, 1) in (i, j) means a step of (-c, 1 - c) in (x, y), where
			// c = (3 - sqrt(3)) / 6
			var x1 = x0 - i1 + g2; // Offsets for middle corner in (x, y) unskewed coords
			var y1 = y0 - j1 + g2;
			var x2 = x0 - 1.0 + 2.0 * g2; // Offsets for last corner in (x, y) unskewed coords
			var y2 = y0 - 1.0 + 2.0 * g2;

			// Working out the hashed gradient indices of the three simplex corners
			var ii = i & 255;
			var jj = j & 255;

			// Calculating the contribution from the three corners
			var t0 = 0.5 - x0 * x0 - y0 * y0;
			var t1 = 0.5 - x1 * x1 - y1 * y1;
			var t2 = 0.5 - x2 * x2 - y2 * y2;

			if (t0 < 0) {
				n0 = 0.0;
			} else {
				var gi0 = perm[ii + perm[jj]] & 15;
				t0 *= t0;
				n0 = t0 * t0 * dot2D(grad[gi0], x0, y0);
			}

			if (t1 < 0) {
				n1 = 0.0;
			} else {
				var gi1 = perm[ii + i1 + perm[jj + j1]] & 15;
				t1 *= t1;
				n1 = t1 * t1 * dot2D(grad[gi1], x1, y1);
			}

			if (t2 < 0) {
				n2 = 0.0;
			} else {
				var gi2 = perm[ii + 1 + perm[jj + 1]] & 15;
				t2 *= t2;
				n2 = t2 * t2 * dot2D(grad[gi2], x2, y2);
			}

			// Adding contributions from each corner to get the final noise value.
			// The result is scaled to return values in the interval [-amp, amp]
			c += amp * 70.0 * (n0 + n1 + n2);

			x *= (x - off.x) * frq + off.x;
			y *= (y - off.y) * frq + off.y;
			amp *= per;
		}

		// Scaling the result
		var scale = ((per === 1) ? 1 / oct : 0.5 * (1 - per) / (1 - Math.pow(per, oct)));
		t = t + c * scale;
		return a * (1 - t) + b * t;
	}
})();
});

require.register("tina/src/Playable.js", function (exports, module) {
/** @class */
function Playable() {
	this._startTime = 0;
	this._time      = 0;
	this._duration  = 0;

	this._handle = null;
	this._player = null;

	this._onStart    = null;
	this._onPause    = null;
	this._onResume   = null;
	this._onUpdate   = null;
	this._onStop     = null;
	this._onComplete = null;
};
module.exports = Playable;

Playable.prototype.tweener = function (tweener) {
	this._player = tweener;
	return this;
};

Playable.prototype.getDuration = function () {
	return this._duration;
};

Playable.prototype.goTo = function (time) {
	// Offsetting start time with respect to current time
	this._startTime = this._time - time;
	return this;
};

Playable.prototype.goToBeginning = function () {
	this.goTo(0);
	return this;
};

Playable.prototype.goToEnd = function () {
	this.goTo(this.getDuration());
	return this;
};

Playable.prototype.onStart    = function (onStart)    { this._onStart    = onStart;    return this; };
Playable.prototype.onUpdate   = function (onUpdate)   { this._onUpdate   = onUpdate;   return this; };
Playable.prototype.onStop     = function (onStop)     { this._onStop     = onStop;     return this; };
Playable.prototype.onComplete = function (onComplete) { this._onComplete = onComplete; return this; };
Playable.prototype.onPause    = function (onPause)    { this._onPause    = onPause;    return this; };
Playable.prototype.onResume   = function (onResume)   { this._onResume   = onResume;   return this; };

Playable.prototype._update   = function () { if (this._onUpdate   !== null) { this._onUpdate();   } };
Playable.prototype._stop     = function () { if (this._onStop     !== null) { this._onStop();     } };
Playable.prototype._pause    = function () { if (this._onPause    !== null) { this._onPause();    } };
Playable.prototype._resume   = function () { if (this._onResume   !== null) { this._onResume();   } };

Playable.prototype.delay = function (delay) {
	if (this._player === null) {
		this._player = TINA._getDefaultTweener();
	}

	this._player._delay(this, delay);
	return this;
};

Playable.prototype.start = function (timeOffset) {
	var player = this._player;
	if (player === null) {
		player = TINA._getDefaultTweener();
	}

	if (player._add(this) === false) {
		// Could not be started
		return this;
	}

	if (timeOffset === undefined || timeOffset === null) {
		timeOffset = 0;
	}

	this._start(player, timeOffset - player._time);
	return this;
};


Playable.prototype._start = function (player, timeOffset) {
	this._player = player;
	this._startTime = -timeOffset;

	if (this._onStart !== null) {
		this._onStart();
	};
};

Playable.prototype.stop = function () {
	// Stopping playable without performing any additional update nor completing
	if (this._player._finish(this) === false) {
		// Could not be stopped
		return this;
	}

	this._stop();
	return this;
};

Playable.prototype.resume = function () {
	if (this._player._add(this) === false) {
		// Could not be resumed
		return this;
	}

	this._resume();
	return this;
};

Playable.prototype.pause = function () {
	if (this._player._finish(this) === false) {
		// Could not be paused
		return this;
	}

	this._pause();
	return this;
};

Playable.prototype._complete = function (overflow) {
	// Removing playable before it completes
	// So that the playable can be started again within _onComplete callback
	if (this._player._finish(this) === false) {
		// Could not be completed
		return this;
	}

	if (this._onComplete !== null) { 
		this._onComplete(overflow);
	}
};


Playable.prototype._moveTo = function (time, dt) {
	this._time = time - this._startTime;

	// Computing overflow and clamping time
	var overflow;
	if (dt > 0) {
		if (this._time >= this._duration) {
			overflow = this._time - this._duration;
			dt -= overflow;
			this._time = this._duration;
		}
	} else if ((dt < 0) && (this._time <= 0)) {
		overflow = this._time;
		dt -= overflow;
		this._time = 0;
	}

	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};

// Playable.prototype._moveToward = function (dt) {
// 	this._time += dt;

// 	// Computing overflow and clamping time
// 	var overflow;
// 	if (dt > 0) {
// 		if (this._time >= this._duration) {
// 			overflow = this._time - this._duration;
// 			dt -= overflow;
// 			this._time = this._duration;
// 		}
// 	} else if (dt < 0) {
// 		if (this._time <= 0) {
// 			overflow = this._time;
// 			dt -= overflow;
// 			this._time = 0;
// 		}
// 	}

// 	this._update(dt);

// 	if (this._onUpdate !== null) {
// 		this._onUpdate(this._time, dt);
// 	}

// 	if (overflow !== undefined) {
// 		this._complete(overflow);
// 	}
// };

// Overridable method
Playable.prototype._update  = function () {};
});

require.register("tina/src/Player.js", function (exports, module) {
var DoublyList = require('tina/src/DoublyList.js');
var Playable   = require('tina/src/Playable.js');

function PlayableHandle(playable) {
	this.playable = playable;
	this.handle = null;
}

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Player() {
	Playable.call(this);
	// A DoublyList, rather than an Array, is used to store playables.
	// It allows for faster removal and is similar in speed for iterations.

	// Quick note: as of mid 2014 iterating through linked list was slower than iterating through arrays
	// in safari and firefox as only V8 managed to have linked lists work as fast as arrays.
	// As of mid 2015 it seems that performances are now identical in every major browsers.
	// (KUDOs to the JS engines guys)

	// List of active playables handled by this player
	this._activePlayables = new DoublyList();

	// List of inactive playables handled by this player
	this._inactivePlayables = new DoublyList();

	// List of playables that are not handled by this player anymore and are waiting to be removed
	this._playablesToRemove = new DoublyList();

	// Whether to silence warnings
	this._silent = false;

	// Whether to trigger the debugger on warnings
	this._debug = false;
}
Player.prototype = Object.create(Playable.prototype);
Player.prototype.constructor = Player;
module.exports = Player;

Player.prototype._moveTo = function (time, dt) {
	this._time = time - this._startTime;

	// Computing time overflow and clamping time
	var overflow;
	if (dt > 0) {
		if (this._time >= this._duration) {
			overflow = this._time - this._duration;
			dt -= overflow;
			this._time = this._duration;
		}
	} else if (dt < 0) {
		if (this._time <= 0) {
			overflow = this._time;
			dt -= overflow;
			this._time = 0;
		}
	}

	this._updatePlayableList();
	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};

Player.prototype._add = function (playable) {
	if (playable._handle === null) {
		// Playable can be added
		playable._handle = this._inactivePlayables.add(playable);
		return true;
	}

	// Playable is already handled, either by this player or by another one
	if (playable._handle.container === this._playablesToRemove) {
		// Playable was being removed, removing from playables to remove
		playable._handle = this._playablesToRemove.remove(playable._handle);
		return true;
	}

	if (playable._handle.container === this._activePlayables) {
		this._warn('[Player._add] Playable is already present, and active');
		return false;
	}

	if (playable._handle.container === this._inactivePlayables) {
		this._warn('[Player._add] Playable is already present, but inactive (could be starting)');
		return false;
	}

	this._warn('[Player._add] Playable is used elsewhere');
	return false;
};

Player.prototype._remove = function (playable) {
	if (playable._handle === null) {
		this._warn('[Player._remove] Playable is not being used');
		return false;
	}

	// Playable is handled, either by this player or by another one
	if (playable._handle.container === this._activePlayables) {
		// Playable was active, adding to remove list
		playable._handle = this._playablesToRemove.add(playable._handle);
		return true;
	}

	if (playable._handle.container === this._inactivePlayables) {
		// Playable was being started, removing from starting playables
		playable._handle = this._inactivePlayables.remove(playable._handle);
		return true;
	}

	if (playable._handle.container === this._playablesToRemove) {
		this._warn('[Player._remove] Playable is already being removed');
		return false;
	}

	this._warn('[Player._add] Playable is used elsewhere');
	return false;
};

Player.prototype.possess = function (playable) {
	if (playable._handle === null) {
		return false;
	}

	return (playable._handle.container === this._activePlayables) || (playable._handle.container === this._inactivePlayables);
};

Player.prototype._finish = function (playable) {
	this._activePlayables.remove(playable._handle);

	// Playable is moved to the list of inactive playables
	playable._handle = this._inactivePlayables.add(playable);
};

Player.prototype._handlePlayablesToRemove = function () {
	while (this._playablesToRemove.length > 0) {
		// O(1) where O stands for "Oh yeah"

		// Removing from list of playables to remove
		var handle = this._playablesToRemove.pop();

		// Removing from list of active playables
		var playable = handle.object;
		playable._handle = this._activePlayables.remove(handle);
	}
};

// Overridable method
Player.prototype._updatePlayableList = function () {};

Player.prototype.clear = function () {
	this._handledPlayables.clear();
	this._activePlayables.clear();
	this._inactivePlayables.clear();
	this._playablesToRemove.clear();
	return this;
};

Player.prototype.stop = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		var playable = handle.object;
		playable.stop();
		handle = next;
	}

	this._handlePlayableToRemove();

	this._stop();
	return this;
};

Player.prototype._delay = function () {
	this._warn('[Player._delay] This player does not support the delay functionality');
};

Player.prototype._warn = function (warning) {
	if (this._silent === false) {
		console.warn(warning);
	}

	if (this._debug === true) {
		debugger;
	}
};

Player.prototype.silent = function (silent) {
	this._silent = silent;
	return this;
};

Player.prototype.debug = function (debug) {
	this._debug = debug;
	return this;
};
});

require.register("tina/src/Recorder.js", function (exports, module) {
var Playable = require('tina/src/Playable.js');

function ObjectRecorder(object, properties) {
	this.object      = object;
	this.properties  = properties;
	this.timestamps  = [];
	this.records     = [];
	this.playingHead = 1;
}

ObjectRecorder.prototype.record = function (time) {
	for (var p = 0; p < this.properties.length; p += 1) {
		this.records.push(this.object[this.properties[p]]);
	}

	this.timestamps.push(time);
};

ObjectRecorder.prototype.play = function (time, smooth) {
	var nbProperties = this.properties.length;
	var lastRecord   = this.timestamps.length - 1;
	var playingHead  = this.playingHead;

	while ((playingHead < lastRecord) && (time <= this.timestamps[playingHead])) {
		playingHead += 1;
	}

	while ((playingHead > 1) && (time > this.timestamps[playingHead])) {
		playingHead -= 1;
	}

	if (smooth) {
		var t0 = this.timestamps[playingHead - 1];
		var t1 = this.timestamps[playingHead];
		var dt = t1 - t0;

		var delta0 = (t - t0) / dt;
		var delta1 = (t1 - t) / dt;

		var recordIdx1 = nbProperties * playingHead;
		var recordIdx0 = nbProperties * playingHead - nbProperties;

		for (var p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = this.records[recordIdx0 + p] * delta0 + this.records[recordIdx1 + p] * delta1;
		}
	} else {
		var recordIdx = nbProperties * playingHead;
		for (var p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = this.records[recordIdx + p];
		}
	}
};

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function Recorder() {
	if ((this instanceof Recorder) === false) {
		return new Recorder();
	}

	Playable.call(this);

	// Never ends
	this._duration = Infinity;

	// List of objects and properties to records
	this._objectRecorders = [];

	// Whether the recorder is in recording mode
	this._recording = true;

	// Whether the recorder is in playing mode
	this._playing = false;

	// Whether the recorder enables interpolating at play time
	this._smooth = false;
}
Recorder.prototype = Object.create(Playable.prototype);
Recorder.prototype.constructor = Recorder;
module.exports = Recorder;

Recorder.prototype.reset = function () {
	this._objectRecorders = [];
	return this;
};

Recorder.prototype.record = function (object, properties) {
	this._objectRecorders.push(new ObjectRecorder(object, properties));
	return this;
};

Recorder.prototype.remove = function (object) {
	var nbObjectRecorders = this._objectRecorders.length;
	for (var r = 0; r < nbObjectRecorders; r += 1) {
		if (this._objectRecorders[r].object === object) {
			this._objectRecorders.splice(1, r);
			break;
		}
	}
	return this;
};

Recorder.prototype.recording = function (recording) {
	this._recording = recordingMode;
	if (this._recording === true) {
		this._playing = false;
	}
	return this;
};

Recorder.prototype.playing = function (playing) {
	this._playing = playingMode;
	if (this._playing === true) {
		this._recording = false;
	}
	return this;
};

Recorder.prototype.smooth = function (smooth) {
	this._smooth = smooth;
	return this;
};

Recorder.prototype.update = function (dt) {
	if (this._recording) {
		var nbObjectRecorders = this._objectRecorders.length;
		for (var r = 0; r < nbObjectRecorders; r += 1) {
			this._objectRecorders[r].record(this._time);
		}
	}

	if (this._playing) {
		var nbObjectRecorders = this._objectRecorders.length;
		for (var r = 0; r < nbObjectRecorders; r += 1) {
			this._objectRecorders[r].play(this._time, this._smooth);
		}
	}
};

});

require.register("tina/src/Sequence.js", function (exports, module) {
var Timeline = require('tina/src/Timeline.js');

/**
 *
 * @classdesc
 * Manages tweening of one property or several properties of an object
 *
 * @param {object} element Object to tween
 * @param {string} property Property to tween
 * @param {number} a starting value of property
 * @param {number} b ending value of property
 *
 */

function Sequence() {
	if ((this instanceof Sequence) === false) {
		return new Sequence();
	}

	Timeline.call(this);
}
Sequence.prototype = Object.create(Timeline.prototype);
Sequence.prototype.constructor = Sequence;
module.exports = Sequence;

Sequence.prototype.add = function (playable) {
	playable._startTime = this._duration;
	this._duration += playable._duration;
	this._add(playable);
	return this;
};

Sequence.prototype.addDelay = function (duration) {
	this._duration += duration;
	return this;
};
});

require.register("tina/src/Ticker.js", function (exports, module) {
var Tweener = require('tina/src/Tweener.js');

/**
 *
 * @classdesc
 * Tweener that manages the update of time independantly of the actual passing of time.
 * Every update, the time interval is equal to the given tupt (time units per tick).
 *
 */
function Ticker(tupt) {
	if ((this instanceof Ticker) === false) {
		return new Ticker(tupt);
	}

	Tweener.call(this);

	// Time units per tick (tupt)
	// Every second, 'tupt' time units elapse
	this._tupt = tupt || 1;

	this._nbTicks = 0;
}
Ticker.prototype = Object.create(Tweener.prototype);
Ticker.prototype.constructor = Ticker;
module.exports = Ticker;

Object.defineProperty(Ticker.prototype, 'tupt', {
	get: function () { return this._tupt; },
	set: function (tupt) {
		if (tupt < 0) {
			this._warn('[Timer.tupt] tupt cannot be negative, stop messing with time.');
			tupt = 0;
		}

		var dt = this._nbTicks;
		if (tupt === 0) {
			// Setting start as if new tupt was 1
			this._nbTicks = this._time - dt * this._tupt;
		} else {
			if (this._tupt === 0) {
				// If current tupt is 0,
				// it corresponds to a virtual tupt of 1
				// when it comes to determing how many ticks have passed
				this._nbTicks = this._time - dt / tupt;
			} else {
				this._nbTicks = this._time - dt * this._tupt / tupt;
			}
		}

		this._tupt = tupt;
	}
});

Ticker.prototype._getElapsedTime = function () {
	return this._tupt * (this._nbTicks++);
};

Ticker.prototype._getSingleStepDuration = function () {
	return this._tupt;
};

Ticker.prototype.convertToTicks = function(timeUnits) {
	return timeUnits / this._tupt;
};

Ticker.prototype.convertToTimeUnits = function(nbTicks) {
	return nbTicks * this._tupt;
};

});

require.register("tina/src/Timeline.js", function (exports, module) {
var Player = require('tina/src/Player.js');

/**
 *
 * @classdesc
 * Manages tweening of one property or several properties of an object
 *
 * @param {object} element Object to tween
 * @param {string} property Property to tween
 * @param {number} a starting value of property
 * @param {number} b ending value of property
 *
 */

function Timeline() {
	if ((this instanceof Timeline) === false) {
		return new Timeline();
	}

	Player.call(this);
}
Timeline.prototype = Object.create(Player.prototype);
Timeline.prototype.constructor = Timeline;
module.exports = Timeline;

Timeline.prototype.add = function (startTime, playable) {
	playable._startTime = startTime;
	this._add(playable);
	this._duration = Math.max(this._duration, startTime + playable._duration);
	return this;
};

Timeline.prototype._computeDuration = function () {
	var duration = 0;
	for (var handle = this._inactivePlayables.first; handle !== null; handle = handle.next) {
		var playable = handle.object;
		duration = Math.max(duration, playable._startTime + playable._duration);
	}

	for (handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		duration = Math.max(duration, playable._startTime + playable._duration);
	}

	this._duration = duration;
};

Timeline.prototype.remove = function (playable) {
	this._remove(playable);
	return this;
};

Timeline.prototype._start = function (player, timeOffset) {
	Player.prototype._start.call(this, player, timeOffset);

	// Computing duration of the timeline
	this._computeDuration();
};

Timeline.prototype._updatePlayableList = function () {
	this._handlePlayablesToRemove();

	// Inactive playables 
	var handle = this._inactivePlayables.first; 
	while (handle !== null) {
		var playable = handle.object;

		// Fetching handle of next playable
		handle = handle.next;

		var startTime = playable._startTime;
		var endTime   = startTime + playable._duration;
		if (startTime <= this._time && this._time <= endTime) {
			// O(1)
			this._inactivePlayables.remove(playable._handle);
			playable._handle = this._activePlayables.add(playable);

			playable._start(this, -startTime);
		}
	}
};

Timeline.prototype._update = function (dt) {
	for (var handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		var playable = handle.object;
		playable._moveTo(this._time, dt);
	}
};
});

require.register("tina/src/Timer.js", function (exports, module) {
var Tweener = require('tina/src/Tweener.js');

// Performance.now gives better precision than Date.now
var clock = window.performance || Date;

/**
 *
 * @classdesc
 * Tweener that manages the update of time relatively to the actual passing of time.
 * Every update, the time interval is equal to the elapsed time in seconds multiplied by the tups (time units per second).
 *
 */
function Timer(tups) {
	if ((this instanceof Timer) === false) {
		return new Timer(tups);
	}

	Tweener.call(this);

	// Time units per second (tups)
	// Every second, 'tups' time units elapse
	this._tups = tups || 1;
}
Timer.prototype = Object.create(Tweener.prototype);
Timer.prototype.constructor = Timer;
module.exports = Timer;

Object.defineProperty(Timer.prototype, 'tups', {
	get: function () { return this._tups; },
	set: function (tups) {
		if (tups < 0) {
			this._warn('[Timer.tups] tups cannot be negative, stop messing with time.');
			tups = 0;
		}

		var dt = this._time - this._startTime;
		if (tups === 0) {
			// Setting start as if new tups was 1
			this._startTime = this._time - dt * this._tups;
		} else {
			if (this._tups === 0) {
				// If current tups is 0,
				// it corresponds to a virtual tups of 1
				// when it comes to determing where the start is
				this._startTime = this._time - dt / tups;
			} else {
				this._startTime = this._time - dt * this._tups / tups;
			}
		}

		this._tups = tups;
	}
});

Timer.prototype._getElapsedTime = function (time) {
	return this._tups * (time - this._startTime) / 1000;
};

Timer.prototype._getSingleStepDuration = function (dt) {
	return this._tups * dt / 1000;
};

Timer.prototype.convertToSeconds = function(timeUnits) {
	return timeUnits / this._tups;
};

Timer.prototype.convertToTimeUnits = function(seconds) {
	return seconds * this._tups;
};
});

require.register("tina/src/Transition.js", function (exports, module) {
// The file is a good representation of the constant fight between maintainability and performance
// For performance reasons several update methods are created
// The appropriate method should be used for tweening. The selection depends on:
// 	- The number of props to tween
//  - Whether or not an easing is being used
//  - Whether or not an interpolation is being used

// One property
function update(object, t) {
	var p = this.prop;
	object[p] = this.from[p] * (1 - t) + this.to[p] * t;
};

// Several Properties
function updateP(object, t) {
	var q = this.props;
	for (var i = 0; i < this.props.length; i += 1) {
		var p = q[i];
		object[p] = this.from[p] * (1 - t) + this.to[p] * t;
	}
};

// Interpolation
function updateI(object, t) {
	var p = this.prop;
	object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
};

// Interpolation
// Several Properties
function updatePI(object, t) {
	var q = this.props;
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	}
};

// Easing
function updateE(object, t) {
	t = this.easing(t, this.easingParam);
	var p = this.prop;
	object[p] = this.from[p] * (1 - t) + this.to[p] * t;
};

// Easing
// Several Properties
function updatePE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.from[p] * (1 - t) + this.to[p] * t;
	}
};

// Easing
// Interpolation
function updateIE(object, t) {
	var p = this.prop;
	object[p] = this.interps[p](this.easing(t, this.easingParam), this.from[p], this.to[p], this.interpParams[p]);
};

// Easing
// Interpolation
// Several Properties
function updatePIE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	}
};

var updateMethods = [
	[
		[update, updateP],
		[updateI, updatePI]
	], [
		[updateE, updatePE],
		[updateIE, updatePIE]
	]
];

function Transition(properties, from, to, start, duration, easing, easingParam, interpolations, interpolationParams) {
	this.start    = start;
	this.end      = start + duration;
	this.duration = duration;

	this.from = from;
	this.to   = to;

	// Easing flag - Whether an easing function is used
	// 0 => Using linear easing
	// 1 => Using custom easing
	var easingFlag;
	if (easing) {
		easingFlag = 1;
		this.easing = easing;
		this.easingParam = easingParam;
	} else {
		easingFlag = 0;
	}

	// Interpolation flag - Whether an interpolation function is used
	// 0 => No Interpolation
	// 1 => At least one interpolation
	var interpFlag;
	if (interpolations === null) {
		interpFlag = 0;
	} else {
		interpFlag = 1;
		this.interps = interpolations;
		this.interpParams = interpolationParams || {};
	}

	// Property flag - Whether the transition has several properties
	// 0 => Only one property
	// 1 => Several properties
	var propsFlag;
	if (properties.length === 1) {
		propsFlag = 0;
		this.prop = properties[0];
	} else {
		propsFlag  = 1;
		this.props = properties;
	}

	this.update = updateMethods[easingFlag][interpFlag][propsFlag];
}

module.exports = Transition;
});

require.register("tina/src/TransitionRelative.js", function (exports, module) {

// One property
function update(object, t) {
	var p = this.prop;
	var now = this.from[p] * (1 - t) + this.to[p] * t;
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
};

// Several Properties
function updateP(object, t) {
	var q = this.props;
	for (var i = 0; i < this.props.length; i += 1) {
		var p = q[i];
		var now = this.from[p] * (1 - t) + this.to[p] * t;
		object[p] = object[p] + (now - this.prev[p]);
		this.prev[p] = now;
	}
};

// Interpolation
function updateI(object, t) {
	var p  = this.prop;
	var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
};

// Interpolation
// Several Properties
function updatePI(object, t) {
	var q = this.properties;
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
		object[p] = object[p] + (now - this.prev[p]);
		this.prev[p] = now;
	}
};

// Easing
function updateE(object, t) {
	t = this.easing(t, this.easingParams);
	var p = this.prop;
	var now = this.from[p] * (1 - t) + this.to[p] * t;
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
};

// Easing
// Several Properties
function updatePE(object, t) {
	var q = this.properties;
	t = this.easing(t, this.easingParams);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.from[p] * (1 - t) + this.to[p] * t;
		object[p] = object[p] + (now - this.prev[p]);
		this.prev[p] = now;
	}
};

// Easing
// Interpolation
function updateIE(object, t) {
	var p = this.prop;
	var now = this.interps[p](this.easing(t, this.easingParams), this.from[p], this.to[p], this.interpParams[p]);
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
};

// Easing
// Interpolation
// Several Properties
function updatePIE(object, t) {
	var q = this.properties;
	t = this.easing(t, this.easingParams);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
		object[p] = object[p] + (now - this.prev[p]);
		this.prev[p] = now;
	}
};

var updateMethods = [
	[
		[update, updateP],
		[updateI, updatePI]
	], [
		[updateE, updatePE],
		[updateIE, updatePIE]
	]
];

function Transition(properties, from, to, start, duration, easing, easingParam, interpolations, interpolationParams) {
	this.start    = start;
	this.end      = start + duration;
	this.duration = duration;

	this.from = from;
	this.to   = to;

	// Easing flag - Whether an easing function is used
	// 0 => Using linear easing
	// 1 => Using custom easing
	var easingFlag;
	if (easing) {
		easingFlag = 1;
		this.easing = easing;
		this.easingParam = easingParam;
	} else {
		easingFlag = 0;
	}

	// Interpolation flag - Whether an interpolation function is used
	// 0 => No Interpolation
	// 1 => At least one interpolation
	var interpFlag;
	if (interpolations === null) {
		interpFlag = 0;
	} else {
		interpFlag = 1;
		this.interps = interpolations;
		this.interpParams = interpolationParams || {};
	}

	// Property flag - Whether the transition has several properties
	// 0 => Only one property
	// 1 => Several properties
	var propsFlag;
	if (properties.length === 1) {
		propsFlag = 0;
		this.prop = properties[0];
		this.prev = 0;
	} else {
		propsFlag  = 1;
		this.props = properties;
		this.prev  = {};
		for (var p = 0; p < properties.length; p += 1) {
			this.prev[properties[p]] = 0;
		}
	}

	this.update = updateMethods[easingFlag][interpFlag][propsFlag];
}

module.exports = Transition;


// exports.number = function (a, b) {
// 	return a + b;
// }

// exports.vector = function (a, b) {
// 	var n = a.length;
// 	var addition = [];
// 	for (var i = 0; i < n; a += 1) {
// 		addition[i] = a[i] + b[i];
// 	}

// 	return addition;
// }

// exports.number = function (a, b) {
// 	return a - b;
// }

// exports.vector = function (a, b) {
// 	var n = a.length;
// 	var difference = [];
// 	for (var i = 0; i < n; a += 1) {
// 		difference[i] = a[i] - b[i];
// 	}

// 	return difference;
// }

// function update(object, t) {
// 	var prop = this.prop;
// 	var now  = this.from[p] * (1 - t) + this.to[p] * t;

// 	object[p] = this.addition[p](object[p], this.difference[p](now, this.prev));
// 	this.prev = now;
// };
});

require.register("tina/src/Tween.js", function (exports, module) {
var Playable   = require('tina/src/Playable.js');
var Transition = require('tina/src/Transition.js');

var easingFunctions        = require('tina/src/easing.js');
var interpolationFunctions = require('tina/src/interpolation.js');


// Temporisation, used for waiting
function Temporisation(start, duration, toObject) {
	this.start    = start;
	this.end      = start + duration;
	this.duration = duration;

	this.to = toObject;

	this.update = function () {};
}

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function Tween(object, properties) {
	if ((this instanceof Tween) === false) {
		return new Tween(object, properties);
	}

	Playable.call(this);

	// Tweened object
	this._object = object;

	if ((properties === null || properties === undefined) && (object instanceof Array)) {
		// Given object is an array
		// Its properties to tween are the indices of the array
		properties = [];
		for (var p = 0; p < object.length; p += 1) {
			properties[p] = p;
		}
	}

	// Properties to tween
	this._properties = properties;

	// Starting property values
	// By default is a copy of given object property values
	this._from = null;

	// Property interpolations
	this._interpolations = null;

	// Current transition index
	this._current = 0;

	// List of transitions of the tween
	this._transitions = [];
}
Tween.prototype = Object.create(Playable.prototype);
Tween.prototype.constructor = Tween;
module.exports = Tween;

Tween.prototype.Transition = Transition;

Tween.prototype.reset = function () {
	this._current     = 0;
	this._transitions = [];

	return this;
};

Tween.prototype.interpolations = function (interpolations) {
	// The API allows to pass interpolation names that will be replaced
	// by the corresponding interpolation functions
	for (var p = 0; p < this._properties.length; p += 1) {
		var property = this._properties[p];
		var interpolation = interpolations[property];
		if (interpolation === undefined) {
			interpolations[property] = interpolationFunctions.linear;
			continue;
		}

		if (typeof(interpolation) === 'string') {
			// Replacing interpolation name by interpolation function
			if (interpolationFunctions[interpolation] === undefined) {
				console.warn('[Tween.interpolations] Given interpolation does not exist');
				interpolations[property] = interpolationFunctions.linear;
			} else {
				interpolations[property] = interpolationFunctions[interpolation];
			}
		}
	}

	this._interpolations = interpolations;
	return this;
};

Tween.prototype.from = function (fromObject) {
	this._from = fromObject;

	if (this._transitions.length > 0) {
		this._transitions[0].from = fromObject;
	}

	return this;
};

Tween.prototype._setFrom = function () {
	// Copying properties of tweened object
	this._from = {};
	for (var p = 0; p < this._properties.length; p += 1) {
		var property = this._properties[p];
		this._from[property] = this._object[property];
	}

	return this._from;
};

Tween.prototype._getLastTransitionEnding = function () {
	if (this._transitions.length > 0) {
		return this._transitions[this._transitions.length - 1].to;
	} else {
		return (this._from === null) ? this._setFrom() : this._from;
	}
};

Tween.prototype.to = function (duration, toObject, easing, easingParam, interpolationParams) {
	// The API allows to pass interpolation names that will be replaced
	// by the corresponding interpolation functions
	if (typeof(easing) === 'string') {
		// Replacing interpolation name by interpolation function
		if (easingFunctions[easing] === undefined) {
			console.warn('[Tween.to] Given easing does not exist');
			easing = undefined;
		} else {
			easing = easingFunctions[easing];
		}
	}

	// Getting previous transition ending as the beginning for the new transition
	var fromObject = this._getLastTransitionEnding();

	var Transition = this.Transition;
	var transition = new Transition(
		this._properties,
		fromObject,
		toObject,
		this._duration, // starting time
		duration,
		easing,
		easingParam,
		this._interpolations,
		interpolationParams
	);

	this._transitions.push(transition);
	this._duration += duration;
	return this;
};

Tween.prototype.wait = function (duration) {
	var toObject = this._getLastTransitionEnding();
	this._transitions.push(new Temporisation(this._duration, duration, toObject));
	this._duration += duration;
	return this;
};

Tween.prototype._update = function () {
	// Finding transition corresponding to current time
	var transition = this._transitions[this._current];
	while (transition.end <= this._time) {
		if (this._current === (this._transitions.length - 1)) {
			transition.update(this._object, 1);
			return;
		} else {
			transition = this._transitions[++this._current];
		}
	}

	while (this._time <= transition.start) {
		if (this._current === 0) {
			transition.update(this._object, 0);
			return;
		} else {
			transition = this._transitions[--this._current];
		}
	}

	// Computing transition at given time
	transition.update(this._object, (this._time - transition.start) / transition.duration);
};
});

require.register("tina/src/Tweener.js", function (exports, module) {
var Player = require('tina/src/Player.js');
var Delay  = require('tina/src/Delay.js');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Tweener() {
	Player.call(this);

	// A tweener has no end and never completes
	this._duration = Infinity;

	// TINA is the player for all the tweeners
	this._player = TINA;
}
Tweener.prototype = Object.create(Player.prototype);
Tweener.prototype.constructor = Tweener;
module.exports = Tweener;

Tweener.prototype._finish = function (playable) {
	// In a tweener, a playable that finishes is simply removed
	playable._handle = this._playablesToRemove.add(playable._handle);
};

Tweener.prototype.stop = function () {
	// Stopping all active playables and removing them right away
	while (this._activePlayables.length > 0) {
		var playable = this._activePlayables.pop();
		playable._handle = null;
		playable.stop();
	}

	this._handlePlayableToRemove();

	this._stop();
	return this;
};

Tweener.prototype._moveTo = function (time, dt) {
	this._time = this._getElapsedTime(time - this._startTime);
	dt = this._getSingleStepDuration(dt);

	// Computing time overflow and clamping time
	var overflow;
	if (dt > 0) {
		if (this._time >= this._duration) {
			overflow = this._time - this._duration;
			dt -= overflow;
			this._time = this._duration;
		}
	} else if (dt < 0) {
		if (this._time <= 0) {
			overflow = this._time;
			dt -= overflow;
			this._time = 0;
		}
	}

	this._handlePlayablesToRemove();

	// Inactive playables are set as active
	while (this._inactivePlayables.length > 0) {
		// O(1)
		playable = this._inactivePlayables.pop();
		playable._handle = this._activePlayables.add(playable);
	}

	for (var handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		handle.object._moveTo(this._time, dt);
	}

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};

Tweener.prototype._delay = function (playable, delay) {
	if (delay <= 0) {
		this._warn('[Tweener.add] Delay null or negative (' + delay + ').' +
			'Starting the playable with a delay of 0.');
		playable.start();
		return;
	}

	var delayPlayable = new Delay(delay);
	delayPlayable.tweener(this).onComplete(function (timeOverflow) {
		playable.start(timeOverflow);
	}).start();
};

Tweener.prototype.useAsDefault = function () {
	TINA.setDefaultTweener(this);
};
});

require.register("tina/src/TweenRelative.js", function (exports, module) {
var Tween              = require('tina/src/Tween.js');
var TransitionRelative = require('tina/src/TransitionRelative.js');

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function TweenRelative(object, properties) {
	if ((this instanceof TweenRelative) === false) {
		return new TweenRelative(object, properties);
	}

	Tween.call(this, object, properties);
}
TweenRelative.prototype = Object.create(Tween.prototype);
TweenRelative.prototype.constructor = TweenRelative;
module.exports = TweenRelative;

TweenRelative.prototype._setFrom = function () {
	// Setting all the initial properties to 0
	this._from = {};
	for (var p = 0; p < this._properties.length; p += 1) {
		var property = this._properties[p];
		this._from[property] = 0;
	}

	return this._from;
};

TweenRelative.prototype.Transition = TransitionRelative;
});

require("tina");
