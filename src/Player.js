var PlayableHandler = require('./PlayableHandler');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Player() {
	PlayableHandler.call(this);
}
Player.prototype = Object.create(PlayableHandler.prototype);
Player.prototype.constructor = Player;

module.exports = Player;