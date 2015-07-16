var Tween = require('./Tween');

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function CSSTween(object, properties) {
	if ((this instanceof CSSTween) === false) {
		return new CSSTween(object, properties);
	}

	var object = (typeof object === 'string') ? document.querySelector(object) : object;

	// TODO: change inheritance to NestedTween for support of css transform properties
	Tween.call(this, object.style, properties);
}
CSSTween.prototype = Object.create(Tween.prototype);
CSSTween.prototype.constructor = CSSTween;
module.exports = CSSTween;