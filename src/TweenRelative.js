var Tween              = require('./Tween');
var TransitionRelative = require('./TransitionRelative');

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