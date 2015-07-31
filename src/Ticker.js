var Tweener = require('./Tweener');

/**
 *
 * @classdesc
 * Tweener that manages the update of time independantly of the actual passing of time.
 * Every update, the time interval is equal to the given tupt (time units per tick).
 *
 */
function Ticker(tupt) {
	if ((this instanceof Ticker) === false) {
		return new Ticker(tupt);
	}

	Tweener.call(this);

	// Time units per tick (tupt)
	// Every second, 'tupt' time units elapse
	this.tupt = tupt || 1;

}
Ticker.prototype = Object.create(Tweener.prototype);
Ticker.prototype.constructor = Ticker;
module.exports = Ticker;

Ticker.prototype._getElapsedTime = function () {
	this._nbTicks += this.tupt;
	return this._nbTicks;
};

Ticker.prototype._getSingleStepDuration = function () {
	return this.tupt;
};

Ticker.prototype.convertToTicks = function(timeUnits) {
	return timeUnits / this.tupt;
};

Ticker.prototype.convertToTimeUnits = function(nbTicks) {
	return nbTicks * this.tupt;
};
