var DoublyList = require('./DoublyList');

function PlayableHandle(playable) {
	this.playable = playable;
	this.handle = null;
}

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function PlayableHandler() {
	// A DoublyList, rather than an Array, is used to store playables.
	// It allows for faster removal and is similar in speed for iterations.

	// Quick note: as of mid 2014 iterating through linked list was slower than iterating through arrays
	// in safari and firefox as only V8 managed to have linked lists work as fast as arrays.
	// As of mid 2015 it seems that performances are now identical in every major browsers.
	// (KUDOs to the JS engines guys)

	// List of active playables handled by this player
	this._activePlayables   = new DoublyList();

	// List of inactive playables handled by this player
	// TODO: use a priority list of inactive playables (ordered by starting time)
	this._inactivePlayables = new DoublyList();

	// List of playables that are not handled by this player anymore and are waiting to be removed
	this._playablesToRemove = new DoublyList();

	// Whether to silence warnings
	this._silent = false;

	// Whether to trigger the debugger on warnings
	this._debug = false;
}
module.exports = PlayableHandler;

PlayableHandler.prototype._add = function (playable) {
	if (playable._handle === null) {
		// Playable can be added
		playable._handle = this._inactivePlayables.add(playable);
		return true;
	}

	// Playable is already handled, either by this player or by another one
	if (playable._handle.container === this._playablesToRemove) {
		// Playable was being removed, removing from playables to remove
		playable._handle = this._playablesToRemove.remove(playable._handle);
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
		// Playable was being started, removing from starting playables
		playable._handle = this._inactivePlayables.remove(playable._handle);
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
	this._remove(playable);
	playable._stop();
	return this;
};

PlayableHandler.prototype.removeAll = function () {
	// Stopping all active playables
	var handle = this._activePlayables.first; 
	while (handle !== null) {
		var next = handle.next;
		this.remove(handle.object);
		handle = next;
	}

	this._handlePlayablesToRemove();
	return this;
};

PlayableHandler.prototype.possess = function (playable) {
	if (playable._handle === null) {
		return false;
	}

	return (playable._handle.container === this._activePlayables) || (playable._handle.container === this._inactivePlayables);
};

PlayableHandler.prototype._inactivate = function (playable) {
	this._activePlayables.remove(playable._handle);

	// Playable is moved to the list of inactive playables
	playable._handle = this._inactivePlayables.add(playable);
};

PlayableHandler.prototype._handlePlayablesToRemove = function () {
	while (this._playablesToRemove.length > 0) {
		// O(1) where O stands for "Oh yeah"

		// Removing from list of playables to remove
		var handle = this._playablesToRemove.pop();

		// Removing from list of active playables
		var playable = handle.object;
		playable._handle = this._activePlayables.remove(handle);
	}
};

PlayableHandler.prototype.clear = function () {
	this._handledPlayables.clear();
	this._activePlayables.clear();
	this._inactivePlayables.clear();
	this._playablesToRemove.clear();
	return this;
};

PlayableHandler.prototype._warn = function (warning) {
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
