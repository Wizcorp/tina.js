Playable = require('./Playable');

/** @class */
function Controller(playable, speed) {
	Playable.call(this);

	if (speed === null || speed === undefined) {
		speed = 1;
	}

	this._speed      = speed; // Running speed of the playable
	this._iterations = 1;     // Number of times to iterate the playable
	this._persist    = false; // To keep the playable running instead of completing
	this._pingpong   = false; // To make the playable go backward on even iterations
	this._pongping   = false; // To make the playable go backward on odd iterations
};
Controller.prototype = Object.create(Playable.prototype);
Controller.prototype.constructor = Controller;
module.exports = Controller;

var myTween = new TINA.Tween(myObject, ['x']).to(5, { x: 2 })
var myController = new Controller(myTween, speed).iterations(2).persist(true).start();

Object.defineProperty(Controller.prototype, 'speed', {
	get: function () { return this._speed; },
	set: function (speed) {
		var dt = this._time - this._startTime;
		if (speed === 0) {
			// Setting timeStart as if new speed was 1
			this._startTime = this._time - dt * this._speed;
		} else {
			if (this._speed === 0) {
				// If current speed is 0,
				// it corresponds to a virtual speed of 1
				// when it comes to determing where the starting time is
				this._startTime = this._time - dt / speed;
			} else {
				this._startTime = this._time - dt * this._speed / speed;
			}
		}

		this._speed = speed;
	}
});

Object.defineProperty(Controller.prototype, 'time', {
	get: function () {
		if(this._speed === 0) {
			// Speed is virtually 1
			return this._time - this._startTime;
		} else {
			return (this._time - this._startTime) * this._speed;
		},
	set: function (time) {
		this.goTo(time);
	}
});

Controller.prototype.goToBeginning = function () {
	this.goTo(0);
	return this;
};

Controller.prototype.goToEnd = function () {
	this.goTo(this.getDuration());
	return this;
};

Controller.prototype.goTo = function (time) {
	if(this._speed === 0) {
		// Speed is virtually 1
		this._startTime = this._time - time;
	} else {
		// Offsetting timeStart with respect to timeNow and speed
		this._startTime = this._time - time / this._speed;
	}
	return this;
};

Controller.prototype.getDuration = function () {
	return this._duration * this._iterations;
};

Controller.prototype.getAbsoluteDuration = function () {
	return this._duration * this._iterations / this._speed;
};

Controller.prototype.persist = function (persist) {
	this._persist = persist;
	return this;
};

Controller.prototype.pingpong = function (pingpong) {
	this._pingpong = pingpong;
	return this;
};

Controller.prototype.pongping = function (pongping) {
	this._pongping = pongping;
	return this;
};

Controller.prototype._update = function (time, dt) {
	// Converting absolute time into relative time
	var t = (time - this._startTime) * this._speed;

	// Iteration at current update
	var currentIteration = t / this._duration;

	if (currentIteration < this._iterations) {
		// Setting time within current iteration
		t = t % this._duration;
	}

	if (((this._pingpong === true) && (Math.ceil(currentIteration) % 2 === 0)) ||
		((this._pongping === true) && (Math.ceil(currentIteration) % 2 === 1))) {
		// Reversing time
		t = this._duration - t;
	}

	this._playable._upate(t);

	// Callback triggered before resetting time
	if (this._onUpdate !== null) {
		var dt = time - this._time;
		this._onUpdate(t, dt);
	}
	
	if (timeOverflow === undefined) {
		this._time = time;
		// Not completed, no overflow
		return;
	}

	if (currentIteration < this._iterations) {
		// Keep playing, no overflow
		this._time = time;
		return;
	}

	if (this._persist === true) {
		// Playable keeps playing even if it has reached its end
		// Can only be stopped manually
		if (timeOverflow > 0) {
			// Time flows positively
			// The end is the end
			if (this._speed === 0) {
				this._startTime = time - this._duration * this._iterations;
			} else {
				this._startTime = time - (this._duration * this._iterations) / this._speed;
			}
		} else {
			// Time flows negatively
			// The beginning is the end (is the beginning, c.f Smashing Pumpkins)
			this._startTime = time;
		}

		// No overflow
		this._time = time;
		return;
	}

	// Direction of the playable
	dt = time - this._time;
	this._time = time;

	// The playable completes
	return this._complete(timeOverflow, dt);
};
