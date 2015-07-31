var Playable     = require('./Playable');
var DoublyList   = require('./DoublyList');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function PlayableHandler() {
	Playable.call(this);

	// A DoublyList, rather than an Array, is used to store playables.
	// It allows for faster removal and is similar in speed for iterations.

	// Quick note: as of mid 2014 iterating through linked list was slower than iterating through arrays
	// in safari and firefox as only V8 managed to have linked lists work as fast as arrays.
	// As of mid 2015 it seems that performances are now identical in every major browsers.
	// (KUDOs to the JS engines guys)

	// List of active playables handled by this player
	this._activePlayables = new DoublyList();

	// List of inactive playables handled by this player
	this._inactivePlayables = new DoublyList();

	// List of playables that are not handled by this player anymore and are waiting to be removed
	this._playablesToRemove = new DoublyList();

	// Whether to silence warnings
	this._silent = false;

	// Whether to trigger the debugger on warnings
	this._debug = false;
}
PlayableHandler.prototype = Object.create(Playable.prototype);
PlayableHandler.prototype.constructor = PlayableHandler;
module.exports = PlayableHandler;

PlayableHandler.prototype._add = function (playable, delay) {
	if (playable._handle === null) {
		// Playable can be added
		playable._handle = this._inactivePlayables.add(playable);
		playable._player = this;
		return true;
	}

	// Playable is already handled, either by this player or by another one
	if (playable._handle.container === this._playablesToRemove) {
		// Playable was being removed, removing from playables to remove
		playable._handle = this._playablesToRemove.removeByReference(playable._handle);
		return true;
	}

	if (playable._handle.container === this._activePlayables) {
		this._warn('[PlayableHandler._add] Playable is already present, and active');
		return false;
	}

	if (playable._handle.container === this._inactivePlayables) {
		this._warn('[PlayableHandler._add] Playable is already present, but inactive (could be starting)');
		return false;
	}

	this._warn('[PlayableHandler._add] Playable is used elsewhere');
	return false;
};

PlayableHandler.prototype._remove = function (playable) {
	if (playable._handle === null) {
		this._warn('[PlayableHandler._remove] Playable is not being used');
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
		this._warn('[PlayableHandler._remove] Playable is already being removed');
		return false;
	}

	this._warn('[PlayableHandler._add] Playable is used elsewhere');
	return false;
};

PlayableHandler.prototype.remove = function (playable) {
	if (playable._handle.container === this._activePlayables) {
		playable.stop();
	}

	if (playable._handle.container !== this._playablesToRemove) {
		this._remove(playable);
	}

	this._onRemovePlayables();
	return this;
};

PlayableHandler.prototype.removeAll = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		handle.object.stop();
		handle = next;
	}

	this._handlePlayablesToRemove();
	this._onRemovePlayables();
	return this;
};

PlayableHandler.prototype.possess = function (playable) {
	if (playable._handle === null) {
		return false;
	}

	return (playable._handle.container === this._activePlayables) || (playable._handle.container === this._inactivePlayables);
};

PlayableHandler.prototype._handlePlayablesToRemove = function () {
	while (this._playablesToRemove.length > 0) {
		// O(1) where O stands for "Oh yeah"

		// Removing from list of playables to remove
		var handle = this._playablesToRemove.pop();

		// Removing from list of active playables
		var playable = handle.object;
		playable._handle = this._activePlayables.removeByReference(handle);
		playable._player = null;
	}
};

PlayableHandler.prototype.clear = function () {
	this._activePlayables.clear();
	this._inactivePlayables.clear();
	this._playablesToRemove.clear();
	this._controls.clear();
	return this;
};

PlayableHandler.prototype._warn = function (warning) {
	// jshint debug: true
	if (this._silent === false) {
		console.warn(warning);
	}

	if (this._debug === true) {
		debugger;
	}
};

PlayableHandler.prototype.silent = function (silent) {
	this._silent = silent;
	return this;
};

PlayableHandler.prototype.debug = function (debug) {
	this._debug = debug;
	return this;
};

PlayableHandler.prototype.stop = function () {
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

PlayableHandler.prototype._activate = function (playable) {
	// O(1)
	this._inactivePlayables.removeByReference(playable._handle);
	playable._handle = this._activePlayables.addBack(playable);
};

PlayableHandler.prototype._inactivate = function (playable) {
	// O(1)
	this._activePlayables.removeByReference(playable._handle);
	playable._handle = this._inactivePlayables.addBack(playable);
};

PlayableHandler.prototype._updatePlayableList = function (dt) {
	this._handlePlayablesToRemove();

	// Activating playables
	var handle = this._inactivePlayables.first; 
	while (handle !== null) {
		var playable = handle.object;

		// Fetching handle of next playable
		handle = handle.next;

		var startTime = playable._startTime;
		var endTime   = startTime + playable.getDuration();
		if (startTime <= this._time && this._time <= endTime) {
			// O(1)
			this._inactivePlayables.removeByReference(playable._handle);
			playable._handle = this._activePlayables.addBack(playable);

			playable._start(this._time - startTime);
		}
	}
};

PlayableHandler.prototype._update = function (dt) {
	this._updatePlayableList(dt);
	for (var handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		handle.object._moveTo(this._time, dt);
	}
};

// Overridable methods
PlayableHandler.prototype._onRemovePlayables = function (/* playable */) {};
PlayableHandler.prototype._onPlayableChange  = function (/* playable */) {};