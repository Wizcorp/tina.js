(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Transition         = require('./Transition');
var TransitionRelative = require('./TransitionRelative');

var easingFunctions        = require('./easing');
var interpolationFunctions = require('./interpolation');


// Temporisation, used for waiting
function Temporisation(start, duration, toObject, properties) {
	this.start    = start;
	this.end      = start + duration;
	this.duration = duration;

	this.properties = properties;
	this.to = toObject;
}

Temporisation.prototype.update = function (object) {
	for (var p = 0; p < this.properties.length; p += 1) {
		var property = this.properties[p];
		object[property] = this.to[property];
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

function AbstractTween(object, properties) {
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
	this._index = 0;

	// List of transitions of the tween
	this._transitions = [];

	// Whether the tween is relative
	this._relative = false;

	// Current time
	this._time = 0;

	// Total duration
	this._duration = 0;
}
module.exports = AbstractTween;

AbstractTween.prototype.relative = function (relative) {
	this._relative = relative;
	return this;
};

AbstractTween.prototype.reset = function () {
	this._index       = 0;
	this._duration    = 0;
	this._transitions = [];
	return this;
};

AbstractTween.prototype.interpolations = function (interpolations) {
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
				console.warn('[AbstractTween.interpolations] Given interpolation does not exist');
				interpolations[property] = interpolationFunctions.linear;
			} else {
				interpolations[property] = interpolationFunctions[interpolation];
			}
		}
	}

	this._interpolations = interpolations;
	return this;
};

AbstractTween.prototype.from = function (fromObject) {
	this._from = fromObject;

	if (this._transitions.length > 0) {
		this._transitions[0].from = fromObject;
	}

	return this;
};

AbstractTween.prototype._setFrom = function () {
	// Copying properties of tweened object
	this._from = {};
	for (var p = 0; p < this._properties.length; p += 1) {
		var property = this._properties[p];
		this._from[property] = (this._relative === true) ? 0 : this._object[property];
	}

	return this._from;
};

AbstractTween.prototype._getLastTransitionEnding = function () {
	if (this._transitions.length > 0) {
		return (this._relative === true) ? this._setFrom() : this._transitions[this._transitions.length - 1].to;
	} else {
		return (this._from === null) ? this._setFrom() : this._from;
	}
};

