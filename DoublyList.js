/**
 * DOUBLY LIST Class
 *
 * @author Brice Chevalier
 *
 * @desc Doubly list data structure
 *
 *    Method                Time Complexity
 *    ___________________________________
 *
 *    add         O(1)
 *    remove      O(1)
 *    clear       O(n)
 *
 *    Memory Complexity in O(n)
 */

function ListNode(obj, prev, next, container) {
	this.object    = obj;
	this.prev      = prev;
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
		this.first.prev = newNode;
		this.first      = newNode;
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
	this.remove(this.first);
	return object;
};
DoublyList.prototype.pop = DoublyList.prototype.popFront;

DoublyList.prototype.popBack = function (obj) {
	var object = this.last.object;
	this.remove(this.last);
	return object;
};

DoublyList.prototype.remove = function (node) {
	if (node.container !== this) {
		console.warn('[DoublyList.remove] Trying to remove a node that does not belong to the list');
		return node;
	}

	if (node.next === null) {
		this.last = node.prev;
	} else {
		node.next.prev = node.prev;
	}

	if (node.prev === null) {
		this.first = node.next;
	} else {
		node.prev.next = node.next;
	}

	node.container = null;
	this.length -= 1;

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