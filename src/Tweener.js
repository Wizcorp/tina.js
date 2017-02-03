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

Tweener.prototype._reactivate = function (playable) {
	if (playable._handle === null) {
		// In a tweener, playables are added when reactivated
		this._add(playable);
	}

	Player.prototype._activate.call(this, playable);
};

Tweener.prototype._inactivate = function (playable) {
	// In a tweener, playables are removed when inactivated
	Player.prototype._inactivate.call(this, playable);
	this._remove(playable);
	playable._active = false;
};

Tweener.prototype.useAsDefault = function () {
	TINA.setDefaultTweener(this);
	return this;
};