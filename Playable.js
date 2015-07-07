/** @class */
function Playable() {
	this._startTime = 0;
	this._time      = 0;
	this._duration  = 0;

	this._handle = null;
	this._player = null;

	this._onStart    = null;
	this._onPause    = null;
	this._onResume   = null;
	this._onUpdate   = null;
	this._onStop     = null;
	this._onComplete = null;
};
module.exports = Playable;

Playable.prototype.tweener = function (tweener) {
	this._player = tweener;
	return this;
};

Playable.prototype.getDuration = function () {
	return this._duration;
};

Playable.prototype.goTo = function (time) {
	// Offsetting start time with respect to current time
	this._startTime = this._time - time;
	return this;
};

Playable.prototype.goToBeginning = function () {
	this.goTo(0);
	return this;
};

Playable.prototype.goToEnd = function () {
	this.goTo(this.getDuration());
	return this;
};

Playable.prototype.onStart    = function (onStart)    { this._onStart    = onStart;    return this; };
Playable.prototype.onUpdate   = function (onUpdate)   { this._onUpdate   = onUpdate;   return this; };
Playable.prototype.onStop     = function (onStop)     { this._onStop     = onStop;     return this; };
Playable.prototype.onComplete = function (onComplete) { this._onComplete = onComplete; return this; };
Playable.prototype.onPause    = function (onPause)    { this._onPause    = onPause;    return this; };
Playable.prototype.onResume   = function (onResume)   { this._onResume   = onResume;   return this; };

Playable.prototype._update   = function () { if (this._onUpdate   !== null) { this._onUpdate();   } };
Playable.prototype._stop     = function () { if (this._onStop     !== null) { this._onStop();     } };
Playable.prototype._pause    = function () { if (this._onPause    !== null) { this._onPause();    } };
Playable.prototype._resume   = function () { if (this._onResume   !== null) { this._onResume();   } };

Playable.prototype.delay = function (delay) {
	var player = this._player;
	if (player === null) {
		player = TINA.getRunningTweener();
	}
	this._player = player;

	player._delay(this, delay);
	return this;
};

Playable.prototype.start = function (timeOffset) {
	var player = this._player;
	if (player === null) {
		player = TINA.getRunningTweener();
	}

	if (player._add(this) === false) {
		// Could not be started
		return this;
	}

	if (timeOffset === undefined || timeOffset === null) {
		timeOffset = 0;
	}

	this._start(player, timeOffset - player._time);
	return this;
};


Playable.prototype._start = function (player, timeOffset) {
	this._player = player;
	this._startTime = -timeOffset;

	if (this._onStart !== null) {
		this._onStart();
	};
};

Playable.prototype.stop = function () {
	// Stopping playable without performing any additional update nor completing
	if (this._player._finish(this) === false) {
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
	if (this._player._finish(this) === false) {
		// Could not be paused
		return this;
	}

	this._pause();
	return this;
};

Playable.prototype._complete = function (overflow) {
	// Removing playable before it completes
	// So that the playable can be started again within _onComplete callback
	if (this._player._finish(this) === false) {
		// Could not be completed
		return this;
	}

	if (this._onComplete !== null) { 
		this._onComplete(overflow);
	}
};


Playable.prototype._moveTo = function (time, dt) {
	this._time = time - this._startTime;

	// Computing overflow and clamping time
	var overflow;
	if (dt > 0) {
		if (this._time >= this._duration) {
			overflow = this._time - this._duration;
			dt -= overflow;
			this._time = this._duration;
		}
	} else if ((dt < 0) && (this._time <= 0)) {
		overflow = this._time;
		dt -= overflow;
		this._time = 0;
	}

	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};

// Playable.prototype._moveToward = function (dt) {
// 	this._time += dt;

// 	// Computing overflow and clamping time
// 	var overflow;
// 	if (dt > 0) {
// 		if (this._time >= this._duration) {
// 			overflow = this._time - this._duration;
// 			dt -= overflow;
// 			this._time = this._duration;
// 		}
// 	} else if (dt < 0) {
// 		if (this._time <= 0) {
// 			overflow = this._time;
// 			dt -= overflow;
// 			this._time = 0;
// 		}
// 	}

// 	this._update(dt);

// 	if (this._onUpdate !== null) {
// 		this._onUpdate(this._time, dt);
// 	}

// 	if (overflow !== undefined) {
// 		this._complete(overflow);
// 	}
// };

// Overridable method
Playable.prototype._update  = function () {};