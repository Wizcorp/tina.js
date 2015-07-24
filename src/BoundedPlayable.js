var Playable = require('./Playable');

/** @class */

// A playable with its time 
function BoundedPlayable() {
	Playable.call(this);
	this._duration   = 0;

	// Playing options
	this._iterations = 1; // Number of times to iterate the playable
	this._persist    = false; // To keep the playable running instead of completing
	this._pingpong   = false; // To make the playable go backward on even iterations

	this._onComplete = null;
}

BoundedPlayable.prototype = Object.create(Playable.prototype);
BoundedPlayable.prototype.constructor = BoundedPlayable;
module.exports = BoundedPlayable;

BoundedPlayable.prototype.onComplete = function (onComplete) {
	this._onComplete = onComplete;
	return this;
};

BoundedPlayable.prototype.getDuration = function () {
	// Duration from outside the playable
	return this._duration * this._iterations / this._speed;
};

BoundedPlayable.prototype.goToEnd = function () {
	this.goTo(this.getDuration(), this._iterations - 1);
	return this;
};

BoundedPlayable.prototype.loop = function () {
	return this.iterations(Infinity);
};

BoundedPlayable.prototype.iterations = function (iterations) {
	if (iterations < 0) {
		console.warn('[BoundedPlayable.iterations] Number of iterations cannot be negative');
		return this;
	}

	this._iterations = iterations;
	return this;
};

BoundedPlayable.prototype.persist = function (persist) {
	this._persist = persist;
	return this;
};

BoundedPlayable.prototype.pingpong = function (pingpong) {
	this._pingpong = pingpong;
	return this;
};

BoundedPlayable.prototype._complete = function (overflow) {
	if (this._persist === true) {
		// BoundedPlayable is persisting
		// i.e it never completes
		this._startTime += overflow;
		return;
	}

	// Removing playable before it completes
	// So that the playable can be started again within _onComplete callback
	if (this._player._inactivate(this) === false) {
		// Could not be completed
		return this;
	}

	if (this._onComplete !== null) { 
		this._onComplete(overflow);
	}
};

BoundedPlayable.prototype._start = function (timeOffset) {
	this._startTime = -timeOffset;

	if (this._onStart !== null) {
		this._onStart();
	}

	// Making sure the playable is not over yet
	if (timeOffset >= this.getDuration()) {
		// Playable is over
		// Moving it to given time offset
		// This will have the effect of completing it
		this._moveTo(this._startTime + timeOffset, timeOffset);
	}
};

BoundedPlayable.prototype._moveTo = function (time, dt) {
	dt *= this._speed;

	// Computing overflow and clamping time
	var overflow;
	if (this._speed !== 0) {
		if (this._iterations === 1) {
			// Converting into local time (relative to speed and when the playable started)
			this._time = (time - this._startTime) * this._speed;
			if (dt > 0) {
				if (this._time >= this._duration) {
					overflow = this._time - this._duration;
					dt -= overflow;
					this._time = this._duration;
				}
			} else if (dt < 0) {
				if (this._time <= 0) {
					overflow = this._time;
					dt -= overflow;
					this._time = 0;
				}
			}
		} else {
			time = (time - this._startTime) * this._speed;

			// Iteration at current update
			var iteration = time / this._duration;

			if (dt > 0) {
				if (iteration < this._iterations) {
					this._time = time % this._duration;
				} else {
					overflow = (iteration - this._iterations) * this._duration;
					dt -= overflow;
					this._time = this._duration * (1 - (Math.ceil(this._iterations) - this._iterations));
				}
			} else if (dt < 0) {
				if (0 < iteration) {
					this._time = time % this._duration;
				} else {
					overflow = iteration * this._duration;
					dt -= overflow;
					this._time = 0;
				}
			}

			if ((this._pingpong === true)) {
				if (Math.ceil(this._iterations) === this._iterations) {
					if (overflow === undefined) {
						if ((Math.ceil(iteration) & 1) === 0) {
							this._time = this._duration - this._time;
						}
					} else {
						if ((Math.ceil(iteration) & 1) === 1) {
							this._time = this._duration - this._time;
						}
					}
				} else {
					if ((Math.ceil(iteration) & 1) === 0) {
						this._time = this._duration - this._time;
					}
				}
			}
		}
	}

	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};

// Overridable method
BoundedPlayable.prototype._update  = function () {};