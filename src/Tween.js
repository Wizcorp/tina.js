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