AbstractTween.prototype.to = function (toObject, duration, easing, easingParam, interpolationParams) {
	// The API allows to pass easing names that will be replaced
	// by the corresponding easing functions
	if (typeof(easing) === 'string') {
		// Replacing easing name by easing function
		if (easingFunctions[easing] === undefined) {
			console.warn('[AbstractTween.to] Given easing does not exist');
			easing = undefined;
		} else {
			easing = easingFunctions[easing];
		}
	}

	// Getting previous transition ending as the beginning for the new transition
	var fromObject = this._getLastTransitionEnding();

	var TransitionConstructor = (this._relative === true) ? TransitionRelative : Transition;
	var transition = new TransitionConstructor(
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

AbstractTween.prototype.wait = function (duration) {
	var toObject = this._getLastTransitionEnding();
	this._transitions.push(new Temporisation(this._duration, duration, toObject, this._properties));
	this._duration += duration;
	return this;
};

AbstractTween.prototype._update = function () {
	// Finding transition corresponding to current time
	var transition = this._transitions[this._index];
	while (transition.end <= this._time) {
		if (this._index === (this._transitions.length - 1)) {
			transition.update(this._object, 1);
			return;
		}

		if (this._relative === true ) {
			transition.update(this._object, 1);
		}

		transition = this._transitions[++this._index];
	}

	while (this._time <= transition.start) {
		if (this._index === 0) {
			transition.update(this._object, 0);
			return;
		}

		if (this._relative === true ) {
			transition.update(this._object, 0);
		}

		transition = this._transitions[--this._index];
	}

	// Updating the object with respect to the current transition and time
	transition.update(this._object, (this._time - transition.start) / transition.duration);
};

AbstractTween.prototype._validate = function () {
	if (this._transitions.length === 0) {
		console.warn('[AbstractTween._validate] Cannot start a tween with no transition:', this);
		return false;
	}

	return true;
};
},{"./Transition":16,"./TransitionRelative":17,"./easing":20,"./interpolation":23}],2:[function(require,module,exports){

function BriefExtension() {
	// Local duration of the playable, independent from speed and iterations
	this._duration = 0;

	// On complete callback
	this._onComplete = null;

	// Playing options
	this._iterations = 1; // Number of times to iterate the playable
	this._pingpong   = false; // To make the playable go backward on even iterations
	this._persist    = false; // To keep the playable running instead of completing
}

module.exports = BriefExtension;

BriefExtension.prototype.setSpeed = function (speed) {
	if (speed === 0) {
		if (this._speed !== 0) {
			// Setting timeStart as if new speed was 1
			this._startTime += this._time / this._speed - this._time;
		}
	} else {
		if (this._speed === 0) {
			// If current speed is 0,
			// it corresponds to a virtual speed of 1
			// when it comes to determing where the starting time is
			this._startTime += this._time - this._time / speed;
		} else {
			this._startTime += this._time / this._speed - this._time / speed;
		}
	}

	this._speed = speed;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

BriefExtension.prototype.onComplete = function (onComplete) {
	this._onComplete = onComplete;
	return this;
};

BriefExtension.prototype.getDuration = function () {
	// Duration from outside the playable
	return this._duration * this._iterations / this._speed;
};

BriefExtension.prototype._setDuration = function (duration) {
	this._duration = duration;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

BriefExtension.prototype._extendDuration = function (durationExtension) {
	this._duration += durationExtension;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

BriefExtension.prototype._getEndTime = function () {
	if (this._speed > 0) {
		return this._startTime + this.getDuration();
	} else if (this._speed < 0) {
		return this._startTime;
	} else {
		return Infinity;
	}
};

BriefExtension.prototype._setStartTime = function (startTime) {
	if (this._speed > 0) {
		this._startTime = startTime;
	} else if (this._speed < 0) {
		this._startTime = startTime - this.getDuration();
	} else {
		this._startTime = Infinity;
	}
};

BriefExtension.prototype._getStartTime = function () {
	if (this._speed > 0) {
		return this._startTime;
	} else if (this._speed < 0) {
		return this._startTime + this.getDuration();
	} else {
		return -Infinity;
	}
};

BriefExtension.prototype._isTimeWithin = function (time) {
	if (this._speed > 0) {
		return (this._startTime < time) && (time < this._startTime + this.getDuration());
	} else if (this._speed < 0) {
		return (this._startTime + this.getDuration() < time) && (time < this._startTime);
	} else {
		return true;
	}
};

BriefExtension.prototype._overlaps = function (time0, time1) {
	if (this._speed > 0) {
		return (this._startTime - time1) * (this._startTime + this.getDuration() - time0) <= 0;
	} else if (this._speed < 0) {
		return (this._startTime + this.getDuration() - time1) * (this._startTime - time0) <= 0;
	} else {
		return true;
	}
};

BriefExtension.prototype.goToEnd = function () {
	return this.goTo(this.getDuration(), this._iterations - 1);
};

BriefExtension.prototype.loop = function () {
	return this.iterations(Infinity);
};

BriefExtension.prototype.iterations = function (iterations) {
	if (iterations < 0) {
		console.warn('[BriefExtension.iterations] Number of iterations cannot be negative');
		return this;
	}

	this._iterations = iterations;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};

BriefExtension.prototype.persist = function (persist) {
	this._persist = persist;
	return this;
};

BriefExtension.prototype.pingpong = function (pingpong) {
	this._pingpong = pingpong;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};

BriefExtension.prototype._complete = function (overflow) {
	if (this._persist === true) {
		// Playable is persisting
		// i.e it never completes
		this._startTime += overflow;
		this._player._onPlayableChanged(this);
		return;
	}

	// Inactivating playable before it completes
	// So that the playable can be reactivated again within _onComplete callback
	if (this._player._inactivate(this) === false) {
		// Could not be completed
		return this;
	}

	if (this._onComplete !== null) { 
		this._onComplete(overflow);
	}
};


BriefExtension.prototype._moveTo = function (time, dt, overflow) {
	dt *= this._speed;

	// So many conditions!!
	// That is why this extension exists
	if (overflow === undefined) {
		// Computing overflow and clamping time
		if (dt !== 0) {
			if (this._iterations === 1) {
				// Converting into local time (relative to speed and starting time)
				this._time = (time - this._startTime) * this._speed;
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
			} else {
				time = (time - this._startTime) * this._speed;

				// Iteration at current update
				var iteration = time / this._duration;

				if (dt > 0) {
					if (iteration < this._iterations) {
						// if (this._time !== 0 && Math.ceil(iteration) !== Math.ceil(this._time / this._duration)) {
						// }
						this._time = time % this._duration;
					} else {
						overflow = (iteration - this._iterations) * this._duration;
						dt -= overflow;
						this._time = this._duration * (1 - (Math.ceil(this._iterations) - this._iterations));
					}
				} else if (dt < 0) {
					if (0 < iteration) {
						// if (this._time !== this._duration && Math.ceil(iteration) !== Math.ceil(this._time / this._duration)) {
						// }
						this._time = time % this._duration;
					} else {
						overflow = iteration * this._duration;
						dt -= overflow;
						this._time = 0;
					}
				}

				if ((this._pingpong === true)) {
					if (Math.ceil(this._iterations) === this._iterations) {
						if (overflow === undefined) {
							if ((Math.ceil(iteration) & 1) === 0) {
								this._time = this._duration - this._time;
							}
						} else {
							if ((Math.ceil(iteration) & 1) === 1) {
								this._time = this._duration - this._time;
							}
						}
					} else {
						if ((Math.ceil(iteration) & 1) === 0) {
							this._time = this._duration - this._time;
						}
					}
				}
			}
		}
	} else {
		// Ensuring that the playable overflows when its player overflows
		// This conditional is to deal with Murphy's law:
		// There is one in a billion chance that a player completes while one of his playable
		// does not complete due to stupid rounding errors
		if (dt > 0) {
			overflow = Math.max((time - this._startTime) * this._speed - this._duration * this.iterations, 0);
			this._time = this._duration;
		} else {
			overflow = Math.min((time - this._startTime) * this._speed, 0);
			this._time = 0;
		}

		dt -= overflow;
	}

	this._update(dt, overflow);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};
},{}],3:[function(require,module,exports){
var inherit        = require('./inherit');
var Playable       = require('./Playable');
var BriefExtension = require('./BriefExtension');

function BriefPlayable() {
	Playable.call(this);
	BriefExtension.call(this);
}

BriefPlayable.prototype = Object.create(Playable.prototype);
BriefPlayable.prototype.constructor = BriefPlayable;
inherit(BriefPlayable, BriefExtension);

module.exports = BriefPlayable;
},{"./BriefExtension":2,"./Playable":8,"./inherit":22}],4:[function(require,module,exports){
var inherit        = require('./inherit');
var Player         = require('./Player');
var BriefExtension = require('./BriefExtension');

function BriefPlayer() {
	Player.call(this);
	BriefExtension.call(this);
}
BriefPlayer.prototype = Object.create(Player.prototype);
BriefPlayer.prototype.constructor = BriefPlayer;
inherit(BriefPlayer, BriefExtension);

module.exports = BriefPlayer;

BriefPlayer.prototype._onAllPlayablesRemoved = function () {
	this._duration = 0;
};

BriefPlayer.prototype._updateDuration = function () {
	var totalDuration = 0;

	var handle, playable, playableDuration;
	for (handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		playableDuration = playable._getStartTime() + playable.getDuration();
		if (playableDuration > totalDuration) {
			totalDuration = playableDuration;
		}
	}

	for (handle = this._inactivePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		playableDuration = playable._getStartTime() + playable.getDuration();
		if (playableDuration > totalDuration) {
			totalDuration = playableDuration;
		}
	}

	this._setDuration(totalDuration);
};

BriefPlayer.prototype._onPlayableChanged = BriefPlayer.prototype._updateDuration;
BriefPlayer.prototype._onPlayableRemoved = BriefPlayer.prototype._updateDuration;

// BriefPlayer.prototype._onPlayableChanged = function (changedPlayable) {
// 	this._warn('[BriefPlayer._onPlayableChanged] Changing a playable\'s property after attaching it to a player may have unwanted side effects',
// 		'playable:', changedPlayable, 'player:', this);
// };
},{"./BriefExtension":2,"./Player":9,"./inherit":22}],5:[function(require,module,exports){
var BriefPlayable = require('./BriefPlayable');

/**
 * @classdesc
 * Manages tweening of one property or several properties of an object
 */

function Delay(duration) {
	if ((this instanceof Delay) === false) {
		return new Delay(duration);
	}

	BriefPlayable.call(this);
	this._duration = duration;
}
Delay.prototype = Object.create(BriefPlayable.prototype);
Delay.prototype.constructor = Delay;
module.exports = Delay;
},{"./BriefPlayable":3}],6:[function(require,module,exports){
/**
 * DOUBLY LIST Class
 *
 * @author Brice Chevalier
 *
 * @desc Doubly list data structure
 *
 * Method      Time Complexity
 * ___________________________________
 *
 * add         O(1)
 * remove      O(1)
 * clear       O(n)
 *
 * Memory Complexity in O(n)
 */

function ListNode(obj, previous, next, container) {
	this.object    = obj;
	this.previous  = previous;
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
		this.first.previous = newNode;
		this.first = newNode;
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
	this.removeByReference(this.first);
	return object;
};
DoublyList.prototype.pop = DoublyList.prototype.popFront;

DoublyList.prototype.popBack = function (obj) {
	var object = this.last.object;
	this.removeByReference(this.last);
	return object;
};

DoublyList.prototype.addBefore = function (node, obj) {
	var newNode = new ListNode(obj, node.previous, node, this);

	if (node.previous !== null) {
		node.previous.next = newNode;
	}

	node.previous = newNode;

	if (this.first === node) {
		this.first = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.addAfter = function (node, obj) {
	var newNode = new ListNode(obj, node, node.next, this);

	if (node.next !== null) {
		node.next.previous = newNode;
	}

	node.next = newNode;

	if (this.last === node) {
		this.last = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.moveToTheBeginning = function (node) {
	if (!node || node.container !== this) {
		return false;
	}

	if (node.previous === null) {
		// node is already the first one
		return true;
	}

	// Connecting previous node to next node
	node.previous.next = node.next;

	if (this.last === node) {
		this.last = node.previous;
	} else {
		// Connecting next node to previous node
		node.next.previous = node.previous;
	}

	// Adding at the beginning
	node.previous = null;
	node.next = this.first;
	node.next.previous = node;
	this.first = node;
	return true;
};

DoublyList.prototype.moveToTheEnd = function (node) {
	if (!node || node.container !== this) {
		return false;
	}

	if (node.next === null) {
		// node is already the last one
		return true;
	}

	// Connecting next node to previous node
	node.next.previous = node.previous;

	if (this.first === node) {
		this.first = node.next;
	} else {
		// Connecting previous node to next node
		node.previous.next = node.next;
	}

	// Adding at the end
	node.next = null;
	node.previous = this.last;
	node.previous.next = node;
	this.last = node;
	return true;
};

DoublyList.prototype.removeByReference = function (node) {
	if (node.container !== this) {
		console.warn('[DoublyList.removeByReference] Trying to remove a node that does not belong to the list');
		return node;
	}

	// Removing any existing reference to the node
	if (node.next === null) {
		this.last = node.previous;
	} else {
		node.next.previous = node.previous;
	}

	if (node.previous === null) {
		this.first = node.next;
	} else {
		node.previous.next = node.next;
	}

	// Removing any existing reference from the node
	node.next = null;
	node.previous = null;
	node.container = null;

	// One less node in the list
	this.length -= 1;

	return null;
};

DoublyList.prototype.remove = function (object) {
	for (var node = this.first; node !== null; node = node.next) {
		if (node.object === object) {
			this.removeByReference(node);
			return true;
		}
	}

	return false;
};

DoublyList.prototype.getNode = function (object) {
	for (var node = this.first; node !== null; node = node.next) {
		if (node.object === object) {
			return node;
		}
	}

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

DoublyList.prototype.forEach = function (processingFunc, params) {
	for (var node = this.first; node; node = node.next) {
		processingFunc(node.object, params);
	}
};

DoublyList.prototype.toArray = function () {
	var objects = [];
	for (var node = this.first; node !== null; node = node.next) {
		objects.push(node.object);
	}

	return objects;
};
},{}],7:[function(require,module,exports){
var BriefPlayable = require('./BriefPlayable');
var AbstractTween   = require('./AbstractTween');

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function NestedTween(object, properties) {
	if ((this instanceof NestedTween) === false) {
		return new NestedTween(object, properties);
	}

	BriefPlayable.call(this);

	// Map if tween per object for fast access
	this._tweensPerObject = {};

	// Array of tween for fast iteration when udpating
	this._tweens = [];

	// Property chains per object
	this._propertyChains = {};

	// Array of object chains
	this._propertyChainStrings = [];

	var objects = {};
	var propertiesPerObject = {};
	var property, propertyChainString;

	for (var p = 0; p < properties.length; p += 1) {
		var propertyString = properties[p];
		propertyChainString = propertyString.substring(0, propertyString.lastIndexOf('.'));

		if (propertiesPerObject[propertyChainString] === undefined) {
			// Fetching object and property
			var propertyChain = propertyString.split('.');
			var propertyIndex = propertyChain.length - 1;
			var propertyObject = object;

			// Following the chain to get the object
			for (var c = 0; c < propertyIndex; c += 1) {
				propertyObject = propertyObject[propertyChain[c]];
			}

			property = propertyChain[propertyIndex];
			if (propertyObject[property] instanceof Array) {
				propertiesPerObject[propertyString] = null;
				objects[propertyString] = propertyObject[property];
				this._propertyChainStrings.push(propertyString);
				this._propertyChains[propertyString] = propertyChain;
			} else {
				propertiesPerObject[propertyChainString] = [property];
				objects[propertyChainString] = propertyObject;
				this._propertyChainStrings.push(propertyChainString);

				// Removing last element of the property chain
				propertyChain.pop();

				this._propertyChains[propertyChainString] = propertyChain;
			}

		} else {
			// Object was already fetched
			property = propertyString.substring(propertyString.lastIndexOf('.') + 1);
			propertiesPerObject[propertyChainString].push(property);
		}
	}

	// Creating the tweens
	for (propertyChainString in objects) {
		var tweenObject     = objects[propertyChainString];
		var tweenProperties = propertiesPerObject[propertyChainString];
		var tween = new AbstractTween(tweenObject, tweenProperties);
		this._tweens.push(tween);
		this._tweensPerObject[propertyChainString] = tween;
	}
}
NestedTween.prototype = Object.create(BriefPlayable.prototype);
NestedTween.prototype.constructor = NestedTween;
module.exports = NestedTween;

NestedTween.prototype.relative = function (relative) {
	// Dispatching relative
	for (var t = 0; t < this._tweens.length; t += 1) {
		this._tweens[t].relative(relative);
	}
	return this;
};

NestedTween.prototype.reset = function () {
	// Dispatching reset
	for (var t = 0; t < this._tweens.length; t += 1) {
		this._tweens[t].reset();
	}

	this._duration = 0;
	return this;
};

NestedTween.prototype.interpolations = function (interpolations) {
	// Dispatching interpolations
	for (var o = 0; o < this._propertyChainStrings.length; o += 1) {
		var propertyChainString = this._propertyChainStrings[o];
		var propertyChain = this._propertyChains[propertyChainString];
		var chainLength   = propertyChain.length;

		var objectInterpolations = interpolations;
		for (var c = 0; c < chainLength && objectInterpolations !== undefined; c += 1) {
			objectInterpolations = objectInterpolations[propertyChain[c]];
		}

		if (objectInterpolations !== undefined) {
			this._tweensPerObject[propertyChainString].interpolations(objectInterpolations);
		}
	}

	return this;
};

NestedTween.prototype.from = function (fromObject) {
	// Dispatching from
	for (var o = 0; o < this._propertyChainStrings.length; o += 1) {
		var propertyChainString = this._propertyChainStrings[o];
		var propertyChain = this._propertyChains[propertyChainString];
		var chainLength = propertyChain.length;

		var object = fromObject;
		for (var c = 0; c < chainLength && object !== undefined; c += 1) {
			object = object[propertyChain[c]];
		}

		if (object !== undefined) {
			this._tweensPerObject[propertyChainString].from(object);
		}
	}

	return this;
};

NestedTween.prototype.to = function (toObject, duration, easing, easingParam, interpolationParams) {
	// Dispatching to
	for (var o = 0; o < this._propertyChainStrings.length; o += 1) {
		var propertyChainString = this._propertyChainStrings[o];
		var propertyChain = this._propertyChains[propertyChainString];
		var chainLength = propertyChain.length;

		var object = toObject;
		for (var c = 0; c < chainLength; c += 1) {
			object = object[propertyChain[c]];
		}

		var objectInterpolationParams = interpolationParams;
		for (c = 0; c < chainLength && objectInterpolationParams !== undefined; c += 1) {
			objectInterpolationParams = objectInterpolationParams[propertyChain[c]];
		}

		this._tweensPerObject[propertyChainString].to(object, duration, easing, easingParam, objectInterpolationParams);
	}

	this._extendDuration(duration);
	return this;
};

NestedTween.prototype.wait = function (duration) {
	// Dispatching wait
	for (var t = 0; t < this._tweens.length; t += 1) {
		this._tweens[t].wait(duration);
	}

	this._extendDuration(duration);
	return this;
};

NestedTween.prototype._update = function () {
	for (var t = 0; t < this._tweens.length; t += 1) {
		var tween = this._tweens[t];
		tween._time = this._time;
		tween._update();
	}
};
},{"./AbstractTween":1,"./BriefPlayable":3}],8:[function(require,module,exports){
/** @class */
function Playable() {
	// Player component handling this playable
	this._player = null;

	// Handle of the playable within its player
	this._handle = null;

	// Starting time, is global (relative to its player time)
	this._startTime = 0;

	// Current time, is local (relative to starting time)
	// i.e this._time === 0 implies this._player._time === this._startTime
	this._time  = 0;

	// Playing speed of the playable
	this._speed = 1;

	// Callbacks
	this._onStart  = null;
	this._onPause  = null;
	this._onResume = null;
	this._onUpdate = null;
	this._onStop   = null;
}

module.exports = Playable;

Object.defineProperty(Playable.prototype, 'speed', {
	get: function () { return this._speed; },
	set: function (speed) {
		this.setSpeed(speed);
	}
});

Object.defineProperty(Playable.prototype, 'time', {
	get: function () { return this._time; },
	set: function (time) {
		this.goTo(time);
	}
});

Playable.prototype.onStart  = function (onStart)  { this._onStart  = onStart;  return this; };
Playable.prototype.onUpdate = function (onUpdate) { this._onUpdate = onUpdate; return this; };
Playable.prototype.onStop   = function (onStop)   { this._onStop   = onStop;   return this; };
Playable.prototype.onPause  = function (onPause)  { this._onPause  = onPause;  return this; };
Playable.prototype.onResume = function (onResume) { this._onResume = onResume; return this; };

Playable.prototype.tweener = function (tweener) {
	if (tweener === null || tweener === undefined) {
		console.warn('[Playable.tweener] Given tweener is invalid:', tweener);
		return this;
	}

	this._player = tweener;
	return this;
};

Playable.prototype.setSpeed = function (speed) {
	if (speed < 0) {
		console.warn('[Playable.speed] This playable cannot have negative speed');
		return;
	}

	if (speed === 0) {
		if (this._speed !== 0) {
			// Setting timeStart as if new speed was 1
			this._startTime += this._time / this._speed - this._time;
		}
	} else {
		if (this._speed === 0) {
			// If current speed is 0,
			// it corresponds to a virtual speed of 1
			// when it comes to determing where the starting time is
			this._startTime += this._time - this._time / speed;
		} else {
			this._startTime += this._time / this._speed - this._time / speed;
		}
	}

	this._speed = speed;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

Playable.prototype.goTo = function (timePosition, iteration) {
	if (this._iterations === 1) {
		if(this._speed === 0) {
			// Speed is virtually 1
			this._startTime += this._time - timePosition;
		} else {
			// Offsetting starting time with respect to current time and speed
			this._startTime += (this._time - timePosition) / this._speed;
		}
	} else {
		iteration = iteration || 0;
		if(this._speed === 0) {
			// Speed is virtually 1
			this._startTime += this._time - timePosition - iteration * this._duration;
		} else {
			// Offsetting starting time with respect to current time and speed
			this._startTime += (this._time - timePosition - iteration * this._duration) / this._speed;
		}
	}

	this._time = timePosition;
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};

Playable.prototype.goToBeginning = function () {
	return this.goTo(0, 0);
};

Playable.prototype.getDuration = function () {
	return Infinity;
};

Playable.prototype._getEndTime = function () {
	return Infinity;
};

Playable.prototype._setStartTime = function (startTime) {
	this._startTime = startTime;
};

Playable.prototype._getStartTime = function () {
	return this._startTime;
};

Playable.prototype._isWithin = function (time) {
	return this._startTime < time;
};

Playable.prototype._overlaps = function (time0, time1) {
	return (time0 - this._startTime) * (time1 - this._startTime) <= 0;
};

Playable.prototype.rewind = function () {
	this.goTo(0, 0);
	return this;
};

Playable.prototype.delay = function (delay) {
	return this.start(-delay);
};

Playable.prototype.start = function (timeOffset) {
	if (this._player === null) {
		this._player = TINA._getDefaultTweener();
	}

	if (this._validate() === false) {
		// Did not pass validation
		return this;
	}

	if (this._player._add(this) === false) {
		// Could not be added to player
		return this;
	}

	if (timeOffset === undefined || timeOffset === null) {
		timeOffset = 0;
	}

	this._startTime = this._player._time - timeOffset;
	return this;
};

Playable.prototype._start = function () {
	if (this._onStart !== null) {
		this._onStart();
	}
};

Playable.prototype.stop = function () {
	if (this._player === null) {
		console.warn('[Playable.stop] Cannot stop a playable that is not running');
		return;
	}

	// Stopping playable without performing any additional update nor completing
	if (this._player._inactivate(this) === false) {
		// Could not be removed
		return this;
	}

	if (this._onStop !== null) {
		this._onStop();
	}
	return this;
};

Playable.prototype.resume = function () {
	if (this._player._activate(this) === false) {
		// Could not be resumed
		return this;
	}

	if (this._onResume !== null) {
		this._onResume();
	}
	return this;
};

Playable.prototype.pause = function () {
	if (this._player._inactivate(this) === false) {
		// Could not be paused
		return this;
	}

	if (this._onPause !== null) {
		this._onPause();
	}

	return this;
};

Playable.prototype._moveTo = function (time, dt) {
	dt *= this._speed;

	this._time = (time - this._startTime) * this._speed;
	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}
};

// Overridable methods
Playable.prototype._update   = function () {};
Playable.prototype._validate = function () {};
},{}],9:[function(require,module,exports){
var Playable     = require('./Playable');
var DoublyList   = require('./DoublyList');

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

Player.prototype._add = function (playable) {
	if (playable._handle === null) {
		// Playable can be added
		playable._handle = this._inactivePlayables.add(playable);
		playable._player = this;
		// this._onPlayableAdded(playable);
		return true;
	}

	// Playable is already handled, either by this player or by another one
	if (playable._handle.container === this._playablesToRemove) {
		// Playable was being removed, removing from playables to remove
		playable._handle = this._playablesToRemove.removeByReference(playable._handle);
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
		// Playable was inactive, removing from inactive playables
		playable._handle = this._inactivePlayables.removeByReference(playable._handle);
		return true;
	}

	if (playable._handle.container === this._playablesToRemove) {
		this._warn('[Player._remove] Playable is already being removed');
		return false;
	}

	this._warn('[Player._add] Playable is used elsewhere');
	return false;
};

Player.prototype.remove = function (playable) {
	if (playable._handle.container === this._activePlayables) {
		playable.stop();
	}

	this._remove(playable);
	this._onPlayableRemoved(playable);
	return this;
};

Player.prototype.removeAll = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		handle.object.stop();
		handle = next;
	}

	this._handlePlayablesToRemove();
	return this;
};

Player.prototype.possess = function (playable) {
	if (playable._handle === null) {
		return false;
	}

	return (playable._handle.container === this._activePlayables) || (playable._handle.container === this._inactivePlayables);
};

Player.prototype._handlePlayablesToRemove = function () {
	while (this._playablesToRemove.length > 0) {
		// O(1) where O stands for "Oh yeah"

		// Removing from list of playables to remove
		var handle = this._playablesToRemove.pop();

		// Removing from list of active playables
		var playable = handle.object;
		playable._handle = this._activePlayables.removeByReference(handle);
		playable._player = null;
	}

	if ((this._activePlayables.length === 0) && (this._inactivePlayables.length === 0)) {
		this._onAllPlayablesRemoved();
	}
};

Player.prototype.clear = function () {
	this._activePlayables.clear();
	this._inactivePlayables.clear();
	this._playablesToRemove.clear();
	this._controls.clear();
	return this;
};

Player.prototype._warn = function (warning) {
	// jshint debug: true
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

Player.prototype.stop = function () {
	if (this._player === null) {
		this._warn('[Player.stop] Cannot stop a player that is not running');
		return;
	}

	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		var playable = handle.object;
		playable.stop();
		handle = next;
	}

	this._handlePlayablesToRemove();

	Playable.prototype.stop.call(this);
};

Player.prototype._activate = function (playable) {
	// O(1)
	this._inactivePlayables.removeByReference(playable._handle);
	playable._handle = this._activePlayables.addBack(playable);
};

Player.prototype._inactivate = function (playable) {
	// O(1)
	this._activePlayables.removeByReference(playable._handle);
	playable._handle = this._inactivePlayables.addBack(playable);
};

Player.prototype._updatePlayableList = function (dt) {
	this._handlePlayablesToRemove();

	var time0, time1;
	if (dt > 0) {
		time0 = this._time - dt;
		time1 = this._time;
	} else {
		time0 = this._time;
		time1 = this._time - dt;
	}

	// Activating playables
	var handle = this._inactivePlayables.first;
	while (handle !== null) {
		var playable = handle.object;

		// Fetching handle of next playable
		handle = handle.next;

		// Starting if player time within playable bounds
		// if (playable._isTimeWithin(this._time)) {
		if (playable._overlaps(time0, time1)) {
			this._activate(playable);
			playable._start();
		}
	}
};

Player.prototype._update = function (dt, overflow) {
	this._updatePlayableList(dt);
	for (var handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		handle.object._moveTo(this._time, dt, overflow);
	}
};

// Overridable methods
// Player.prototype._onPlayableAdded   = function (/* playable */) {};
Player.prototype._onPlayableChanged = function (/* playable */) {};
Player.prototype._onPlayableRemoved = function (/* playable */) {};
Player.prototype._onAllPlayablesRemoved = function () {};
},{"./DoublyList":6,"./Playable":8}],10:[function(require,module,exports){
var BriefPlayable = require('./BriefPlayable');
var DoublyList    = require('./DoublyList');

function Record(time, values) {
	this.time   = time;
	this.values = values;
}

function ObjectRecorder(object, properties, onIn, onOut) {
	this.object      = object;
	this.properties  = properties;

	this.records = new DoublyList();
	this.currentRecord = null;

	// Whether or not the playing head is within the recording duration
	this.isIn = false;

	this.onIn  = onIn  || null;
	this.onOut = onOut || null;
}

ObjectRecorder.prototype.erase = function (t0, t1) {
	// Removing every record between t0 and t1
	if (t1 < t0) {
		var t2 = t0;
		t0 = t1;
		t1 = t2;
	}

	// Heuristic: removing records from the end if last object concerned by the removal
	var last = this.records.last;
	if (last.object.time <= t1) {
		// Removing from the end
		while (last !== null && last.object.time >= t0) {
			var previous = last.previous;
			this.records.removeBeReference(last);
			last = previous;
		}

		if (this.currentRecord.container === null) {
			// current record was removed from the list
			this.currentRecord = last;
		}
		return;
	}

	// Removing from the beginning
	var recordRef = this.records.first;
	while (recordRef !== null && recordRef.object.time <= t1) {
		var next = recordRef.next;
		if (recordRef.object.time >= t0) {
			this.records.removeBeReference(recordRef);
		}
		recordRef = next;
	}

	if (this.currentRecord.container === null) {
		// current record was removed from the list
		this.currentRecord = recordRef;
	}
};

ObjectRecorder.prototype.record = function (time, dt) {
	if (dt === 0 && this.currentRecord !== null && this.currentRecord.time === time) {
		return;
	}

	// Creating the record
	var recordValues = [];
	for (var p = 0; p < this.properties.length; p += 1) {
		recordValues.push(this.object[this.properties[p]]);
	}
	var record = new Record(time, recordValues);

	// Saving the record
	if (this.records.length === 0) {
		// First record, ever
		this.currentRecord = this.records.add(record);
		return;
	}

	if (this.currentRecord.object.time < time) {
		this.currentRecord = this.records.addAfter(this.currentRecord, record);
	} else {
		this.currentRecord = this.records.addBefore(this.currentRecord, record);
	}
};

ObjectRecorder.prototype.goTo = function (time) {
	// Selecting record that corresponds to the record closest to time
	while (this.currentRecord.object.time < time) {
		this.currentRecord = this.currentRecord.next;
	}

	while (time < this.currentRecord.object.time) {
		this.currentRecord = this.currentRecord.previous;
	}
};

ObjectRecorder.prototype.play = function (time, dt, smooth) {
	var nbProperties = this.properties.length;
	var firstRecord  = this.records.first;
	var lastRecord   = this.records.last;

	var isIn;
	if (dt === 0) {
		isIn = this.isIn;
	} else {
		if (this.isIn === true) {
			isIn = (firstRecord.object.time < time) && (time < lastRecord.object.time);
		} else {
			isIn = (firstRecord.object.time <= time) && (time <= lastRecord.object.time);
		}
	}

	if (isIn !== this.isIn) {
		this.isIn = !this.isIn;
		if (isIn === true && this.onIn !== null) {
			this.onIn();
		}
	} else if (this.isIn === false) {
		return;
	}

	var previousRecord = (this.currentRecord.previous === null) ? this.currentRecord : this.currentRecord.previous;

	while (this.currentRecord.object.time <= time) {
		previousRecord = this.currentRecord;
		var next = this.currentRecord.next;
		if (next === null) {
			break;
		} else {
			this.currentRecord = next;
		}
	}

	while (time <= previousRecord.object.time) {
		this.currentRecord = previousRecord;
		var previous = previousRecord.previous;
		if (previous === null) {
			break;
		} else {
			previousRecord = previous;
		}
	}

	var p;
	if (smooth) {
		var t0 = previousRecord.object.time;
		var t1 = this.currentRecord.object.time;
		var record0 = previousRecord.object.values;
		var record1 = this.currentRecord.object.values;

		var timeInterval = t1 - t0;

		var delta0 = (t - t0) / timeInterval;
		var delta1 = (t1 - t) / timeInterval;

		for (p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = record0[p] * delta0 + record1[p] * delta1;
		}
	} else {
		var record = this.currentRecord.object.values;
		for (p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = record[p];
		}
	}

	// Triggering onOut callback
	if (isIn === false && this.onOut !== null) {
		this.onOut();
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

function Recorder(maxRecordingDuration) {
	if ((this instanceof Recorder) === false) {
		return new Recorder();
	}

	BriefPlayable.call(this);

	// Can end only in playing mode
	this._duration = Infinity;

	// Time difference between this._time and recorded times
	this._slackTime = 0;

	// Maximum recording duration
	this._maxRecordingDuration = maxRecordingDuration || Infinity;

	// List of objects and properties recorded
	this._recordedObjects = [];

	// List of objects and properties recording
	this._recordingObjects = {};

	// List of object labels
	this._recordingObjectLabels = [];

	// Whether the recorder is in recording mode
	this._recording = true;

	// Whether the recorder is in playing mode
	this._playing = false;

	// Whether the recorder enables interpolating at play time
	this._smooth = false;

	this._onStartRecording = null;
	this._onStopRecording  = null;

	this._onStartPlaying = null;
	this._onStopPlaying  = null;
}
Recorder.prototype = Object.create(BriefPlayable.prototype);
Recorder.prototype.constructor = Recorder;
module.exports = Recorder;

Recorder.prototype.getDuration = function () {
	// Duration from outside the playable
	var duration;
	if (this._playing === true) {
		duration = (this._time > this._maxRecordingDuration) ? this._maxRecordingDuration : this._time;
	} else {
		duration = Infinity;
	}
	return duration * this._iterations / this._speed;
};

Recorder.prototype.smooth = function (smooth) {
	this._smooth = smooth;
	return this;
};

Recorder.prototype.onStartRecording = function (onStartRecording) {
	this._onStartRecording = onStartRecording;
	return this;
};

Recorder.prototype.onStopRecording = function (onStopRecording) {
	this._onStopRecording = onStopRecording;
	return this;
};

Recorder.prototype.onStartPlaying = function (onStartPlaying) {
	this._onStartPlaying = onStartPlaying;
	return this;
};

Recorder.prototype.onStopPlaying = function (onStopPlaying) {
	this._onStopPlaying = onStopPlaying;
	return this;
};

Recorder.prototype.reset = function () {
	this._recordedObjects       = [];
	this._recordingObjects      = {};
	this._recordingObjectLabels = [];
	return this;
};

Recorder.prototype.record = function (label, object, properties, onIn, onOut) {
	var objectRecorder = new ObjectRecorder(object, properties, onIn, onOut);
	this._recordingObjects[label] = objectRecorder;
	this._recordedObjects.push(objectRecorder);
	this._recordingObjectLabels.push(label);
	return this;
};

Recorder.prototype.stopRecordingObject = function (label) {
	delete this._recordingObjects[label];

	var labelIdx = this._recordingObjectLabels.indexOf(label);
	if (labelIdx === -1) {
		console.warn('[Recorder.stopRecordingObject] Trying to stop recording an object that is not being recording:', label);
		return this;
	}

	this._recordingObjectLabels.splice(labelIdx, 1);
	return this;
};

Recorder.prototype.removeRecordedObject = function (label) {
	var recorder = this._recordingObjects[label];
	delete this._recordingObjects[label];

	var labelIdx = this._recordingObjectLabels.indexOf(label);
	if (labelIdx !== -1) {
		this._recordingObjectLabels.splice(labelIdx, 1);
	}

	var recorderIdx = this._recordedObjects.indexOf(recorder);
	if (recorderIdx === -1) {
		console.warn('[Recorder.removeRecordedObject] Trying to remove an object that was not recorded:', label);
		return this;
	}

	this._recordingObjectLabels.splice(recorderIdx, 1);
	return this;
};

Recorder.prototype.recording = function (recording) {
	if (this._recording !== recording) {
		this._recording = recording;
		if (this._recording === true) {
			if (this._playing === true) {
				if (this._onStopPlaying !== null) {
					this._onStopPlaying();
				}
				this._playing = false;
			}

			// Not resetting starting time
			// and setting duration to Infinity
			this._duration = Infinity;
			if (this._player !== null) {
				this._player._onPlayableChanged(this);
			}

			if (this._onStartRecording !== null) {
				this._onStartRecording();
			}
		} else {
			if (this._onStopRecording !== null) {
				this._onStopRecording();
			}
		}
	}
	return this;
};

Recorder.prototype.playing = function (playing) {
	if (this._playing !== playing) {
		this._playing = playing;
		if (this._playing === true) {
			if (this._recording === true) {
				if (this._onStopRecording !== null) {
					this._onStopRecording();
				}
				this._recording = false;
			}

			// Setting duration to current position of the playing head
			this._duration = this._time;
			this.goToBeginning(this._startTime + this.getDuration());

			if (this._onStartPlaying !== null) {
				this._onStartPlaying();
			}
		} else {
			if (this._onStopPlaying !== null) {
				this._onStopPlaying();
			}
		}
	}
	return this;
};

Recorder.prototype._update = function (dt) {
	var time = this._slackTime + this._time;

	var r;
	if (this._recording === true) {
		var overflow, isOverflowing;
		if (dt > 0) {
			overflow = this._time - this._maxRecordingDuration;
			isOverflowing = (overflow > 0);
		} else {
			overflow = this._time;
			isOverflowing = (overflow < 0);
		}

		var nbRecordingObjects = this._recordingObjectLabels.length;
		for (r = 0; r < nbRecordingObjects; r += 1) {
			var label = this._recordingObjectLabels[r];
			var recordingObject = this._recordingObjects[label];

			// Recording object at current time
			recordingObject.record(time, dt);

			// Clearing the records that overflow from the maximum recording duration
			if (isOverflowing === true) {
				recordingObject.erase(0, overflow);
			}
		}

		if (overflow > 0) {
			this._slackTime += overflow;
			this._setStartTime(this._startTime + overflow);
			this._player._onPlayableChanged(this);
		}
	} else if (this._playing === true) {
		var nbObjectRecorded = this._recordedObjects.length;
		for (r = 0; r < nbObjectRecorded; r += 1) {
			this._recordedObjects[r].play(time, dt, this._smooth);
		}
	}
};

},{"./BriefPlayable":3,"./DoublyList":6}],11:[function(require,module,exports){
var Timeline   = require('./Timeline');
var Delay      = require('./Delay');
var DoublyList = require('./DoublyList');

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

	this._sequencedPlayables = new DoublyList();

	Timeline.call(this);
}
Sequence.prototype = Object.create(Timeline.prototype);
Sequence.prototype.constructor = Sequence;
module.exports = Sequence;

Sequence.prototype.add = function (playable) {
	this._sequencedPlayables.addBack(playable);
	return Timeline.prototype.add.call(this, playable, this._duration);
};

Sequence.prototype.addDelay = function (duration) {
	return this.add(new Delay(duration));
};

Sequence.prototype._reconstruct = function () {
	// O(n)
	var activePlayable, timeInActiveBefore;
	var activePlayableHandle = this._activePlayables.first;

	if (activePlayableHandle !== null) {
		// How far is the sequence within the active playable?
		activePlayable = activePlayableHandle.object; // only one active playable
		timeInActiveBefore = this._time - activePlayable._getStartTime();
	}

	// Reconstructing the sequence of playables
	var duration = 0;
	for (var handle = this._sequencedPlayables.first; handle !== null; handle = handle.next) {
		var playable = handle.object;
		playable._setStartTime(duration);
		duration = playable._getEndTime();
	}

	if (activePlayableHandle !== null) {
		// Determining where to set the sequence's starting time so that the local time within
		// the active playable remains the same
		var currentStartTime = this._getStartTime();
		var timeInActiveAfter = this._time - activePlayable._getStartTime();
		var shift = timeInActiveBefore - timeInActiveAfter;
		this._startTime += shift;
	}

	// Updating duration
	this._duration = duration;

	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

Sequence.prototype.substitute = function (playableA, playableB) {
	// O(n)
	if (this._sequencedPlayables.length === 0) {
		this._warn('[Sequence.substitute] The sequence is empty!');
		return;
	}

	// Fetching handle for playable A
	var handleA = this._sequencedPlayables.getNode(playableA);

	// Adding playable B right after playable A in this._sequencedPlayables
	this._sequencedPlayables.addAfter(handleA, playableB);

	// Adding playable B in this player
	this._add(playableB);

	// Removing playable A
	// Will have the effect of:
	// - Stopping playable A (with correct callback)
	// - Removing playable A from the sequence
	// - Reconstructing the sequence
	this.remove(playableA);
};

Sequence.prototype._onPlayableRemoved = function (removedPlayable) {
	// O(n)
	this._sequencedPlayables.remove(removedPlayable);
	if (this._sequencedPlayables.length === 0) {
		return;
	}

	this._reconstruct();
};

Sequence.prototype._onPlayableChanged = Sequence.prototype._reconstruct;

},{"./Delay":5,"./DoublyList":6,"./Timeline":14}],12:[function(require,module,exports){
(function (global){

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
			runningTweeners[t].stop();
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

		this.reset();

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
		return this;
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

module.exports = root.TINA = TINA;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
var Tweener = require('./Tweener');

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
	this.tupt = tupt || 1;

}
Ticker.prototype = Object.create(Tweener.prototype);
Ticker.prototype.constructor = Ticker;
module.exports = Ticker;

Ticker.prototype._moveTo = function (time, dt) {
	dt = this.tupt;
	this._time = this.tupt * (this._nbTicks++);

	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}
};

Ticker.prototype.convertToTicks = function(timeUnits) {
	return timeUnits / this.tupt;
};

Ticker.prototype.convertToTimeUnits = function(nbTicks) {
	return nbTicks * this.tupt;
};

},{"./Tweener":19}],14:[function(require,module,exports){
var BriefPlayer = require('./BriefPlayer');

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

	BriefPlayer.call(this);
}
Timeline.prototype = Object.create(BriefPlayer.prototype);
Timeline.prototype.constructor = Timeline;
module.exports = Timeline;

Timeline.prototype.add = function (playable, startTime) {
	if (startTime === null || startTime === undefined) {
		startTime = 0;
	}

	playable._setStartTime(startTime);
	this._add(playable);

	var endTime = playable._getEndTime();
	if (endTime > this._duration) {
		this._setDuration(endTime);
	}

	return this;
};

},{"./BriefPlayer":4}],15:[function(require,module,exports){
var Tweener = require('./Tweener');

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
	this._speed = (tups / 1000) || 1;
}
Timer.prototype = Object.create(Tweener.prototype);
Timer.prototype.constructor = Timer;
module.exports = Timer;

Object.defineProperty(Timer.prototype, 'tups', {
	get: function () { return this._speed * 1000; },
	set: function (tups) { this.speed = tups / 1000; }
});

Timer.prototype.convertToSeconds = function(timeUnits) {
	return timeUnits / (this._speed * 1000);
};

Timer.prototype.convertToTimeUnits = function(seconds) {
	return seconds * this._speed * 1000;
};
},{"./Tweener":19}],16:[function(require,module,exports){
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
}

// Several Properties
function updateP(object, t) {
	var q = this.props;
	for (var i = 0; i < this.props.length; i += 1) {
		var p = q[i];
		object[p] = this.from[p] * (1 - t) + this.to[p] * t;
	}
}

// Interpolation
function updateI(object, t) {
	var p = this.prop;
	object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
}

// Interpolation
// Several Properties
function updatePI(object, t) {
	var q = this.props;
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	}
}

// Easing
function updateE(object, t) {
	t = this.easing(t, this.easingParam);
	var p = this.prop;
	object[p] = this.from[p] * (1 - t) + this.to[p] * t;
}

// Easing
// Several Properties
function updatePE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.from[p] * (1 - t) + this.to[p] * t;
	}
}

// Easing
// Interpolation
function updateIE(object, t) {
	var p = this.prop;
	object[p] = this.interps[p](this.easing(t, this.easingParam), this.from[p], this.to[p], this.interpParams[p]);
}

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
}

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
		propsFlag  = 0;
		this.prop  = properties[0]; // string
		this.props = null;
	} else {
		propsFlag  = 1;
		this.prop  = null;
		this.props = properties; // array
	}

	this.update = updateMethods[easingFlag][interpFlag][propsFlag];
}

module.exports = Transition;
},{}],17:[function(require,module,exports){

// One property
function update(object, t) {
	var p = this.prop;
	var now = this.from[p] * (1 - t) + this.to[p] * t;
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
}

// Several Properties
function updateP(object, t) {
	var q = this.props;
	for (var i = 0; i < this.props.length; i += 1) {
		var p = q[i];
		var now = this.from[p] * (1 - t) + this.to[p] * t;
		object[p] = object[p] + (now - this.prevs[p]);
		this.prevs[p] = now;
	}
}

// Interpolation
function updateI(object, t) {
	var p  = this.prop;
	var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
}

// Interpolation
// Several Properties
function updatePI(object, t) {
	var q = this.props;
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
		object[p] = object[p] + (now - this.prevs[p]);
		this.prevs[p] = now;
	}
}

// Easing
function updateE(object, t) {
	t = this.easing(t, this.easingParams);
	var p = this.prop;
	var now = this.from[p] * (1 - t) + this.to[p] * t;
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
}

// Easing
// Several Properties
function updatePE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParams);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.from[p] * (1 - t) + this.to[p] * t;
		object[p] = object[p] + (now - this.prevs[p]);
		this.prevs[p] = now;
	}
}

