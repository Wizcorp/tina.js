var Playable   = require('./Playable');
var DoublyList = require('./DoublyList');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Player() {
	Playable.call(this);

	// A DoublyList, rather than an Array, is used to store playables.
	// It allows for faster removal and is similar in speed for iterations.

	// List of active playables handled by this player
	this._activePlayables = new DoublyList();

	// List of inactive playables handled by this player
	this._inactivePlayables = new DoublyList();

	// List of playables that are not handled by this player anymore and are waiting to be removed
	this._playablesToRemove = new DoublyList();

	// Whether to silence warnings
	this._silent = true;

	// Whether to trigger the debugger on warnings
	this._debug = false;
}
Player.prototype = Object.create(Playable.prototype);
Player.prototype.constructor = Player;
module.exports = Player;

Player.prototype._add = function (playable) {
	if (playable._handle === null) {
		// Playable can be added
		playable._handle = this._inactivePlayables.add(playable);
		playable._player = this;
		// this._onPlayableAdded(playable);
		return true;
	}

	// Playable is already handled, either by this player or by another one
	if (playable._handle.container === this._playablesToRemove) {
		// Playable was being removed, removing from playables to remove
		playable._handle = this._playablesToRemove.removeByReference(playable._handle);
		playable._handle = playable._handle.object;
		return true;
	}

	if (playable._handle.container === this._activePlayables) {
		this._warn('[Player._add] Playable is already present, and active');
		return false;
	}

	if (playable._handle.container === this._inactivePlayables) {
		this._warn('[Player._add] Playable is already present, but inactive (could be starting)');
		return false;
	}

	this._warn('[Player._add] Playable is used elsewhere');
	return false;
};

Player.prototype._remove = function (playable) {
	if (playable._handle === null) {
		this._warn('[Player._remove] Playable is not being used');
		return false;
	}

	// Playable is handled, either by this player or by another one
	if (playable._handle.container === this._activePlayables) {
		// Playable was active, adding to remove list
		playable._handle = this._playablesToRemove.add(playable._handle);
		return true;
	}

	if (playable._handle.container === this._inactivePlayables) {
		// Playable was inactive, removing from inactive playables
		playable._handle = this._inactivePlayables.removeByReference(playable._handle);
		return true;
	}

	if (playable._handle.container === this._playablesToRemove) {
		this._warn('[Player._remove] Playable is already being removed');
		return false;
	}

	this._warn('[Player._remove] Playable is used elsewhere');
	return false;
};

Player.prototype.remove = function (playable) {
	if (playable._handle.container === this._activePlayables) {
		playable.stop();
	}

	this._remove(playable);
	this._onPlayableRemoved(playable);
	return this;
};

Player.prototype.removeAll = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		handle.object.stop();
		handle = next;
	}

	this._handlePlayablesToRemove();
	return this;
};

Player.prototype.possess = function (playable) {
	if (playable._handle === null) {
		return false;
	}

	return (playable._handle.container === this._activePlayables) || (playable._handle.container === this._inactivePlayables);
};

Player.prototype._handlePlayablesToRemove = function () {
	while (this._playablesToRemove.length > 0) {
		// O(1) where O stands for "Oh yeah"

		// Removing from list of playables to remove
		var handle = this._playablesToRemove.pop();

		// Removing from list of active playables
		var playable = handle.object;
		playable._handle = this._activePlayables.removeByReference(handle);
	}

	if ((this._activePlayables.length === 0) && (this._inactivePlayables.length === 0)) {
		this._onAllPlayablesRemoved();
	}
};

Player.prototype.clear = function () {
	this._activePlayables.clear();
	this._inactivePlayables.clear();
	this._playablesToRemove.clear();
	this._controls.clear();
	return this;
};

Player.prototype._warn = function (warning) {
	// jshint debug: true
	if (this._silent === false) {
		console.warn('[TINA]' + warning);
	}

	if (this._debug === true) {
		debugger;
	}
};

Player.prototype.silent = function (silent) {
	this._silent = silent || false;
	return this;
};

Player.prototype.debug = function (debug) {
	this._debug = debug || false;
	return this;
};

Player.prototype.stop = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		var playable = handle.object;
		playable.stop();
		handle = next;
	}

	this._handlePlayablesToRemove();
	Playable.prototype.stop.call(this);
};

Player.prototype._activate = function (playable) {
	if (playable._handle.container === this._inactivePlayables) {
		this._inactivePlayables.removeByReference(playable._handle);
		playable._handle = this._activePlayables.addBack(playable);
	} else if (playable._handle.container === this._playablesToRemove) {
		// Already in list of active playables
		this._playablesToRemove.removeByReference(playable._handle);
		playable._handle = playable._handle.object;
	}

	playable._active = true;
	return true;
};

Player.prototype._reactivate = Player.prototype._activate;

Player.prototype._inactivate = function (playable) {
	if (playable._handle === null) {
		this._warn('[Player._inactivate] Cannot stop a playable that is not running');
		return false;
	}

	if (playable._handle.container === this._activePlayables) {
		// O(1)
		this._activePlayables.removeByReference(playable._handle);
		playable._handle = this._inactivePlayables.addBack(playable);
	}

	playable._active = false;
	return true;
};

Player.prototype._updatePlayableList = function (dt) {
	this._handlePlayablesToRemove();

	var time0, time1;
	if (dt > 0) {
		time0 = this._time - dt;
		time1 = this._time;
	} else {
		time0 = this._time;
		time1 = this._time - dt;
	}

	// Activating playables
	var handle = this._inactivePlayables.first;
	while (handle !== null) {
		var playable = handle.object;

		// Fetching handle of next playable
		handle = handle.next;

		// Starting if player time within playable bounds
		// console.log('Should playable be playing?', playable._startTime, time0, time1, dt)
		if (playable._active && playable._overlaps(time0, time1)) {
			this._activate(playable);
			playable._start();
		}
	}
};

Player.prototype._update = function (dt, overflow) {
	this._updatePlayableList(dt);
	for (var handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		if (overflow === undefined) {
			handle.object._moveTo(this._time, dt);
		} else {
			handle.object._moveTo(this._time, dt, overflow);
		}
	}
};

// Overridable methods
// Player.prototype._onPlayableAdded   = function (/* playable */) {};
Player.prototype._onPlayableChanged = function (/* playable */) {};
Player.prototype._onPlayableRemoved = function (/* playable */) {};
Player.prototype._onAllPlayablesRemoved = function () {};