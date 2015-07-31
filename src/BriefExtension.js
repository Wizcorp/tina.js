
function BriefExtension() {
	// A brief component has a duration
	this._duration   = 0;

	// And can complete
	this._onComplete = null;

	// Playing options
	this._iterations = 1; // Number of times to iterate the playable
	this._persist    = false; // To keep the playable running instead of completing
	this._pingpong   = false; // To make the playable go backward on even iterations
}

module.exports = BriefExtension;

BriefExtension.prototype.onComplete = function (onComplete) {
	this._onComplete = onComplete;
	return this;
};

BriefExtension.prototype.getDuration = function () {
	// Duration from outside the playable
	return this._duration * this._iterations / this._speed;
};

BriefExtension.prototype.goToEnd = function () {
	this.goTo(this.getDuration(), this._iterations - 1);
	return this;
};

BriefExtension.prototype.loop = function () {
	return this.iterations(Infinity);
};

BriefExtension.prototype.iterations = function (iterations) {
	if (iterations < 0) {
		console.warn('[BriefExtension.iterations] Number of iterations cannot be negative');
		return this;
	}

	this._iterations = iterations;
	if (this._player !== null) {
		this._player._onPlayableChange(this);
	}
	return this;
};

BriefExtension.prototype.persist = function (persist) {
	this._persist = persist;
	if (this._player !== null) {
		this._player._onPlayableChange(this);
	}
	return this;
};

BriefExtension.prototype.pingpong = function (pingpong) {
	this._pingpong = pingpong;
	if (this._player !== null) {
		this._player._onPlayableChange(this);
	}
	return this;
};

BriefExtension.prototype._complete = function (overflow) {
	if (this._persist === true) {
		// Playable is persisting
		// i.e it never completes
		this._startTime += overflow;
		this._player._onPlayableChange(this);
		return;
	}

	// Inactivating playable before it completes
	// So that the playable can be reactivated again within _onComplete callback
	if (this._player._inactivate(this) === false) {
		// Could not be completed
		return this;
	}

	if (this._onComplete !== null) { 
		this._onComplete(overflow);
	}
};

BriefExtension.prototype._moveTo = function (time, dt) {
	dt *= this._speed;

	// Computing overflow and clamping time
	var overflow;
	if (dt !== 0) {
		if (this._iterations === 1) {
			// Converting into local time (relative to speed and starting time)
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