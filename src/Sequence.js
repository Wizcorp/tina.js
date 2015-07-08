var Timeline = require('./Timeline');

/**
 *
 * @classdesc
 * Manages tweening of one property or several properties of an object
 *
 * @param {object} element Object to tween
 * @param {string} property Property to tween
 * @param {number} a starting value of property
 * @param {number} b ending value of property
 *
 */

function Sequence() {
	if ((this instanceof Sequence) === false) {
		return new Sequence();
	}

	Timeline.call(this);
}
Sequence.prototype = Object.create(Timeline.prototype);
Sequence.prototype.constructor = Sequence;
module.exports = Sequence;

Sequence.prototype.add = function (playable) {
	playable._startTime = this._duration;
	this._duration += playable._duration;
	this._add(playable);
	return this;
};

Sequence.prototype.addDelay = function (duration) {
	this._duration += duration;
	return this;
};