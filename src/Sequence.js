var Timeline   = require('./Timeline');
var Delay      = require('./Delay');
var DoublyList = require('./DoublyList');

/**
 *
 * @classdesc
 * Manages tweening of one property or several properties of an object
 *
 * @param {object} element Object to tween
 * @param {string} property Property to tween
 * @param {number} a starting value of property
 * @param {number} b ending value of property
 *
 */

function Sequence() {
	if ((this instanceof Sequence) === false) {
		return new Sequence();
	}

	this._sequencedPlayables = new DoublyList();

	Timeline.call(this);
}
Sequence.prototype = Object.create(Timeline.prototype);
Sequence.prototype.constructor = Sequence;
module.exports = Sequence;

Sequence.prototype.add = function (playable) {
	this._sequencedPlayables.addBack(playable);
	return Timeline.prototype.add.call(this, playable, this._duration);
};

Sequence.prototype.addDelay = function (duration) {
	return this.add(new Delay(duration));
};

Sequence.prototype._reconstruct = function () {
	// O(n)
	var activePlayable, timeInActiveBefore;
	var activePlayableHandle = this._activePlayables.first;

	if (activePlayableHandle !== null) {
		// How far is the sequence within the active playable?
		activePlayable = activePlayableHandle.object; // only one active playable
		timeInActiveBefore = this._time - activePlayable._getStartTime();
	}

	// Reconstructing the sequence of playables
	var duration = 0;
	for (var handle = this._sequencedPlayables.first; handle !== null; handle = handle.next) {
		var playable = handle.object;
		playable._setStartTime(duration);
		duration = playable._getEndTime();
	}

	if (activePlayableHandle !== null) {
		// Determining where to set the sequence's starting time so that the local time within
		// the active playable remains the same
		var currentStartTime = this._getStartTime();
		var timeInActiveAfter = this._time - activePlayable._getStartTime();
		var shift = timeInActiveBefore - timeInActiveAfter;
		this._startTime += shift;
	}

	// Updating duration
	this._duration = duration;

	if (this._player !== null) {
		this._player._onPlayableChanged(this);
	}
};

Sequence.prototype.substitute = function (playableA, playableB) {
	// O(n)
	if (this._sequencedPlayables.length === 0) {
		this._warn('[Sequence.substitute] The sequence is empty!');
		return;
	}

	// Fetching handle for playable A
	var handleA = this._sequencedPlayables.getNode(playableA);

	// Adding playable B right after playable A in this._sequencedPlayables
	this._sequencedPlayables.addAfter(handleA, playableB);

	// Adding playable B in this player
	this._add(playableB);

	// Removing playable A
	// Will have the effect of:
	// - Stopping playable A (with correct callback)
	// - Removing playable A from the sequence
	// - Reconstructing the sequence
	this.remove(playableA);
};

Sequence.prototype._onPlayableRemoved = function (removedPlayable) {
	// O(n)
	this._sequencedPlayables.remove(removedPlayable);
	if (this._sequencedPlayables.length === 0) {
		return;
	}

	this._reconstruct();
};

Sequence.prototype._onPlayableChanged = Sequence.prototype._reconstruct;
