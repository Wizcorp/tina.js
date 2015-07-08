var Playable = require('./Playable');

function ObjectRecorder(object, properties) {
	this.object      = object;
	this.properties  = properties;
	this.timestamps  = [];
	this.records     = [];
	this.playingHead = 1;
}

ObjectRecorder.prototype.record = function (time) {
	for (var p = 0; p < this.properties.length; p += 1) {
		this.records.push(this.object[this.properties[p]]);
	}

	this.timestamps.push(time);
};

ObjectRecorder.prototype.play = function (time, smooth) {
	var nbProperties = this.properties.length;
	var lastRecord   = this.timestamps.length - 1;
	var playingHead  = this.playingHead;

	while ((playingHead < lastRecord) && (time <= this.timestamps[playingHead])) {
		playingHead += 1;
	}

	while ((playingHead > 1) && (time > this.timestamps[playingHead])) {
		playingHead -= 1;
	}

	if (smooth) {
		var t0 = this.timestamps[playingHead - 1];
		var t1 = this.timestamps[playingHead];
		var dt = t1 - t0;

		var delta0 = (t - t0) / dt;
		var delta1 = (t1 - t) / dt;

		var recordIdx1 = nbProperties * playingHead;
		var recordIdx0 = nbProperties * playingHead - nbProperties;

		for (var p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = this.records[recordIdx0 + p] * delta0 + this.records[recordIdx1 + p] * delta1;
		}
	} else {
		var recordIdx = nbProperties * playingHead;
		for (var p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = this.records[recordIdx + p];
		}
	}
};

/**
 *
 * @classdesc
 * Manages transition of properties of an object
 *
 * @param {object} object     - Object to tween
 * @param {array}  properties - Properties of the object to tween
 *
 */

function Recorder() {
	if ((this instanceof Recorder) === false) {
		return new Recorder();
	}

	Playable.call(this);

	// Never ends
	this._duration = Infinity;

	// List of objects and properties to records
	this._objectRecorders = [];

	// Whether the recorder is in recording mode
	this._recording = true;

	// Whether the recorder is in playing mode
	this._playing = false;

	// Whether the recorder enables interpolating at play time
	this._smooth = false;
}
Recorder.prototype = Object.create(Playable.prototype);
Recorder.prototype.constructor = Recorder;
module.exports = Recorder;

Recorder.prototype.reset = function () {
	this._objectRecorders = [];
	return this;
};

Recorder.prototype.record = function (object, properties) {
	this._objectRecorders.push(new ObjectRecorder(object, properties));
	return this;
};

Recorder.prototype.remove = function (object) {
	var nbObjectRecorders = this._objectRecorders.length;
	for (var r = 0; r < nbObjectRecorders; r += 1) {
		if (this._objectRecorders[r].object === object) {
			this._objectRecorders.splice(1, r);
			break;
		}
	}
	return this;
};

Recorder.prototype.recording = function (recording) {
	this._recording = recordingMode;
	if (this._recording === true) {
		this._playing = false;
	}
	return this;
};

Recorder.prototype.playing = function (playing) {
	this._playing = playingMode;
	if (this._playing === true) {
		this._recording = false;
	}
	return this;
};

Recorder.prototype.smooth = function (smooth) {
	this._smooth = smooth;
	return this;
};

Recorder.prototype.update = function (dt) {
	if (this._recording) {
		var nbObjectRecorders = this._objectRecorders.length;
		for (var r = 0; r < nbObjectRecorders; r += 1) {
			this._objectRecorders[r].record(this._time);
		}
	}

	if (this._playing) {
		var nbObjectRecorders = this._objectRecorders.length;
		for (var r = 0; r < nbObjectRecorders; r += 1) {
			this._objectRecorders[r].play(this._time, this._smooth);
		}
	}
};
