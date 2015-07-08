var Player = require('./Player');

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

function Timeline() {
	if ((this instanceof Timeline) === false) {
		return new Timeline();
	}

	Player.call(this);
}
Timeline.prototype = Object.create(Player.prototype);
Timeline.prototype.constructor = Timeline;
module.exports = Timeline;

Timeline.prototype.add = function (startTime, playable) {
	playable._startTime = startTime;
	this._add(playable);
	this._duration = Math.max(this._duration, startTime + playable._duration);
	return this;
};

Timeline.prototype._computeDuration = function () {
	var duration = 0;
	for (var handle = this._inactivePlayables.first; handle !== null; handle = handle.next) {
		var playable = handle.object;
		duration = Math.max(duration, playable._startTime + playable._duration);
	}

	for (handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		duration = Math.max(duration, playable._startTime + playable._duration);
	}

	this._duration = duration;
};

Timeline.prototype.remove = function (playable) {
	this._remove(playable);
	return this;
};

Timeline.prototype._start = function (player, timeOffset) {
	Player.prototype._start.call(this, player, timeOffset);

	// Computing duration of the timeline
	this._computeDuration();
};

Timeline.prototype._updatePlayableList = function () {
	this._handlePlayablesToRemove();

	// Inactive playables 
	var handle = this._inactivePlayables.first; 
	while (handle !== null) {
		var playable = handle.object;

		// Fetching handle of next playable
		handle = handle.next;

		var startTime = playable._startTime;
		var endTime   = startTime + playable._duration;
		if (startTime <= this._time && this._time <= endTime) {
			// O(1)
			this._inactivePlayables.remove(playable._handle);
			playable._handle = this._activePlayables.add(playable);

			playable._start(this, -startTime);
		}
	}
};

Timeline.prototype._update = function (dt) {
	for (var handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		var playable = handle.object;
		playable._moveTo(this._time, dt);
	}
};