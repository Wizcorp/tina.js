var NestedTween = require('./NestedTween');

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

	var tweenedObject = (typeof object === 'string') ? document.querySelector(object) : object;

	// DONE: Changed inheritance to NestedTween for support of css transform properties
    // TODO: Add an internal method for replacing unprefixed properties by prefixed properties when necessary
	NestedTween.call(this, tweenedObject.style, properties);
}
CSSTween.prototype = Object.create(NestedTween.prototype);
CSSTween.prototype.constructor = CSSTween;
module.exports = CSSTween;