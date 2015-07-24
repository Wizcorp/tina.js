var BoundedPlayable = require('./BoundedPlayable');
var PlayableHandler = require('./PlayableHandler');

var inherit = require('./inherit');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function BoundedPlayer() {
	BoundedPlayable.call(this);
	PlayableHandler.call(this);
}
BoundedPlayer.prototype = Object.create(BoundedPlayable.prototype);
BoundedPlayer.prototype.constructor = BoundedPlayer;
inherit(BoundedPlayer, PlayableHandler);

module.exports = BoundedPlayer;

BoundedPlayer.prototype._delay = function () {
	this._warn('[BoundedPlayer._delay] This player does not support the delay functionality', this);
};

BoundedPlayer.prototype.stop = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		var playable = handle.object;
		playable.stop();
		handle = next;
	}

	this._handlePlayablesToRemove();

	if (this._player._inactivate(this) === false) {
		// Could not be stopped
		return this;
	}

	this._stop();
	return this;
};

BoundedPlayer.prototype._moveTo = function (time, dt) {
	dt *= this._speed;

	// Computing overflow and clamping time
	var overflow;
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

	this._updatePlayableList(); // <- This is the difference from Playable._moveTo
	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};

// Overridable method
BoundedPlayer.prototype._updatePlayableList = function () {};