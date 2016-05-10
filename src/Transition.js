// The file is a good representation of the constant fight between maintainability and performance
// For performance reasons several update methods are created
// The appropriate method should be used for tweening. The selection depends on:
// 	- The number of props to tween
//  - Whether or not an easing is being used
//  - Whether or not an interpolation is being used

// Interpolation functions
function standardTrans(context, p, t) {
	return context.from[p] * (1 - t) + context.to[p] * t;
}

function standardTransCSS(context, p, t) {
	return (context.from[p] * (1 - t) + context.to[p] * t) + context.cssMap[p];
}

function interpTrans(context, p, t) {
	return context.interps[p](t, context.from[p], context.to[p], context.interpParams[p]);
}

function interpTransCSS(context, p, t) {
	return context.interps[p](t, context.from[p], context.to[p], context.interpParams[p]) + context.cssMap[p];
}

// One property
function update(object, t, interpFunc) {
	var p = this.prop;
	object[p] = interpFunc(this, p, t);
}

// Several Properties
function updateP(object, t, interpFunc) {
	var q = this.props;

	for (var i = 0; i < this.props.length; i += 1) {
		var p = q[i];
		object[p] = interpFunc(this, p, t);
	}
}

// Interpolation
function updateI(object, t, interpFunc) {
	var p = this.prop;
	object[p] = interpFunc(this, p, t);
}

// Interpolation
// Several Properties
function updatePI(object, t, interpFunc) {
	var q = this.props;
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = interpFunc(this, p, t);
	}
}

// Easing
function updateE(object, t, interpFunc) {
	t = this.easing(t, this.easingParam);
	var p = this.prop;
	object[p] = interpFunc(this, p, t);
}

// Easing
// Several Properties
function updatePE(object, t, interpFunc) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = interpFunc(this, p, t);
	}
}

// Easing
// Interpolation
function updateIE(object, t, interpFunc) {
	var p = this.prop;
	t = this.easing(t, this.easingParam);
	object[p] = interpFunc(this, p, t);
}

// Easing
// Interpolation
// Several Properties
function updatePIE(object, t, interpFunc) {
	var q = this.props;
	t = this.easing(t, this.easingParam);
	for (var i = 0; i < q.length; i += 1) {
		var p = q[i];
		object[p] = interpFunc(this, p, t);
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

// A mapping of transition functions to updatemethods
var transFunctions = [
	[
		[standardTrans, standardTrans],
		[interpTrans, interpTrans]
	], [
		[standardTrans, standardTrans],
		[interpTrans, interpTrans]
	]
];

// A mapping of transition functions to update methods:
// If we have A CSS Object we select a CSS version of the tranition function
var transFunctionsCSS = [
	[
		[standardTransCSS, standardTransCSS],
		[interpTransCSS, interpTransCSS]
	], [
		[standardTransCSS, standardTransCSS],
		[interpTransCSS, interpTransCSS]
	]
];

function Transition(properties, from, to, start, duration, easing,
                    easingParam, interpolations, interpolationParams, cssMap) {
	this.start     = start;
	this.end       = start + duration;
	this.duration  = duration;
	this.from      = from;
	this.to        = to;
	this.cssMap    = cssMap ? cssMap : null;

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
	// Select the appropriate transition function based on the mappings
	this.transFunc = transFunctions[easingFlag][interpFlag][propsFlag];

	if (cssMap) {
		this.transFunc = transFunctionsCSS[easingFlag][interpFlag][propsFlag];
	} else {
		this.transFunc = transFunctions[easingFlag][interpFlag][propsFlag];
	}
}

module.exports = Transition;
