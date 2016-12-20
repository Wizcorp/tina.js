var BriefPlayable = require('./BriefPlayable');

/**
 * @classdesc
 * Manages tweening of one property or several properties of an object
 */

function Delay(duration, onComplete) {
	if ((this instanceof Delay) === false) {
		return new Delay(duration);
	}

	BriefPlayable.call(this);
	this.reset(duration, onComplete);
}
Delay.prototype = Object.create(BriefPlayable.prototype);
Delay.prototype.constructor = Delay;
module.exports = Delay;

Delay.prototype.reset = function (duration, onComplete) {
	this._duration = duration;
	if (onComplete !== undefined) {
		this.onComplete(onComplete);
	}

	return this;
};