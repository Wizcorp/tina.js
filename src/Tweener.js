var Player = require('./Player');
var TINA   = require('./TINA');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Tweener() {
	Player.call(this);

	// TINA is the player for all the tweeners
	this._player = TINA;
}
Tweener.prototype = Object.create(Player.prototype);
Tweener.prototype.constructor = Tweener;
module.exports = Tweener;

Tweener.prototype._inactivate = function (playable) {
	// In a tweener, playables are removed when inactivated
	this._remove(playable);
};

Tweener.prototype.useAsDefault = function () {
	TINA.setDefaultTweener(this);
	return this;
};