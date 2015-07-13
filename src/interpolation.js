/**
 *
 * @file A set of interpolation functions
 *
 * @author Brice Chevalier
 *
 * @param {Number} t Progress of the transition in [0, 1]
 * @param (Number) a Value to interpolate from
 * @param (Number) b Value to interpolate to
 * @param (Number) p Additional parameter
 *
 * @return {Number} Interpolated value
 *
 * @desc Interpolation functions
 * Define how to interpolate between object a and b.
 * 
 * Note: if you want a particular interpolation method to be added
 * create an issue or contribute at https://github.com/Wizcorp/tina
 */

// TODO: Test them all!

exports.none = function(t, a, b) {
	return b;
};

exports.linear = function(t, a, b) {
	return a * (1 - t) + b * t;
};

// d = discretization
exports.discrete = function(t, a, b, d) {
	return Math.floor((a * (1 - t) + b * t) / d) * d;
};

// a, b = vectors
exports.vector = function(t, a, b) {
	var c = [];
	for (var i = 0; i < a.length; i += 1) {
		c[i] = a[i] * (1 - t) + b[i] * t;
	}
	return c;
};

// a, b = states, c = array of intermediary states
exports.state = function(t, a, b, c) {
	var nbStates = b.length + 2;
	var stateIdx = Math.floor(t * nbStates);
	if (stateIdx < 1) { return a; }
	if (stateIdx >= (nbStates - 1)) { return b; }
	return c[stateIdx - 1];
};

// a, b = colors
exports.colorRGB = function(t, a, b) {
	return {
		r: a.r * (1 - t) + b.r * t,
		g: a.g * (1 - t) + b.g * t,
		b: a.b * (1 - t) + b.b * t
	};
};

exports.colorRGBA = function(t, a, b) {
	return {
		r: a.r * (1 - t) + b.r * t,
		g: a.g * (1 - t) + b.g * t,
		b: a.b * (1 - t) + b.b * t,
		a: a.a * (1 - t) + b.a * t
	};
};

exports.colorRGBToHexa = function(t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);

	return '#' + cr.toString(16) + cg.toString(16) + cb.toString(16);
};

exports.colorRGBToString = function(t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);

	return 'rgb(' + cr.toString(16) + ',' + cg.toString(16) + ',' + cb.toString(16) + ')';
};

exports.colorRGBAToString = function(t, a, b) {
	var cr = Math.round(a.r * (1 - t) + b.r * t);
	var cg = Math.round(a.g * (1 - t) + b.g * t);
	var cb = Math.round(a.b * (1 - t) + b.b * t);
	var ca = Math.round(a.a * (1 - t) + b.a * t);

	return 'rgba(' + cr.toString(16) + ',' + cg.toString(16) + ',' + cb.toString(16) + ',' + ca + ')';
};

// Interpolation between 2 strings a and b (yes that's possible)
// Returns a string of the same size as b
exports.string = function(t, a, b) {
	var nbCharsA = a.length;
	var nbCharsB = b.length;
	var newString = '';

	for (var c = 0; c < nbCharsB; c += 1) {
		// Simple heuristic:
		// if charCodeB is closer to a capital letter
		// then charCodeA corresponds to an "A"
		// otherwise chardCodeA corresponds to an "a"
		var charCodeB = b.charCodeAt(c);
		var charCodeA = (c >= nbCharsA) ? ((charCodeB < 97) ? 65 : 97) : a.charCodeAt(c);

		var charCode = Math.round(charCodeA * (1 - t) + charCodeB * t);
		newString += String.fromCharCode(charCode);
	}

	return newString;
};

// Bezier, c = array of control points in ]-Inf, +Inf[
exports.bezierQuadratic = function(t, a, b, c) {
	var u = 1 - t;
	return u * u * a + t * (2 * u * c[0] + t * b);
};