// Easing
// Interpolation
function updateIE(object, t) {
	var p = this.prop;
	var now = this.interps[p](this.easing(t, this.easingParams), this.from[p], this.to[p], this.interpParams[p]);
	object[p] = object[p] + (now - this.prev);
	this.prev = now;
}

// Easing
// Interpolation
// Several Properties
function updatePIE(object, t) {
	var q = this.props;
	t = this.easing(t, this.easingParams);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		var now = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
		object[p] = object[p] + (now - this.prevs[p]);
		this.prevs[p] = now;
	}
}

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
		propsFlag  = 0;
		this.prop  = properties[0]; // string
		this.props = null;
		this.prev  = 0;
		this.prevs = null;
	} else {
		propsFlag  = 1;
		this.prop  = null;
		this.props = properties; // array
		this.prev  = null;
		this.prevs = {};
		for (var p = 0; p < properties.length; p += 1) {
			this.prevs[properties[p]] = 0;
		}
	}

	this.update = updateMethods[easingFlag][interpFlag][propsFlag];
}

module.exports = Transition;
},{}],18:[function(require,module,exports){
var BriefPlayable = require('./BriefPlayable');
var AbstractTween = require('./AbstractTween');

var inherit = require('./inherit');
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

	BriefPlayable.call(this);
	AbstractTween.call(this, object, properties);
}
Tween.prototype = Object.create(BriefPlayable.prototype);
Tween.prototype.constructor = Tween;
inherit(Tween, AbstractTween);
module.exports = Tween;


Tween.prototype.to = function (toObject, duration, easing, easingParam, interpolationParams) {
	AbstractTween.prototype.to.call(this, toObject, duration, easing, easingParam, interpolationParams);
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};

Tween.prototype.wait = function (duration) {
	AbstractTween.prototype.to.wait(this, duration);
	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
	return this;
};
},{"./AbstractTween":1,"./BriefPlayable":3,"./inherit":22}],19:[function(require,module,exports){
var Player = require('./Player');
var TINA   = require('./TINA');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Tweener() {
	Player.call(this);

	// TINA is the player for all the tweeners
	this._player = TINA;
}
Tweener.prototype = Object.create(Player.prototype);
Tweener.prototype.constructor = Tweener;
module.exports = Tweener;

Tweener.prototype._inactivate = function (playable) {
	// In a tweener, playables are removed when inactivated
	this._remove(playable);
};

Tweener.prototype.useAsDefault = function () {
	TINA.setDefaultTweener(this);
	return this;
};
},{"./Player":9,"./TINA":12}],20:[function(require,module,exports){
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
 * create an issue or contribute at https://github.com/Wizcorp/tina.js
 */

// Math constants (for readability)
var PI          = Math.PI;
var PI_OVER_TWO = Math.PI / 2;
var TWO_PI      = Math.PI * 2;
var EXP         = 2.718281828;

// No easing
exports.none = function () {
	return 1;
};

// Linear
exports.linear = function (t) {
	return t;
};

// Flash style transition
// ease in [-1, 1] for usage similar to flash
// but works with ease in ]-Inf, +Inf[
exports.flash = function (t, ease) {
	return t + t * ease - t * t * ease;
};

// Parabolic
exports.parabolic = function (t) {
	var r = (2 * t - 1);
	return 1 - r * r;
};

// Trigonometric, n = number of iterations in ]-Inf, +Inf[
exports.trigo = function (t, n) {
	return 0.5 * (1 - Math.cos(TWO_PI * t * n));
};

// Elastic, e = elasticity in ]0, +Inf[
exports.elastic = function (t, e) {
	if (t === 1) return 1;
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return Math.cos(n - PI_OVER_TWO) * Math.pow(e, n);
};

// Quadratric
exports.quadIn = function (t) { 
	return t * t;
};

exports.quadOut = function (t) {
	return 2 * t - t * t;
};

exports.quadInOut = function (t) {
	if (t < 0.5) {
		return 2 * t * t;
	} else {
		return 2 * (2 * t - t * t) - 1;
	}
};

// Cubic
exports.cubicIn = function (t) { 
	return t * t * t;
};

exports.cubicOut = function (t) {
	return 3 * t - 3 * t * t + t * t * t;
};

exports.cubicInOut = function (t) {
	if (t < 0.5) {
		return 4 * t * t * t;
	} else {
		return 4 * (3 * t - 3 * t * t + t * t * t) - 3;
	}
};

// Quartic
exports.quarticIn = function (t) { 
	return t * t * t * t;
};

exports.quarticOut = function (t) {
	var t2 = t * t;
	return 4 * t - 6 * t2 + 4 * t2 * t - t2 * t2;
};

exports.quarticInOut = function (t) {
	if (t < 0.5) {
		return 8 * t * t * t * t;
	} else {
		var t2 = t * t;
		return 8 * (4 * t - 6 * t2 + 4 * t2 * t - t2 * t2) - 7;
	}
};

// Polynomial, p = power in ]0, + Inf[
exports.polyIn = function (t, p) { 
	return Math.pow(t, p);
};

exports.polyOut = function (t, p) {
	return 1 - Math.pow(1 - t, p);
};

exports.polyInOut = function (t, p) {
	if (t < 0.5) {
		return Math.pow(2 * t, p) / 2;
	} else {
		return (2 - Math.pow(2 * (1 - t), p)) / 2;
	}
};

// Sine
exports.sineIn = function (t) {
	return 1 - Math.cos(PI_OVER_TWO * t);
};

exports.sineOut = function (t) {
	return Math.sin(PI_OVER_TWO * t);
};

exports.sineInOut = function (t) {
	if (t < 0.5) {
		return (1 - Math.cos(PI * t)) / 2;
	} else {
		return (1 + Math.sin(PI * (t - 0.5))) / 2;
	}
};

// Exponential, e = exponent in ]0, + Inf[
exports.expIn = function (t, e) {
	return (1 - Math.pow(EXP, e * t)) / (1 - Math.pow(EXP, e));
};

exports.expOut = function (t, e) {
	return (1 - Math.pow(EXP, - e * t)) / (1 - Math.pow(EXP, - e));
};

exports.expInOut = function (t, e) {
	if (t < 0.5) {
		return (1 - Math.pow(EXP, 2 * e * t)) / (1 - Math.pow(EXP, e)) / 2;
	} else {
		return 0.5 + (1 - Math.pow(EXP, e - 2 * e * t)) / (1 - Math.pow(EXP, - e)) / 2;
	}
};

// Circular
exports.circIn = function (t) {
	return 1 - Math.sqrt(1 - Math.pow(t, 2));
};

exports.circOut = function (t) {
	return Math.sqrt(1 - Math.pow(1 - t, 2));
};

exports.circInOut = function (t) {
	if (t < 0.5) {
		return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
	} else {
		return (1 + Math.sqrt(-3 + 8 * t - 4 * t * t)) / 2;
	}
};

// Elastic, e = elasticity in ]0, +Inf[
exports.elasticIn = function (t, e) {
	if (t === 0) { return 0; }
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(t) / Math.log(e);
	return Math.cos(n) * Math.pow(e, n);
};

exports.elasticOut = function (t, e) {
	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return 1.0 - Math.cos(n) * Math.pow(e, n);
};

exports.elasticInOut = function (t, e) {
	var n;
	if (t < 0.5) {
		if (t === 0) { return 0; }
		e /= (e + 1); // transforming e
		n = (1 + e) * Math.log(2 * t) / Math.log(e);
		return 0.5 * Math.cos(n) * Math.pow(e, n);
	}

	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e
	n = (1 + e) * Math.log(2 - 2 * t) / Math.log(e);
	return 0.5 + 0.5 * (1.0 - Math.cos(n) * Math.pow(e, n));
};

// Bounce, e = elasticity in ]0, +Inf[
exports.bounceIn = function (t, e) {
	if (t === 0) { return 0; }
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(t) / Math.log(e);
	return Math.abs(Math.cos(n) * Math.pow(e, n));
};

exports.bounceOut = function (t, e) {
	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e
	var n = (1 + e) * Math.log(1 - t) / Math.log(e);
	return 1.0 - Math.abs(Math.cos(n) * Math.pow(e, n));
};

exports.bounceInOut = function (t, e) {
	var n;
	if (t < 0.5) {
		if (t === 0) { return 0; }
		e /= (e + 1); // transforming e
		n = (1 + e) * Math.log(2 * t) / Math.log(e);
		return Math.abs(0.5 * Math.cos(n) * Math.pow(e, n));
	}

	if (t === 1) { return 1; }
	e /= (e + 1); // transforming e
	n = (1 + e) * Math.log(2 - 2 * t) / Math.log(e);
	return 0.5 + 0.5 * (1.0 - Math.abs(Math.cos(n) * Math.pow(e, n)));
};

// Back, e = elasticity in [0, +Inf[
exports.backIn = function (t, e) {
	return t * t * ((e + 1) * t - e);
};

exports.backOut = function (t, e) {
	t -= 1;
	return t * t * ((e + 1) * t + e) + 1;
};

exports.backInOut = function (t, e) {
	if (t < 0.5) {
		t *= 2;
		return 0.5 * (t * t * ((e + 1) * t - e));
	}
	t = 2 * t - 2;
	return 0.5 * (t * t * ((e + 1) * t + e)) + 1;
};

},{}],21:[function(require,module,exports){
var TINA = require('./TINA.js');

// TINA.CSSTween        = require('./CSSTween');
TINA.Delay           = require('./Delay');
TINA.BriefExtension  = require('./BriefExtension');
TINA.BriefPlayable   = require('./BriefPlayable');
TINA.BriefPlayer     = require('./BriefPlayer');
TINA.easing          = require('./easing');
TINA.interpolation   = require('./interpolation');
TINA.NestedTween     = require('./NestedTween');
TINA.PixiTween       = require('./NestedTween');
TINA.Playable        = require('./Playable');
TINA.Player          = require('./Player');
TINA.Recorder        = require('./Recorder');
TINA.Sequence        = require('./Sequence');
TINA.Ticker          = require('./Ticker');
TINA.Timeline        = require('./Timeline');
TINA.Timer           = require('./Timer');
TINA.Tween           = require('./Tween');
TINA.Tweener         = require('./Tweener');

module.exports = TINA;

},{"./BriefExtension":2,"./BriefPlayable":3,"./BriefPlayer":4,"./Delay":5,"./NestedTween":7,"./Playable":8,"./Player":9,"./Recorder":10,"./Sequence":11,"./TINA.js":12,"./Ticker":13,"./Timeline":14,"./Timer":15,"./Tween":18,"./Tweener":19,"./easing":20,"./interpolation":23}],22:[function(require,module,exports){
module.exports = function (subobject, superobject) {
	var prototypes = Object.keys(superobject.prototype);
	for (var p = 0; p < prototypes.length; p += 1) {
		var prototypeName = prototypes[p];
		subobject.prototype[prototypeName] = superobject.prototype[prototypeName];
	}
};
},{}],23:[function(require,module,exports){
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
 * create an issue or contribute at https://github.com/Wizcorp/tina.js
 */

// TODO: Test them all!

exports.none = function (t, a, b) {
	return b;
};

exports.linear = function (t, a, b) {
	return a * (1 - t) + b * t;
};

// d = discretization
exports.discrete = function (t, a, b, d) {
	if (d === undefined) { d = 1; }
	return Math.floor((a * (1 - t) + b * t) / d) * d;
};

exports.vectorXY = function (t, a, b) {
	return {
		x: a.x * (1 - t) + b.x * t,
		y: a.y * (1 - t) + b.y * t
	};
};

exports.vectorXYZ = function (t, a, b) {
	return {
		x: a.x * (1 - t) + b.x * t,
		y: a.y * (1 - t) + b.y * t,
		z: a.z * (1 - t) + b.z * t
	};
};

// a, b = vectors
exports.vector = function (t, a, b) {
	var c = [];
	for (var i = 0; i < a.length; i += 1) {
		c[i] = a[i] * (1 - t) + b[i] * t;
	}
	return c;
};

// a, b = states, c = array of intermediary states
exports.state = function (t, a, b, c) {
	var nbStates = b.length + 2;
	var stateIdx = Math.floor(t * nbStates);
	if (stateIdx < 1) { return a; }
	if (stateIdx >= (nbStates - 1)) { return b; }
	return c[stateIdx - 1];
};

// a, b = colors
exports.colorRGB = function (t, a, b) {
	return {
		r: a.r * (1 - t) + b.r * t,
		g: a.g * (1 - t) + b.g * t,
		b: a.b * (1 - t) + b.b * t
	};
};

exports.colorRGBA = function (t, a, b) {
	return {
		r: a.r * (1 - t) + b.r * t,
		g: a.g * (1 - t) + b.g * t,
		b: a.b * (1 - t) + b.b * t,
		a: a.a * (1 - t) + b.a * t
	};
};

exports.colorRGBToHexa = function (t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);

	return '#' + cr.toString(16) + cg.toString(16) + cb.toString(16);
};

exports.colorRGBToString = function (t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);

	return 'rgb(' + cr.toString(16) + ',' + cg.toString(16) + ',' + cb.toString(16) + ')';
};

