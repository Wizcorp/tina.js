var Playable   = require('./Playable');
var Transition = require('./Transition');

var easingFunctions        = require('./easing');
var interpolationFunctions = require('./interpolation');


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
		}

		transition = this._transitions[++this._current];
	}

	while (this._time <= transition.start) {
		if (this._current === 0) {
			transition.update(this._object, 0);
			return;
		}

		transition = this._transitions[--this._current];
	}

	// Updating the object with respect to the current transition and time
	transition.update(this._object, (this._time - transition.start) / transition.duration);
};