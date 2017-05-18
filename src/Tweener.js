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
	if (playable._handle !== null) {
		// Playable is handled, either by this player or by another one
		if (playable._handle.container === this._activePlayables) {
			// and adding to remove list
			playable._handle = this._playablesToRemove.add(playable._handle);
		}

		if (playable._handle.container === this._inactivePlayables) {
			// Playable was inactive, removing from inactive playables
			playable._handle = this._inactivePlayables.removeByReference(playable._handle);
		}
	}

	playable._active = false;
};

Tweener.prototype.useAsDefault = function () {
	TINA.setDefaultTweener(this);
	return this;
};