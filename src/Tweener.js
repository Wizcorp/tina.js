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
	// In a tweener, a playable that finishes is simply removed
	this._remove(playable);
};

Tweener.prototype._moveTo = function (time, dt) {
	this._time = this._getElapsedTime(time - this._startTime);
	dt = this._getSingleStepDuration(dt);

	// // Computing time overflow and clamping time
	// var overflow;
	// if (dt > 0) {
	// 	if (this._time >= this._duration) {
	// 		overflow = this._time - this._duration;
	// 		dt -= overflow;
	// 		this._time = this._duration;
	// 	}
	// } else if (dt < 0) {
	// 	if (this._time <= 0) {
	// 		overflow = this._time;
	// 		dt -= overflow;
	// 		this._time = 0;
	// 	}
	// }

	this._handlePlayablesToRemove();

	// Inactive playables are set as active
	while (this._inactivePlayables.length > 0) {
		// O(1)
		playable = this._inactivePlayables.pop();
		playable._handle = this._activePlayables.add(playable);
	}

	for (var handle = this._activePlayables.first; handle !== null; handle = handle.next) {
		handle.object._moveTo(this._time, dt);
	}

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}
};

Tweener.prototype.useAsDefault = function () {
	TINA.setDefaultTweener(this);
	return this;
};