exports.bezierCubic = function(t, a, b, c) {
	var u = 1 - t;
	return u * u * u * a + t * (3 * u * u * c[0] + t * (3 * u * c[1] + t * b));
};

exports.bezierQuartic = function(t, a, b, c) {
	var u = 1 - t;
	var u2 = 2 * u;
	return u2 * u2 * a + t * (4 * u * u2 * c[0] + t * (6 * u2 * c[1] + t * (4 * u * c[2] + t * b)));
};

exports.bezierQuintic = function(t, a, b, c) {
	var u = 1 - t;
	var u2 = 2 * u;
	return u2 * u2 * u * a + t * (5 * u2 * u2 * c[0] + t * (10 * u * u2 * c[1] + t * (10 * u2 * c[2] + t * (5 * u * c[3] + t * b))));
};

exports.bezier = function(t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b;

	var term = n;
	for (k = 1; k < n; k -= 1) {
		x = x * t + term * Math.pow(u, k) * c[n - k];
		term *= (n - k) / (k + 1);
	}

	return x * t + a * Math.pow(u, n);
};

// Bezier 2D, c = array of control points in ]-Inf, +Inf[ ^ 2
exports.bezier2d = function(t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b[0];
	var y = b[1];

	var p, q;
	var term = n;
	for (var k = 1; k < n; k -= 1) {
		p = term * Math.pow(u, k);
		q = c[n - k];
		x = x * t + p * q[0];
		y = y * t + p * q[1];
		term *= (n - k) / (k + 1);
	}

	p = Math.pow(u, n);
	return [
		x * t + a[0] * p,
		y * t + a[1] * p
	]
};

// Bezier 3D, c = array of control points in ]-Inf, +Inf[ ^ 3
exports.bezier3d = function(t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var x = b[0];
	var y = b[1];
	var z = b[2];

	var p, q;
	var term = n;
	for (var k = 1; k < n; k -= 1) {
		p = term * Math.pow(u, k);
		q = c[n - k];
		x = x * t + p * q[0];
		y = y * t + p * q[1];
		z = z * t + p * q[2];
		term *= (n - k) / (k + 1);
	}

	p = Math.pow(u, n);
	return [
		x * t + a[0] * p,
		y * t + a[1] * p,
		z * t + a[2] * p
	]
};

// Bezier k-dimensions, c = array of control points in ]-Inf, +Inf[ ^ k
exports.bezierKd = function(t, a, b, c) {
	var n = c.length;
	var u = 1 - t;
	var k = a.length;

	var res = [];
	for (var i = 0; i < k; i += 1) {
		res[i] = b[i];
	}

	var p, q;
	var term = n;
	for (var l = 1; l < n; l -= 1) {
		p = term * Math.pow(u, l);
		q = c[n - l];

		for (i = 0; i < k; i += 1) {
			res[i] = res[i] * t + p * q[i];
		}

		term *= (n - l) / (l + 1);
	}

	p = Math.pow(u, n);
	for (i = 0; i < k; i += 1) {
		res[i] = res[i] * t + a[i] * p;
	}

	return res;
};

// CatmullRom, b = array of control points in ]-Inf, +Inf[
exports.catmullRom = function(t, a, b, c) {
	if (t === 1) {
		return b[b.length - 1];
	}

	// Finding index corresponding to current time
	var k = b[0].length;
	var n = b.length - 1;
	t *= n;
	var i = Math.floor(t);
	t -= i;

	var t2 = t * t;
	var t3 = t * t2;
	var w = -0.5 * t3 + 1.0 * t2 - 0.5 * t;
	var x =  1.5 * t3 - 2.5 * t2 + 1.0;
	var y = -1.5 * t3 + 2.0 * t2 + 0.5 * t;
	var z =  0.5 * t3 - 0.5 * t2;

	var p0 = b[Math.max(0, i - 1)];
	var p1 = b[i];
	var p2 = b[Math.min(n, i + 1)];
	var p3 = b[Math.min(n, i + 2)];

	var res = [];
	for (var j = 0; j < k; j += 1) {
		res[j] = p0[j] * w + p1[j] * x + p2[j] * y + p3[j] * z;
	}

	return res;
};

