var BriefPlayer = require('./BriefPlayer');

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

function Timeline() {
	if ((this instanceof Timeline) === false) {
		return new Timeline();
	}

	BriefPlayer.call(this);
}
Timeline.prototype = Object.create(BriefPlayer.prototype);
Timeline.prototype.constructor = Timeline;
module.exports = Timeline;

Timeline.prototype.add = function (playable, startTime) {
	if (startTime === null || startTime === undefined) {
		startTime = 0;
	}

	playable._startTime = startTime;
	this._add(playable);
	this._duration = Math.max(this._duration, startTime + playable.getDuration());
	return this;
};