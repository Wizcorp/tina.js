var inherit         = require('./inherit');
var PlayableHandler = require('./PlayableHandler');
var BriefExtension  = require('./BriefExtension');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function BriefPlayer() {
	PlayableHandler.call(this);
	BriefExtension.call(this);
}
BriefPlayer.prototype = Object.create(PlayableHandler.prototype);
BriefPlayer.prototype.constructor = BriefPlayer;
inherit(BriefPlayer, BriefExtension);

module.exports = BriefPlayer;