var inherit        = require('./inherit');
var Player         = require('./Player');
var BriefExtension = require('./BriefExtension');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function BriefPlayer() {
	Player.call(this);
	BriefExtension.call(this);
}
BriefPlayer.prototype = Object.create(Player.prototype);
BriefPlayer.prototype.constructor = BriefPlayer;
inherit(BriefPlayer, BriefExtension);

module.exports = BriefPlayer;

// BriefPlayer.prototype._onPlayableChanged = function (/* playable */) {};
// BriefPlayer.prototype._onPlayableRemoved = function (/* playable */) {};
BriefPlayer.prototype._onAllPlayablesRemoved = function () {
	this._duration = 0;
};