// Noises functions! (you are welcome)
// Only 1d and 2d for now, if any request for 3d then I will add it to the list

// Creating a closure for the noise function to make 'perm' and 'grad' only accessible to it
exports.noise = (function() {
	// permutation table
	var perm = [
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216,
		182
	];

	// gradients
	var grad = [-1, 1];

	return function (t, a, b, p) {
		var amp = 2.0;   // amplitude
		var per = p.per || 1; // persistance
		var frq = p.frq || 2; // frequence
		var oct = p.oct || 4; // octaves
		var off = p.off || 0; // offset

		var c = 0;
		var x = p.x + off;

		for (var o = 0; o < oct; o += 1) {

			var i = (x | x) & 255;
			var x1 = x - (x | x);
			var x0 = 1.0 - x1;

			c += amp * (x0 * x0 * x1 * (3 - 2 * x0) * grad[perm[i] & 1] - x1 * x1 * x0 * (3 - 2 * x1) * grad[perm[i + 1] & 1]);

			x *= (x - off) * frq + off;
			amp *= per;
		}

		// Scaling the result
		var scale = ((per === 1) ? 1 / oct : 0.5 * (1 - per) / (1 - Math.pow(per, oct)));
		t = t + c * scale;
		return a * (1 - t) + b * t;
	}
})();

