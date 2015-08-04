var inherit        = require('./inherit');
var Player         = require('./Player');
var BriefExtension = require('./BriefExtension');

function BriefPlayer() {
	Player.call(this);
	BriefExtension.call(this);
}
BriefPlayer.prototype = Object.create(Player.prototype);
BriefPlayer.prototype.constructor = BriefPlayer;
inherit(BriefPlayer, BriefExtension);

module.exports = BriefPlayer;

BriefPlayer.prototype._onAllPlayablesRemoved = function () {
	this._duration = 0;
};

BriefPlayer.prototype._updateDuration = function () {
	var durationExtension = 0;

	var handle, playable, overflow;
	for (handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		overflow = playable._getEndTime() - this._duration;
		if (overflow > durationExtension) {
			durationExtension = overflow;
		}
	}

	for (handle = this._inactivePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		overflow = playable._getEndTime() - this._duration;
		if (overflow > durationExtension) {
			durationExtension = overflow;
		}
	}

	if (durationExtension > 0) {
		this._extendDuration(durationExtension);
	}
};

BriefPlayer.prototype._onPlayableRemoved = function () {
	this._updateDuration();
};

BriefPlayer.prototype._onPlayableChanged = function (changedPlayable) {
	this._warn('[BriefPlayer._onPlayableChanged] Changing a playable\'s property after attaching it to a player may have unwanted side effects',
		'playable:', changedPlayable, 'player:', this);

	// N.B The following code should work
	// // Updating timeline duration
	// var endTime = changedPlayable._startTime + changedPlayable.getDuration();
	// if (endTime > this._duration) {
	// 	this._duration = endTime;
	// } else {
	// 	// Making sure the duration is correct
	// 	this._updateDuration();
	// }
};