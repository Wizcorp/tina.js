var BoundedPlayable = require('./BoundedPlayable');

function ObjectRecorder(object, properties, onIn, onOut) {
	this.object      = object;
	this.properties  = properties;
	this.timestamps  = [];
	this.records     = [];
	this.playingHead = 1;

	// Whether or not the playing head is within the recording duration
	this.isIn = false;

	this.onIn  = onIn  || null;
	this.onOut = onOut || null;
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

	var isIn = (this.timestamps[0] <= time) && (time <= this.timestamps[lastRecord]);
	if (isIn === true) {
		if (this.playing === false) {
			this.playing = true;
			if (this.onIn !== null) {
				this.onIn();
			}
		}
	} else {
		if (this.playing === true) {
			this.playing = false;
			if (this.onOut !== null) {
				this.onOut();
			}
		}
		return;
	}

	while ((playingHead < lastRecord) && (time <= this.timestamps[playingHead])) {
		playingHead += 1;
	}

	while ((playingHead > 1) && (time > this.timestamps[playingHead])) {
		playingHead -= 1;
	}

	var p;
	if (smooth) {
		var t0 = this.timestamps[playingHead - 1];
		var t1 = this.timestamps[playingHead];
		var dt = t1 - t0;

		var delta0 = (t - t0) / dt;
		var delta1 = (t1 - t) / dt;

		var recordIdx1 = nbProperties * playingHead;
		var recordIdx0 = nbProperties * playingHead - nbProperties;

		for (p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = this.records[recordIdx0 + p] * delta0 + this.records[recordIdx1 + p] * delta1;
		}
	} else {
		var recordIdx = nbProperties * playingHead;
		for (p = 0; p < nbProperties; p += 1) {
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

	BoundedPlayable.call(this);

	// Can end only in playing mode
	// TODO: set starting time and duration when switching to playing mode
	this._duration = Infinity;

	// List of objects and properties recorded
	this._recordedObjects = [];

	// List of objects and properties recording
	this._recordingObjects = {};

	// List of object labels
	this._recordingObjectLabels = [];

	// Whether the recorder is in recording mode
	this._recording = true;

	// Whether the recorder is in playing mode
	this._playing = false;

	// Whether the recorder enables interpolating at play time
	this._smooth = false;

	this._onStartRecording = null;
	this._onStopRecording  = null;

	this._onStartPlaying = null;
	this._onStopPlaying  = null;
}
Recorder.prototype = Object.create(BoundedPlayable.prototype);
Recorder.prototype.constructor = Recorder;
module.exports = Recorder;

Recorder.prototype.onStartRecording = function (onStartRecording) {
	this._onStartRecording = onStartRecording;
	return this;
};

Recorder.prototype.onStopRecording = function (onStopRecording) {
	this._onStopRecording = onStopRecording;
	return this;
};

Recorder.prototype.onStartPlaying = function (onStartPlaying) {
	this._onStartPlaying = onStartPlaying;
	return this;
};

Recorder.prototype.onStopPlaying = function (onStopPlaying) {
	this._onStopPlaying = onStopPlaying;
	return this;
};

Recorder.prototype.reset = function () {
	this._recordedObjects       = [];
	this._recordingObjects      = {};
	this._recordingObjectLabels = [];
	return this;
};

Recorder.prototype.record = function (label, object, properties, onIn, onOut) {
	var objectRecorder = new ObjectRecorder(object, properties, onIn, onOut);
	this._recordingObjects[label] = objectRecorder;
	this._recordedObjects.push(objectRecorder);
	this._recordingObjectLabels.push(label);
	return this;
};

Recorder.prototype.stopRecordingObject = function (label) {
	delete this._recordingObjects[label];
	var labelIdx = this._recordingObjectLabels.indexOf(label);
	if (labelIdx === -1) {
		console.warn('[Recorder.stopRecordingObject] Trying to stop recording an object that is not being recording:', label);
		return this;
	}

	this._recordingObjectLabels.splice(labelIdx, 1);
	return this;
};

Recorder.prototype.removeRecordedObject = function (label) {
	var recorder = this._recordingObjects[label];
	delete this._recordingObjects[label];
	var labelIdx = this._recordingObjectLabels.indexOf(label);
	if (labelIdx !== -1) {
		this._recordingObjectLabels.splice(labelIdx, 1);
	}

	var recorderIdx = this._recordedObjects.indexOf(recorder);
	if (recorderIdx === -1) {
		console.warn('[Recorder.removeRecordedObject] Trying to remove an object that was not recorded:', label);
		return this;
	}

	this._recordingObjectLabels.splice(recorderIdx, 1);
	return this;
};

Recorder.prototype.recording = function (recording) {
	if (this._recording !== recording) {
		this._recording = recording;
		if (this._recording === true) {
			if (this._playing === true) {
				if (this._onStopPlaying !== null) {
					this._onStopPlaying();
				}
				this._playing = false;
			}

			if (this._onStartRecording !== null) {
				this._onStartRecording();
			}
		} else {
			if (this._onStopRecording !== null) {
				this._onStopRecording();
			}
		}
	}
	return this;
};

Recorder.prototype.playing = function (playing) {
	if (this._playing !== playing) {
		this._playing = playing;
		if (this._playing === true) {
			if (this._recording === true) {
				if (this._onStopRecording !== null) {
					this._onStopRecording();
				}
				this._recording = false;
			}

			if (this._onStartPlaying !== null) {
				this._onStartPlaying();
			}
		} else {
			if (this._onStopPlaying !== null) {
				this._onStopPlaying();
			}
		}
	}
	return this;
};

Recorder.prototype.smooth = function (smooth) {
	this._smooth = smooth;
	return this;
};

Recorder.prototype.update = function () {
	var r;

	if (this._recording) {
		var nbRecordingObjects = this._recordingObjectLabels.length;
		for (r = 0; r < nbRecordingObjects; r += 1) {
			var label = this._recordingObjectLabels[r];
			this._recordingObjects[label].record(this._time);
		}
	}

	if (this._playing) {
		var nbObjectRecorded = this._recordedObjects.length;
		for (r = 0; r < nbObjectRecorded; r += 1) {
			this._recordedObjects[r].play(this._time, this._smooth);
		}
	}
};
