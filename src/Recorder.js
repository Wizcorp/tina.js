var BriefPlayable = require('./BriefPlayable');
var DoublyList    = require('./DoublyList');

function Record(time, values) {
	this.time   = time;
	this.values = values;
}

function ObjectRecorder(object, properties, onIn, onOut) {
	this.object      = object;
	this.properties  = properties;

	this.records = new DoublyList();
	this.currentRecord = null;

	// Whether or not the playing head is within the recording duration
	this.isIn = false;

	this.onIn  = onIn  || null;
	this.onOut = onOut || null;
}

ObjectRecorder.prototype.erase = function (t0, t1) {
	// Removing every record between t0 and t1
	if (t1 < t0) {
		var t2 = t0;
		t0 = t1;
		t1 = t2;
	}

	// Heuristic: removing records from the end if last object concerned by the removal
	var last = this.records.last;
	if (last.object.time <= t1) {
		// Removing from the end
		while (last !== null && last.object.time >= t0) {
			var prev = last.prev;
			this.records.removeBeReference(last);
			last = prev;
		}

		if (this.currentRecord.container === null) {
			// current record was removed from the list
			this.currentRecord = last;
		}
		return;
	}

	// Removing from the beginning
	var recordRef = this.records.first;
	while (recordRef !== null && recordRef.object.time <= t1) {
		var next = recordRef.next;
		if (recordRef.object.time >= t0) {
			this.records.removeBeReference(recordRef);
		}
		recordRef = next;
	}

	if (this.currentRecord.container === null) {
		// current record was removed from the list
		this.currentRecord = recordRef;
	}
};

ObjectRecorder.prototype.record = function (time, dt) {
	if (dt === 0 && this.currentRecord !== null && this.currentRecord.time === time) {
		return;
	}

	// Creating the record
	var recordValues = [];
	for (var p = 0; p < this.properties.length; p += 1) {
		recordValues.push(this.object[this.properties[p]]);
	}
	var record = new Record(time, recordValues);

	// Saving the record
	if (this.records.length === 0) {
		// First record, ever
		this.currentRecord = this.records.add(record);
		return;
	}

	if (this.currentRecord.time < time) {
		this.currentRecord = this.records.addAfter(this.currentRecord, record);
	} else {
		this.currentRecord = this.records.addBefore(this.currentRecord, record);
	}
};

ObjectRecorder.prototype.goTo = function (time) {
	// Selecting record that corresponds to the record closest to time
	while (this.currentRecord.object.time < time) {
		this.currentRecord = this.currentRecord.next;
	}

	while (time < this.currentRecord.object.time) {
		this.currentRecord = this.currentRecord.prev;
	}
};

ObjectRecorder.prototype.play = function (time, dt, smooth) {
	var nbProperties = this.properties.length;
	var firstRecord  = this.records.first;
	var lastRecord   = this.records.last;

	var isIn;
	if (dt === 0) {
		isIn = this.isIn;
	} else {
		if (this.isIn === true) {
			isIn = (firstRecord.object.time < time) && (time < lastRecord.object.time);
		} else {
			isIn = (firstRecord.object.time <= time) && (time <= lastRecord.object.time);
		}
	}

	if (isIn !== this.isIn) {
		this.isIn = !this.isIn;
		if (isIn === true) {
			if (this.onIn !== null) {
				this.onIn();
			}
		} else {
			isOut = true;
		}
	} else if (this.isIn === false) {
		return;
	}

	var previousRecord = (this.currentRecord.prev === null) ? this.currentRecord : this.currentRecord.prev;
	if (dt > 0) {
		while (this.currentRecord.object.time <= time) {
			previousRecord = this.currentRecord;
			var next = this.currentRecord.next;
			if (next === null) {
				break;
			} else {
				this.currentRecord = next;
			}
		}
	} else {
		while (time <= previousRecord.object.time) {
			this.currentRecord = previousRecord;
			var prev = previousRecord.prev;
			if (prev === null) {
				break;
			} else {
				previousRecord = prev;
			}
		}
	}

	var p;
	if (smooth) {
		var t0 = previousRecord.object.time;
		var t1 = this.currentRecord.object.time;
		var record0 = previousRecord.object.values;
		var record1 = this.currentRecord.object.values;

		var timeInterval = t1 - t0;

		var delta0 = (t - t0) / timeInterval;
		var delta1 = (t1 - t) / timeInterval;

		for (p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = record0[p] * delta0 + record1[p] * delta1;
		}
	} else {
		var record = this.currentRecord.object.values;
		for (p = 0; p < nbProperties; p += 1) {
			this.object[this.properties[p]] = record[p];
		}
	}

	// Triggering onOut callback
	if (isIn === false && this.onOut !== null) {
		this.onOut();
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

function Recorder(recordingDuration) {
	if ((this instanceof Recorder) === false) {
		return new Recorder();
	}

	BriefPlayable.call(this);

	// Can end only in playing mode
	// TODO: set starting time and duration when switching to playing mode
	this._duration = Infinity;

	// Maximum recording duration
	this._recordingDuration = recordingDuration || Infinity;

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
Recorder.prototype = Object.create(BriefPlayable.prototype);
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

Recorder.prototype.update = function (dt) {
	var r;
	if (this._recording) {
		var recordingTimeBound = this._time - this._recordingDuration;
		var nbRecordingObjects = this._recordingObjectLabels.length;
		for (r = 0; r < nbRecordingObjects; r += 1) {
			var label = this._recordingObjectLabels[r];
			var recordingObject = this._recordingObjects[label];

			// Recording object at current time
			recordingObject.record(this._time, dt);

			// Clearing the records that overflow from the maximum recording duration
			if (recordingTimeBound > 0) {
				recordingObject.erase(0, recordingTimeBound);
			}
		}
	}

	if (this._playing) {
		var nbObjectRecorded = this._recordedObjects.length;
		for (r = 0; r < nbObjectRecorded; r += 1) {
			this._recordedObjects[r].play(this._time, dt, this._smooth);
		}
	}

};
