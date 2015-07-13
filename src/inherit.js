module.exports = function (subobject, superobject) {
	var prototypes = Object.keys(superobject.prototype);
	for (var p = 0; p < prototypes.length; p += 1) {
		var prototypeName = prototypes[p];
		subobject.prototype[prototypeName] = superobject.prototype[prototypeName];
	}
};