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

		if (this._relative === true) {
			transition.update(this._object, 1);
		}
		transition = this._transitions[++this._index];
	}
	while (this._time <= transition.start) {
		if (this._index === 0) {
			transition.update(this._object, 0);
			return;
		}

		if (this._relative === true) {
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