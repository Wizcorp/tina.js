var Tween         = require('./Tween');
var updateMethods = require('./updateMethodsRelative');

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
		this.prev = 0;
	} else {
		propsFlag  = 1;
		this.props = properties;
		this.prev  = {};
	}

	this.update = updateMethods[easingFlag][interpFlag][propsFlag];
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

function TweenRelative(object, properties) {
	if ((this instanceof TweenRelative) === false) {
		return new TweenRelative(object, properties);
	}

	Tween.call(this);
}
TweenRelative.prototype = Object.create(Tween.prototype);
TweenRelative.prototype.constructor = TweenRelative;
module.exports = TweenRelative;

TweenRelative.prototype.Transition = TransitionRelative;