var Tweener = require('./Tweener');

/**
 *
 * @classdesc
 * Tweener that manages the update of time relatively to the actual passing of time.
 * Every update, the time interval is equal to the elapsed time in seconds multiplied by the tups (time units per second).
 *
 */
function Timer(tups) {
	if ((this instanceof Timer) === false) {
		return new Timer(tups);
	}

	Tweener.call(this);

	// Time units per second (tups)
	// Every second, 'tups' time units elapse
	this._tups = tups || 1000;
}
Timer.prototype = Object.create(Tweener.prototype);
Timer.prototype.constructor = Timer;
module.exports = Timer;

Object.defineProperty(Timer.prototype, 'tups', {
	get: function () { return this._tups; },
	set: function (tups) {
		if (tups < 0) {
			this._warn('[Timer.tups] tups cannot be negative, stop messing with time.');
			tups = 0;
		}

		if (tups === 0) {
			// Setting start as if new tups was 1
			this._startTime += this._time / this._tups - this._time;
		} else {
			if (this._tups === 0) {
				// If current tups is 0,
				// it corresponds to a virtual tups of 1
				// when it comes to determing where the start is
				this._startTime = this._time - this._time / tups;
			} else {
				this._startTime = this._time / this._tups - this._time / tups;
			}
		}

		this._tups = tups;
	}
});

Timer.prototype._getElapsedTime = function (time) {
	return this._tups * (time - this._startTime) / 1000;
};

Timer.prototype._getSingleStepDuration = function (dt) {
	return this._tups * dt / 1000;
};

Timer.prototype.convertToSeconds = function(timeUnits) {
	return timeUnits / this._tups;
};

Timer.prototype.convertToTimeUnits = function(seconds) {
	return seconds * this._tups;
};