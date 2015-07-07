var Playable      = require('./Playable');
var updateMethods = require('./updateMethods');

var easingFunctions        = require('./easing');
var interpolationFunctions = require('./interpolation');

function TimeFrame(start, duration) {
	this.start    = start;
	this.end      = start + duration;
	this.duration = duration;
}

function Transition(properties, from, to, start, duration, easing, easingParam, interpolations, interpolationParams) {
	TimeFrame.call(this, start, duration);

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
	// 1 => Using custom easing
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

// Temporisation, used for waiting
function Temporisation(start, duration, toObject) {
	TimeFrame.call(this, start, duration);
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
	Playable.call(this);

	// Tweened object
	this._object = object;

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

Tween.prototype.reset = function () {
	this._current     = 0;
	this._transitions = [];

	return this;
};

Tween.prototype.interpolations = function (interpolations) {
	// The API allows to pass interpolation names that will be replaced
	// by the corresponding interpolation functions
	var interpolatedProperties = Object.keys(interpolations);
	for (var p = 0; p < interpolatedProperties.length; p += 1) {
		var property = interpolatedProperties[p];
		var interpolation = interpolations[property];
		if (typeof(interpolation) === 'string') {
			// Replacing interpolation name by interpolation function
			if (interpolations[property] === undefined) {
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

Tween.prototype._setFromObject = function (fromObject) {
	// Copying properties of given object
	this._from = {};
	for (var p = 0; p < this._properties.length; p += 1) {
		var property = this._properties[p];
		this._from[property] = fromObject[property];
	}

	return this._from;
};

Tween.prototype._getLastTransitionEnding = function () {
	if (this._transitions.length > 0) {
		return this._transitions[this._transitions.length - 1].to;
	} else {
		return (this._from === null) ? this._setFromObject(this._object) : this._from;
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

	// Getting 'to' object of previous transition, if any,
	// as 'from' object for new transition
	var fromObject = this._getLastTransitionEnding();
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