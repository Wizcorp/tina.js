
exports.number = function (a, b) {
	return a + b;
}

exports.vector = function (a, b) {
	var n = a.length;
	var addition = [];
	for (var i = 0; i < n; a += 1) {
		addition[i] = a[i] + b[i];
	}

	return addition;
}

exports.number = function (a, b) {
	return a - b;
}

exports.vector = function (a, b) {
	var n = a.length;
	var difference = [];
	for (var i = 0; i < n; a += 1) {
		difference[i] = a[i] - b[i];
	}

	return difference;
}

function update(object, t) {
	var prop = this.prop;
	var now  = this.from[p] * (1 - t) + this.to[p] * t;

	object[p] = object[p] + (now - this.prev);
	this.prev = now;
};

// One property
function update(object, t) {
	var prop = this.prop;
	var now  = this.from[p] * (1 - t) + this.to[p] * t;

	object[p] = this.addition[p](object[p], this.difference[p](now, this.prev));
	this.prev = now;
};

// Several Properties
function updateP(object, t) {
	var q = this.props;
	for (var i = 0; i < this.props.length; i += 1) {
		var p  = q[i];
		object[p] = this.from[p] * (1 - t) + this.to[p] * t;
	}
};

// Interpolation
function updateI(object, t) {
	var p  = this.prop;
	object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
};

// Interpolation
// Several Properties
function updatePI(object, t) {
	var q = this.properties;
	for (var i = 0; i < q.length; i += 1) {
		var p  = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	}
};

// Easing
function updateE(object, t) {
	t = this.easing(t, this.easingParams);
	var p  = this.prop;
	object[p] = this.from[p] * (1 - t) + this.to[p] * t;
};

// Easing
// Several Properties
function updatePE(object, t) {
	var q = this.properties;
	t = this.easing(t, this.easingParams);
	for (var i = 0; i < q.length; i += 1) {
		var p  = q[i];
		object[p] = this.from[p] * (1 - t) + this.to[p] * t;
	}
};

// Easing
// Interpolation
function updateIE(object, t) {
	var p = this.prop;
	object[p] = this.interps[p](this.easing(t, this.easingParams), this.from[p], this.to[p], this.interpParams[p]);
};

// Easing
// Interpolation
// Several Properties
function updatePIE(object, t) {
	var q = this.properties;
	t = this.easing(t, this.easingParams);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]);
	}
};

module.exports = [[[update, updateP], [updateI, updatePI]],[[updateE, updatePE], [updateIE, updatePIE]]];