var BoundedPlayable = require('./BoundedPlayable');
var AbstractTween   = require('./AbstractTween');

var inherit = require('./inherit');
/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function Tween(object, properties) {
	if ((this instanceof Tween) === false) {
		return new Tween(object, properties);
	}

	BoundedPlayable.call(this);
	AbstractTween.call(this, object, properties);
}
Tween.prototype = Object.create(BoundedPlayable.prototype);
Tween.prototype.constructor = Tween;
inherit(Tween, AbstractTween);
module.exports = Tween;