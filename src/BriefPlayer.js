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
	var totalDuration = 0;

	var handle, playable, playableDuration;
	for (handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		playableDuration = playable._getStartTime() + playable.getDuration();
		if (playableDuration > totalDuration) {
			totalDuration = playableDuration;
		}
	}

	for (handle = this._inactivePlayables.first; handle !== null; handle = handle.next) {
		playable = handle.object;
		playableDuration = playable._getStartTime() + playable.getDuration();
		if (playableDuration > totalDuration) {
			totalDuration = playableDuration;
		}
	}

	this._setDuration(totalDuration);
};

BriefPlayer.prototype._onPlayableChanged = BriefPlayer.prototype._updateDuration;
BriefPlayer.prototype._onPlayableRemoved = BriefPlayer.prototype._updateDuration;

// BriefPlayer.prototype._onPlayableChanged = function (changedPlayable) {
// 	this._warn('[BriefPlayer._onPlayableChanged] Changing a playable\'s property after attaching it to a player may have unwanted side effects',
// 		'playable:', changedPlayable, 'player:', this);
// };