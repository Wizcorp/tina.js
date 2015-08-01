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
	this._speed = (tups / 1000) || 1;
}
Timer.prototype = Object.create(Tweener.prototype);
Timer.prototype.constructor = Timer;
module.exports = Timer;

Object.defineProperty(Timer.prototype, 'tups', {
	get: function () { return this._speed * 1000; },
	set: function (tups) { this.speed = tups / 1000; }
});

Timer.prototype.convertToSeconds = function(timeUnits) {
	return timeUnits / (this._speed * 1000);
};

Timer.prototype.convertToTimeUnits = function(seconds) {
	return seconds * this._speed * 1000;
};