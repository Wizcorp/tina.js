// Provides transitions for CSS style objects
var CSSMap = require('./CSSMap');

// One property
function update(object, t) {
	var p = this.prop;
	object[p] = (this.from[p] * (1 - t) + this.to[p] * t) + this.cssMap[p];
}

// Several Properties
function updateP(object, t) {
	var q = this.props;
	for (var i = 0; i < this.props.length; i += 1) {
		var p = q[i];
		object[p] = (this.from[p] * (1 - t) + this.to[p] * t) + this.cssMap[p];
	}
}

// Interpolation
function updateI(object, t) {
	var p = this.prop;
	object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]) + this.cssMap[p];
}

// Interpolation
// Several Properties
function updatePI(object, t) {
	var q = this.props;
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]) + this.cssMap[p];
	}
}

// Easing
function updateE(object, t) {
	t = this.easing(t, this.easingParam);
	var p = this.prop;
	object[p] = (this.from[p] * (1 - t) + this.to[p] * t) + this.cssMap[p];
}

// Easing
// Several Properties
function updatePE(object, t, interpFunc) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = (this.from[p] * (1 - t) + this.to[p] * t) + this.cssMap[p];
	}
}

// Easing
// Interpolation
function updateIE(object, t, interpFunc) {
	var p = this.prop;
	t = this.easing(t, this.easingParam);
	object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]) + this.cssMap[p];
}

// Easing
// Interpolation
// Several Properties
function updatePIE(object, t, interpFunc) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = this.interps[p](t, this.from[p], this.to[p], this.interpParams[p]) + this.cssMap[p];
	}
}


var updateMethods = [
	[
		[update, updateP],
		[updateI, updatePI]
	], [
		[updateE, updatePE],
		[updateIE, updatePIE]
	]
];

function TransitionCSS(properties, from, to, start, duration, easing,
                       easingParam, interpolations, interpolationParams) {

	this.start     = start;
	this.end       = start + duration;
	this.duration  = duration;
	this.from      = from;
	this.to        = to;
	this.cssMap    = CSSMap(properties);

	// Easing flag - Whether an easing function is used
	// 0 => Using linear easing
	// 1 => Using custom easing
	var easingFlag;
	if (easing) {
		easingFlag = 1;
		this.easing = easing;
		this.easingParam = easingParam;
	} else {
		easingFlag = 0;
	}

	// Interpolation flag - Whether an interpolation function is used
	// 0 => No Interpolation
	// 1 => At least one interpolation
	var interpFlag;
	if (interpolations === null) {
		interpFlag = 0;
	} else {
		interpFlag = 1;
		this.interps = interpolations;
		this.interpParams = interpolationParams || {};
	}

	// Property flag - Whether the transition has several properties
	// 0 => Only one property
	// 1 => Several properties
	var propsFlag;
	if (properties.length === 1) {
		propsFlag  = 0;
		this.prop  = properties[0]; // string
		this.props = null;
	} else {
		propsFlag  = 1;
		this.prop  = null;
		this.props = properties; // array
	}

	this.update = updateMethods[easingFlag][interpFlag][propsFlag];
}

module.exports = TransitionCSS;