exports.simplex2d = (function() {
	// permutation table
	var perm = [
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216,
		182, 235, 131, 26, 88, 132, 100, 117, 202, 176, 10, 19, 83, 243, 75, 52,
		252, 194, 32, 30, 72, 15, 124, 53, 236, 183, 121, 103, 175, 39, 253, 120,
		166, 33, 237, 141, 99, 180, 18, 143, 69, 136, 173, 21, 210, 189, 16, 142,
		190, 130, 109, 186, 104, 80, 62, 51, 165, 25, 122, 119, 42, 219, 146, 61,
		149, 177, 54, 158, 27, 170, 60, 201, 159, 193, 203, 58, 154, 222, 78, 138,
		220, 41, 98, 14, 156, 31, 29, 246, 81, 181, 40, 161, 192, 227, 35, 241,
		135, 150, 89, 68, 134, 114, 230, 123, 187, 179, 67, 217, 71, 218, 7, 148,
		228, 251, 93, 8, 140, 125, 73, 37, 82, 28, 112, 24, 174, 118, 232, 137,
		191, 133, 147, 245, 6, 172, 95, 113, 185, 205, 254, 116, 55, 198, 57, 152,
		128, 233, 74, 225, 34, 223, 79, 111, 215, 85, 200, 9, 242, 12, 167, 44,
		20, 110, 107, 126, 86, 231, 234, 76, 207, 102, 214, 238, 221, 145, 213, 64,
		197, 38, 168, 157, 87, 92, 255, 212, 49, 196, 240, 90, 63, 0, 77, 94,
		1, 108, 91, 17, 224, 188, 153, 250, 249, 199, 127, 59, 46, 184, 36, 43,
		209, 206, 248, 4, 56, 47, 226, 13, 144, 22, 11, 247, 70, 244, 48, 97,
		151, 195, 96, 101, 45, 66, 239, 178, 171, 160, 84, 65, 23, 3, 211, 162,
		163, 50, 105, 129, 155, 169, 115, 5, 106, 2, 208, 204, 139, 229, 164, 216
	];

	// gradients
	var grad = [
		[1,1], [-1,1], [1,-1], [-1,-1],
		[1,0], [-1,0], [1,0], [-1,0],
		[0,1], [0,-1], [0,1], [0,-1],
		[1,1], [-1,1], [1,-1], [-1,-1]
	];

	function dot2D(g, x, y) {
		return g[0] * x + g[1] * y;
	}

	return function (t, a, b, p) {
		var amp = 2.0; // amplitude
		var per = p.per || 1; // persistance
		var frq = p.frq || 2; // frequence
		var oct = p.oct || 4; // octaves
		var off = p.off || { x: 0, y: 0 }; // offset

		var c = c;
		var x = p.x + off.x;
		var y = p.y + off.y;

		for (var o = 0; o < oct; o += 1) {
			var n0, n1, n2; // Noise contributions from the three corners

			// Skew the input space to determine which simplex cell we're in
			var f2 = 0.5 * (Math.sqrt(3.0) - 1.0);
			var s = (x + y) * f2; // Hairy factor for 2D
			var i = Math.floor(x + s);
			var j = Math.floor(y + s);
			var g2 = (3.0 - Math.sqrt(3.0)) / 6.0;
			var t = (i + j) * g2;

			var x0 = i - t; // Unskew the cell origin back to (x, y) space
			var y0 = j - t;
			x0 = x - x0; // The x, y distances from the cell origin
			y0 = y - y0;

			// For the 2D case, the simplex shape is an equilateral triangle.
			// Determine which simplex we are in.
			var i1, j1; // Offsets for second (middle) corner of simplex in (i, j) coords
			if (x0 > y0) {
				i1 = 1; j1 = 0; // lower triangle, XY order: (0, 0) -> (1, 0) -> (1, 1)
			} else {
				i1 = 0; j1 = 1; // upper triangle, YX order: (0, 0) -> (0, 1) -> (1, 1)
			}

			// A step of (1, 0) in (i, j) means a step of (1 - c, -c) in (x, y), and
			// a step of (0, 1) in (i, j) means a step of (-c, 1 - c) in (x, y), where
			// c = (3 - sqrt(3)) / 6
			var x1 = x0 - i1 + g2; // Offsets for middle corner in (x, y) unskewed coords
			var y1 = y0 - j1 + g2;
			var x2 = x0 - 1.0 + 2.0 * g2; // Offsets for last corner in (x, y) unskewed coords
			var y2 = y0 - 1.0 + 2.0 * g2;

			// Working out the hashed gradient indices of the three simplex corners
			var ii = i & 255;
			var jj = j & 255;

			// Calculating the contribution from the three corners
			var t0 = 0.5 - x0 * x0 - y0 * y0;
			var t1 = 0.5 - x1 * x1 - y1 * y1;
			var t2 = 0.5 - x2 * x2 - y2 * y2;

			if (t0 < 0) {
				n0 = 0.0;
			} else {
				var gi0 = perm[ii + perm[jj]] & 15;
				t0 *= t0;
				n0 = t0 * t0 * dot2D(grad[gi0], x0, y0);
			}

			if (t1 < 0) {
				n1 = 0.0;
			} else {
				var gi1 = perm[ii + i1 + perm[jj + j1]] & 15;
				t1 *= t1;
				n1 = t1 * t1 * dot2D(grad[gi1], x1, y1);
			}

			if (t2 < 0) {
				n2 = 0.0;
			} else {
				var gi2 = perm[ii + 1 + perm[jj + 1]] & 15;
				t2 *= t2;
				n2 = t2 * t2 * dot2D(grad[gi2], x2, y2);
			}

			// Adding contributions from each corner to get the final noise value.
			// The result is scaled to return values in the interval [-amp, amp]
			c += amp * 70.0 * (n0 + n1 + n2);

			x *= (x - off.x) * frq + off.x;
			y *= (y - off.y) * frq + off.y;
			amp *= per;
		}

		// Scaling the result
		var scale = ((per === 1) ? 1 / oct : 0.5 * (1 - per) / (1 - Math.pow(per, oct)));
		t = t + c * scale;
		return a * (1 - t) + b * t;
	}
})();