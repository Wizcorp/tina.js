var Delay           = require('./Delay');
var Playable        = require('./Playable');
var PlayableHandler = require('./PlayableHandler');

var inherit = require('./inherit');

/**
 * @classdesc
 * Manages the update of a list of playable with respect to a given elapsed time.
 */
function Player() {
	Playable.call(this);
	PlayableHandler.call(this);
}
Player.prototype = Object.create(Playable.prototype);
Player.prototype.constructor = Player;
inherit(Player, PlayableHandler);

module.exports = Player;

Player.prototype._delay = function (playable, delay) {
	if (delay <= 0) {
		this._warn('[Tweener.add] Delay null or negative (' + delay + ').' +
			'Starting the playable with a delay of 0.');
		playable.start();
		return;
	}

	Delay(delay).tweener(this).onComplete(function (timeOverflow) {
		playable.start(timeOverflow);
	}).start();
};

Player.prototype.stop = function () {
	this.removeAll();

	if (this._player._inactivate(this) === false) {
		// Could not be stopped
		return this;
	}

	this._stop();
	return this;
};

Player.prototype._moveTo = function (time, dt) {
	this._time = time - this._startTime;

	// Computing time overflow and clamping time
	var overflow;
	if (dt > 0) {
		if (this._time >= this._duration) {
			overflow = this._time - this._duration;
			dt -= overflow;
			this._time = this._duration;
		}
	} else if (dt < 0) {
		if (this._time <= 0) {
			overflow = this._time;
			dt -= overflow;
			this._time = 0;
		}
	}

	this._updatePlayableList();
	this._update(dt);

	if (this._onUpdate !== null) {
		this._onUpdate(this._time, dt);
	}

	if (overflow !== undefined) {
		this._complete(overflow);
	}
};

// Overridable method
Player.prototype._updatePlayableList = function () {};
