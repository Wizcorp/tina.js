/**
 * SORTED LIST Class
 * Elements are sorted at insertion
 *
 * @author Brice Chevalier
 *
 * @params [comparisonFunction] {function} comparison function that takes two parameters a and b and returns a comparison number
 *
 *
 *    Method                 Time Complexity
 *    ___________________________________
 *
 *    add                    O(n), O(1) if insertion at the beginning or at the end of the list
 *    remove                 O(1)
 *    getFirst               O(1)
 *    getLast                O(1)
 *    popFirst               O(1)
 *    popLast                O(1)
 *    getCount               O(1)
 *    forEach                O(n * P) where P is the complexity of the input function
 *    forEachReverse         O(n * P) where P is the complexity of the input function
 *    clear                  O(n)
 *
 *    Memory Complexity in O(n)
 */

function ListNode(obj, previous, next, container) {
	this.object    = obj;
	this.previous  = previous;
	this.next      = next;
	this.container = container;
}

function SortedList(comparisonFunction) {
	this.length  = 0;
	this.first   = null;
	this.last    = null;
	this.cmpFunc = comparisonFunction;
}
module.exports = SortedList;

SortedList.prototype.add = function (obj) {
	var newNode = new ListNode(obj, null, null, this);
	this.length += 1;

	if (this.first === null) {
		this.first = newNode;
		this.last  = newNode;
		return newNode;
	}

	var cmpFirst = this.cmpFunc(obj, this.first.object);
	if (cmpFirst < 0) {
		// insertion at the beginning of the list
		newNode.next = this.first;
		this.first.previous = newNode;
		this.first = newNode;
		return newNode;
	}

	var cmpLast = this.cmpFunc(obj, this.last.object);
	if (cmpLast >= 0) {
		// insertion at the end
		newNode.previous = this.last;
		this.last.next = newNode;
		this.last = newNode;
		return newNode;
	}

	var current;
	if (cmpFirst + cmpLast < 0) {
		current = this.first.next;
		while (this.cmpFunc(obj, current.object) >= 0) {
			current = current.next;
		}

		// insertion before current
		newNode.next = current;
		newNode.previous = current.previous;
		newNode.previous.next = newNode;
		current.previous = newNode;
	} else {
		current = this.last.previous;
		while (this.cmpFunc(obj, current.object) < 0) {
			current = current.previous;
		}

		// insertion after current
		newNode.previous = current;
		newNode.next = current.next;
		newNode.next.previous = newNode;
		current.next = newNode;
	}
	return newNode;
};

SortedList.prototype.removeByRef = function (node) {
	if (!node || node.container !== this) {
		return node;
	}
	this.length -= 1;

	// Removing any reference to the node
	if (node.previous === null) {
		this.first = node.next;
	} else {
		node.previous.next = node.next;
	}
	if (node.next === null) {
		this.last = node.previous;
	} else {
		node.next.previous = node.previous;
	}

	// Removing any reference from the node to any other element of the list
	node.previous  = null;
	node.next      = null;
	node.container = null;
	return null;
};

SortedList.prototype.remove = function (object) {
	for (var node = this.first; node !== null; node = node.next) {
		if (node.object === object) {
			this.removeByReference(node);
			return true;
		}
	}

	return false;
};

SortedList.prototype.moveToTheBeginning = function (node) {
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

SortedList.prototype.moveToTheEnd = function (node) {
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

SortedList.prototype.possess = function (node) {
	return node && (node.container === this);
};

SortedList.prototype.popFirst = function () {
	var node = this.first;
	if (!node) return null;
	this.length -= 1;
	var pop  = node.object;

	this.first = node.next;
	if (this.first !== null) {
		this.first.previous = null;
	}

	node.next      = null;
	node.container = null;
	return pop;
};

SortedList.prototype.popLast = function () {
	var node = this.last;
	if (!node) return null;
	this.length -= 1;
	var pop  = node.object;

	this.last = node.previous;
	if (this.last !== null) {
		this.last.next = null;
	}

	node.previous  = null;
	node.container = null;
	return pop;
};

SortedList.prototype.getFirst = function () {
	return this.first && this.first.object;
};

SortedList.prototype.getLast = function () {
	return this.last && this.last.object;
};

SortedList.prototype.clear = function () {
	for (var current = this.first; current; current = current.next) {
		current.container = null;
	}

	this.length = 0;
	this.first  = null;
	this.last   = null;
};

SortedList.prototype.forEach = function (processingFunc, params) {
	for (var current = this.first; current; current = current.next) {
		processingFunc(current.object, params);
	}
};

SortedList.prototype.forEachReverse = function (processingFunc, params) {
	for (var current = this.last; current; current = current.previous) {
		processingFunc(current.object, params);
	}
};

SortedList.prototype.reposition = function (node) {
	if (node.container !== this) {
		console.warn('[SortedList.reposition] Trying to reposition a node that does not belong to the list');
		return node;
	}

	var prev = node.previous;
	var next = node.next;
	var obj  = node.object;

	if (next === null) {
		this.last = prev;
	} else {
		next.previous = prev;
	}

	if (prev === null) {
		this.first = next;
	} else {
		prev.next = next;
	}

	while (prev !== null && this.cmpFunc(obj, prev.object) < 0) {
		next = prev;
		prev = prev.previous;
	}

	while (next !== null && this.cmpFunc(obj, next.object) >= 0) {
		prev = next;
		next = next.next;
	}

	node.next = next;
	if (next === null) {
		this.last = node;
	} else {
		next.previous = node;
	}

	node.previous = prev;
	if (prev === null) {
		this.first = node;
	} else {
		prev.next = node;
	}

	return node;
};

SortedList.prototype.toArray = function () {
	var objects = [];
	for (var node = this.first; node !== null; node = node.next) {
		objects.push(node.object);
	}

	return objects;
};