exports.colorRGBAToString = function (t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);
	var ca = Math.round(a.a * (1 - t) + b.a * t);

	return 'rgba(' + cr.toString(16) + ',' + cg.toString(16) + ',' + cb.toString(16) + ',' + ca + ')';
};

// Interpolation between 2 strings a and b (yes that's possible)
// Returns a string of the same size as b
exports.string = function (t, a, b) {
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

// Bezier, c = array of control points in ]-Inf, +Inf[
exports.bezierQuadratic = function (t, a, b, c) {
	var u = 1 - t;
	return u * u * a + t * (2 * u * c[0] + t * b);
};

exports.bezierCubic = function (t, a, b, c) {
	var u = 1 - t;
	return u * u * u * a + t * (3 * u * u * c[0] + t * (3 * u * c[1] + t * b));
};

exports.bezierQuartic = function (t, a, b, c) {
	var u = 1 - t;
	var u2 = 2 * u;
	return u2 * u2 * a + t * (4 * u * u2 * c[0] + t * (6 * u2 * c[1] + t * (4 * u * c[2] + t * b)));
};

exports.bezierQuintic = function (t, a, b, c) {
	var u = 1 - t;
	var u2 = 2 * u;
	return u2 * u2 * u * a + t * (5 * u2 * u2 * c[0] + t * (10 * u * u2 * c[1] + t * (10 * u2 * c[2] + t * (5 * u * c[3] + t * b))));
};

exports.bezier = function (t, a, b, c) {
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
exports.bezier2d = function (t, a, b, c) {
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
	];
};

// Bezier 3D, c = array of control points in ]-Inf, +Inf[ ^ 3
exports.bezier3d = function (t, a, b, c) {
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
	];
};

