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
	dt = this._getSingleStepDuration(dt) * this._speed;
	this._time = this._getElapsedTime(time - this._startTime) * this._speed;

	this._updatePlayableList(dt);
	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}
};

Tweener.prototype.useAsDefault = function () {
	TINA.setDefaultTweener(this);
	return this;
};