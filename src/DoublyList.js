/**
 * DOUBLY LIST Class
 *
 * @author Brice Chevalier
 *
 * @desc Doubly list data structure
 *
 * Method      Time Complexity
 * ___________________________________
 *
 * add         O(1)
 * remove      O(1)
 * clear       O(n)
 *
 * Memory Complexity in O(n)
 */

function ListNode(obj, previous, next, container) {
	this.object    = obj;
	this.previous  = previous;
	this.next      = next;
	this.container = container;
}

function DoublyList() {
	this.first  = null;
	this.last   = null;
	this.length = 0;
}
module.exports = DoublyList;

DoublyList.prototype.addFront = function (obj) {
	var newNode = new ListNode(obj, null, this.first, this);
	if (this.first === null) {
		this.first = newNode;
		this.last  = newNode;
	} else {
		this.first.previous = newNode;
		this.first = newNode;
	}

	this.length += 1;
	return newNode;
};
DoublyList.prototype.add = DoublyList.prototype.addFront;

DoublyList.prototype.addBack = function (obj) {
	var newNode = new ListNode(obj, this.last, null, this);
	if (this.first === null) {
		this.first = newNode;
		this.last  = newNode;
	} else {
		this.last.next = newNode;
		this.last      = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.popFront = function (obj) {
	var object = this.first.object;
	this.removeByReference(this.first);
	return object;
};
DoublyList.prototype.pop = DoublyList.prototype.popFront;

DoublyList.prototype.popBack = function (obj) {
	var object = this.last.object;
	this.removeByReference(this.last);
	return object;
};

DoublyList.prototype.addBefore = function (node, obj) {
	var newNode = new ListNode(obj, node.previous, node, this);

	if (node.previous !== null) {
		node.previous.next = newNode;
	}

	node.previous = newNode;

	if (this.first === node) {
		this.first = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.addAfter = function (node, obj) {
	var newNode = new ListNode(obj, node, node.next, this);

	if (node.next !== null) {
		node.next.previous = newNode;
	}

	node.next = newNode;

	if (this.last === node) {
		this.last = newNode;
	}

	this.length += 1;
	return newNode;
};

DoublyList.prototype.moveToTheBeginning = function (node) {
	if (!node || node.container !== this) {
		return false;
	}

	if (node.previous === null) {
		// node is already the first one
		return true;
	}

	// Connecting previous node to next node
	node.previous.next = node.next;

	if (this.last === node) {
		this.last = node.previous;
	} else {
		// Connecting next node to previous node
		node.next.previous = node.previous;
	}

	// Adding at the beginning
	node.previous = null;
	node.next = this.first;
	node.next.previous = node;
	this.first = node;
	return true;
};

DoublyList.prototype.moveToTheEnd = function (node) {
	if (!node || node.container !== this) {
		return false;
	}

	if (node.next === null) {
		// node is already the last one
		return true;
	}

	// Connecting next node to previous node
	node.next.previous = node.previous;

	if (this.first === node) {
		this.first = node.next;
	} else {
		// Connecting previous node to next node
		node.previous.next = node.next;
	}

	// Adding at the end
	node.next = null;
	node.previous = this.last;
	node.previous.next = node;
	this.last = node;
	return true;
};

DoublyList.prototype.removeByReference = function (node) {
	if (node.container !== this) {
		console.warn('[DoublyList.removeByReference] Trying to remove a node that does not belong to the list');
		return node;
	}

	// Removing any existing reference to the node
	if (node.next === null) {
		this.last = node.previous;
	} else {
		node.next.previous = node.previous;
	}

	if (node.previous === null) {
		this.first = node.next;
	} else {
		node.previous.next = node.next;
	}

	// Removing any existing reference from the node
	node.next = null;
	node.previous = null;
	node.container = null;

	// One less node in the list
	this.length -= 1;

	return null;
};

DoublyList.prototype.remove = function (object) {
	for (var node = this.first; node !== null; node = node.next) {
		if (node.object === object) {
			this.removeByReference(node);
			return true;
		}
	}

	return false;
};

DoublyList.prototype.getNode = function (object) {
	for (var node = this.first; node !== null; node = node.next) {
		if (node.object === object) {
			return node;
		}
	}

	return null;
};

DoublyList.prototype.clear = function () {
	// Making sure that nodes containers are being resetted
	for (var node = this.first; node !== null; node = node.next) {
		node.container = null;
	}

	this.first  = null;
	this.last   = null;
	this.length = 0;
};

DoublyList.prototype.forEach = function (processingFunc, params) {
	for (var node = this.first; node; node = node.next) {
		processingFunc(node.object, params);
	}
};

DoublyList.prototype.toArray = function () {
	var objects = [];
	for (var node = this.first; node !== null; node = node.next) {
		objects.push(node.object);
	}

	return objects;
};