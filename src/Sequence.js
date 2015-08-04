var Timeline = require('./Timeline');
var Delay    = require('./Delay');

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
	return Timeline.prototype.add.call(this, playable, this._duration);
};

Sequence.prototype.addDelay = function (duration) {
	return this.add(new Delay(duration));
};

Sequence.prototype._onPlayableRemoved = function (removedPlayable) {
	var handle, playable;

	var startTime = removedPlayable._startTime;
	var endTime   = startTime + removedPlayable.getDuration();
	if (startTime > endTime) {
		var tmp = startTime;
		startTime = endTime;
		endTime = tmp;
	}

	if (this._time < endTime) { // Playing head is before the end of the removed playable
		// Shifting all the playables that come after the removed playable
		var leftShit = endTime - this._time;
		for (handle = this._activePlayables.first; handle !== null; handle = handle.next) {
			playable = handle.object;
			if (removedPlayable._startTime < playable._startTime) {
				playable._startTime -= leftShit;
			}
		}

		for (handle = this._inactivePlayables.first; handle !== null; handle = handle.next) {
			playable = handle.object;
			if (removedPlayable._startTime < playable._startTime) {
				playable._startTime -= leftShit;
			}
		}
	}

	if (this._time > startTime) { // Playing head is after the start of the removed playable
		// Shifting the starting time of the sequence
		var rightShift = this._time - startTime;
		this._startTime += rightShift;
	}

	this._updateDuration();
};

// TODO:
// Sequence.prototype.substitute = function (playableA, playableB) {
// };

