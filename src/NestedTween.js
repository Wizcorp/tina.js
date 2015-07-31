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