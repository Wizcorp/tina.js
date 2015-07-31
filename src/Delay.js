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