// Bezier k-dimensions, c = array of control points in ]-Inf, +Inf[ ^ k
exports.bezierKd = function (t, a, b, c) {
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
exports.catmullRom = function (t, a, b, c) {
	if (t === 1) {
		return c;
	}

	// Finding index corresponding to current time
	var k = a.length;
	var n = b.length + 1;
	t *= n;
	var i = Math.floor(t);
	t -= i;

	var t2 = t * t;
	var t3 = t * t2;
	var w = -0.5 * t3 + 1.0 * t2 - 0.5 * t;
	var x =  1.5 * t3 - 2.5 * t2 + 1.0;
	var y = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
	var z =  0.5 * t3 - 0.5 * t2;

	var i0 = i - 2;
	var i1 = i - 1;
	var i2 = i;
	var i3 = i + 1;

	var p0 = (i0 < 0) ? a : b[i0];
	var p1 = (i1 < 0) ? a : b[i1];
	var p2 = (i3 < n - 2) ? b[i2] : c;
	var p3 = (i3 < n - 2) ? b[i3] : c;

	var res = [];
	for (var j = 0; j < k; j += 1) {
		res[j] = p0[j] * w + p1[j] * x + p2[j] * y + p3[j] * z;
	}

	return res;
};

// Noises functions! (you are welcome)
// Only 1d and 2d for now, if any request for 3d then I will add it to the list

// Creating a closure for the noise function to make 'perm' and 'grad' only accessible to it
exports.noise = (function () {
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
	};
})();

exports.simplex2d = (function () {
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
			var r = (i + j) * g2;

			var x0 = i - r; // Unskew the cell origin back to (x, y) space
			var y0 = j - r;
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
	};
})();
},{}]},{},[21]);
