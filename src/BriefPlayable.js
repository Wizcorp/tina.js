var inherit        = require('./inherit');
var Playable       = require('./Playable');
var BriefExtension = require('./BriefExtension');

function BriefPlayable() {
	Playable.call(this);
	BriefExtension.call(this);
}

BriefPlayable.prototype = Object.create(Playable.prototype);
BriefPlayable.prototype.constructor = BriefPlayable;
inherit(BriefPlayable, BriefExtension);

module.exports = BriefPlayable;
