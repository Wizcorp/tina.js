/** @class */
function Playable() {
	// Player component handling this playable
	this._player = null;

	// Handle of the playable within its player
	this._handle = null;

	// Starting time, is global (relative to its player time)
	this._startTime  = 0;

	// Current time, is local (relative to starting time)
	// i.e this._time === 0 implies this._player._time ===  this._startTime
	this._time       = 0;

	// Playing speed of the playable
	this._speed      = 1;

	// Callbacks
	this._onStart    = null;
	this._onPause    = null;
	this._onResume   = null;
	this._onUpdate   = null;
	this._onStop     = null;
}

module.exports = Playable;

Object.defineProperty(Playable.prototype, 'speed', {
	get: function () { return this._speed; },
	set: function (speed) {
		// TODO: enable speed of a playable to be changed while attached to a bounded player
		if ((this._player !== null) && (this._player._duration !== undefined)) {
			console.warn('[Playable.speed] It is not recommended to change the speed of a playable that is attached to the given player:', this._player);
		}

		if (speed === 0) {
			if (this._speed !== 0) {
				// Setting timeStart as if new speed was 1
				this._startTime += this._time / this._speed - this._time;
			}
		} else {
			if (this._speed === 0) {
				// If current speed is 0,
				// it corresponds to a virtual speed of 1
				// when it comes to determing where the starting time is
				this._startTime += this._time - this._time / speed;
			} else {
				this._startTime += this._time / this._speed - this._time / speed;
			}
		}

		this._speed = speed;
	}
});

Object.defineProperty(Playable.prototype, 'time', {
	get: function () { return this._time; },
	set: function (time) {
		if ((this._player !== null) && (this._player._duration !== undefined)) {
			console.warn('[Playable.time] It is not recommended to change the time of a playable that is attached to the given player:', this._player);
		}

		this.goTo(time);
	}
});

Playable.prototype.onStart    = function (onStart)    { this._onStart    = onStart;    return this; };
Playable.prototype.onUpdate   = function (onUpdate)   { this._onUpdate   = onUpdate;   return this; };
Playable.prototype.onStop     = function (onStop)     { this._onStop     = onStop;     return this; };
Playable.prototype.onPause    = function (onPause)    { this._onPause    = onPause;    return this; };
Playable.prototype.onResume   = function (onResume)   { this._onResume   = onResume;   return this; };

Playable.prototype._update   = function () { if (this._onUpdate   !== null) { this._onUpdate();   } };
Playable.prototype._stop     = function () { if (this._onStop     !== null) { this._onStop();     } };
Playable.prototype._pause    = function () { if (this._onPause    !== null) { this._onPause();    } };
Playable.prototype._resume   = function () { if (this._onResume   !== null) { this._onResume();   } };

Playable.prototype.tweener = function (tweener) {
	this._player = tweener;
	return this;
};

Playable.prototype.goTo = function (timePosition, iteration) {
	if (this._iterations === 1) {
		if(this._speed === 0) {
			// Speed is virtually 1
			this._startTime += this._time - timePosition;
		} else {
			// Offsetting starting time with respect to current time and speed
			this._startTime += (this._time - timePosition) / this._speed;
		}
	} else {
		iteration = iteration || 0;
		if(this._speed === 0) {
			// Speed is virtually 1
			this._startTime += this._time - timePosition - iteration * this._duration;
		} else {
			// Offsetting starting time with respect to current time and speed
			this._startTime += (this._time - timePosition - iteration * this._duration) / this._speed;
		}
	}

	this._time = timePosition;
	// iteration = iteration || 0;
	// // Offsetting start time with respect to current time and given iteration
	// this._startTime = this._time - time - iteration * this._duration;
	return this;
};

Playable.prototype.rewind = function () {
	this.goTo(0, 0);
	return this;
};

Playable.prototype.delay = function (delay) {
	if (this._player === null) {
		this._player = TINA._getDefaultTweener();
	}
	// TODO: add _delay method to TINA
	this._player._delay(this, delay);
	return this;
};

Playable.prototype.start = function (timeOffset) {
	var player = this._player;
	if (player === null) {
		player = TINA._getDefaultTweener();
	}

	if (player._add(this) === false) {
		// Could not be started
		return this;
	}

	if (timeOffset === undefined || timeOffset === null) {
		timeOffset = 0;
	}

	this._start(timeOffset - player._time);
	return this;
};

Playable.prototype._start = function (timeOffset) {
	this._startTime = -timeOffset;

	if (this._onStart !== null) {
		this._onStart();
	}
};

Playable.prototype.stop = function () {
	// Stopping playable without performing any additional update nor completing
	if (this._player._inactivate(this) === false) {
		// Could not be stopped
		return this;
	}

	this._stop();
	return this;
};

Playable.prototype.resume = function () {
	if (this._player._add(this) === false) {
		// Could not be resumed
		return this;
	}

	this._resume();
	return this;
};

Playable.prototype.pause = function () {
	if (this._player._inactivate(this) === false) {
		// Could not be paused
		return this;
	}

	this._pause();
	return this;
};


Playable.prototype._moveTo = function (time, dt) {
	dt *= this._speed;

	this._time = (time - this._startTime) * this._speed;
	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}
};

// Overridable method
Playable.prototype._update  = function () {};