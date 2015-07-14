var BoundedPlayable = require('./BoundedPlayable');
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

	BoundedPlayable.call(this);

	// Map if tween per object for fast access
	this._tweensPerObject = {};

	// Array of tween for fast iteration when udpating
	this._tweens = [];

	// Property chains per object
	this._propertyChains = {};

	// Array of object chains
	this._objectChains = [];

	var propertiesPerObject = {};
	var objects = {};

	for (var p = 0; p < properties.length; p += 1) {
		var propertyString = properties[p];
		var objectChain = propertyString.substring(0, propertyString.lastIndexOf('.'));

		if (propertiesPerObject[objectChain] === undefined) {
			// Fetching object and property
			var propertyChain = propertyString.split('.');
			var propertyIndex = propertyChain.length - 1;
			var propertyObject = object;

			// Following the chain to get the object
			for (var c = 0; c < propertyIndex; c += 1) {
				propertyObject = propertyObject[propertyChain[c]];
			}

			propertiesPerObject[objectChain] = [propertyChain[propertyIndex]];
			objects[objectChain] = propertyObject;
			this._objectChains.push(objectChain);
			this._propertyChains[objectChain] = propertyChain;
			continue;
		}

		// Object was already fetched
		var property = propertyString.substring(propertyString.lastIndexOf('.') + 1);
		propertiesPerObject[objectChain].push(property);
	}

	// Creating the tweens
	for (var objectChain in objects) {
		var tweenObject     = objects[objectChain];
		var tweenProperties = propertiesPerObject[objectChain];
		var tween = new AbstractTween(tweenObject, tweenProperties);
		this._tweens.push(tween);
		this._tweensPerObject[objectChain] = tween;
	}
}
NestedTween.prototype = Object.create(BoundedPlayable.prototype);
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
		this._tweens[t].reset;
	}

	this._duration = 0;
	return this;
};

NestedTween.prototype.interpolations = function (interpolations) {
	// Dispatching interpolations
	for (var o = 0; o < this._objectChains.length; o += 1) {
		var objectChain = this._objectChains[o];
		var propertyChain = this._propertyChains[objectChain];
		var propertyIndex = propertyChain.length - 1;

		var objectInterpolations = interpolations;
		for (var c = 0; c < propertyIndex && objectInterpolations !== undefined; c += 1) {
			objectInterpolations = objectInterpolations[propertyChain[c]];
		}

		if (objectInterpolations !== undefined) {
			this._tweensPerObject[objectChain].interpolations(objectInterpolations);
		}
	}

	return this;
};

NestedTween.prototype.from = function (fromObject) {
	// Dispatching from
	for (var o = 0; o < this._objectChains.length; o += 1) {
		var objectChain = this._objectChains[o];
		var propertyChain = this._propertyChains[objectChain];
		var propertyIndex = propertyChain.length - 1;

		var object = fromObject;
		for (var c = 0; c < propertyIndex && object !== undefined; c += 1) {
			object = object[propertyChain[c]];
		}

		if (object !== undefined) {
			this._tweensPerObject[objectChain].from(object);
		}
	}

	return this;
};

NestedTween.prototype.to = function (toObject, duration, easing, easingParam, interpolationParams) {
	// Dispatching to
	for (var o = 0; o < this._objectChains.length; o += 1) {
		var objectChain = this._objectChains[o];
		var propertyChain = this._propertyChains[objectChain];
		var propertyIndex = propertyChain.length - 1;

		var object = toObject;
		for (var c = 0; c < propertyIndex; c += 1) {
			object = object[propertyChain[c]];
		}

		var objectInterpolationParams = interpolationParams;
		for (var c = 0; c < propertyIndex && objectInterpolationParams !== undefined; c += 1) {
			objectInterpolationParams = objectInterpolationParams[propertyChain[c]];
		}

		this._tweensPerObject[objectChain].to(object, duration, easing, easingParam, objectInterpolationParams);
	}

	this._duration += duration;
	return this;
};

NestedTween.prototype.wait = function (duration) {
	// Dispatching wait
	for (var t = 0; t < this._tweens.length; t += 1) {
		this._tweens[t].wait(duration);
	}

	this._duration += duration;
	return this;
};

NestedTween.prototype._update = function () {
	for (var t = 0; t < this._tweens.length; t += 1) {
		var tween = this._tweens[t];
		tween._time = this._time;
		tween._update();
	}
};