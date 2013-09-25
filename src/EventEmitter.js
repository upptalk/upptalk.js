(function(window) {

	'use strict';

	var EventEmitter = function() {
	};

	//
	//mixin
	//
	EventEmitter.mixin = function(dest) {
		dest = typeof dest === 'function' ? dest.prototype : dest;
		for (var i in this.prototype) {
			dest[i] = this.prototype[i];
		}
	};

	EventEmitter.prototype = {
		//
		//get event listeners
		//
		getListeners: function(event) {
			if (!this._listeners)
				this._listeners = [];

			if (!event)
				return this._listeners;

			if (!this._listeners[event])
				this._listeners[event] = [];

			return this._listeners[event];
		},
		//
		//add an event listener
		//
		addListener: function(event, callback) {
			var listeners = this.getListeners(event);
			listeners.push({callback: callback});
		},
		bind: function(event, callback) {
			this.addListener(event, callback);
		},
		on: function(event, callback) {
			this.addListener(event, callback);
		},
		subscribe: function(event, callback) {
			this.addListener(event, callback);
		},
		listen: function(event, callback) {
			this.addListener(event, callback);
		},
		once: function(event, callback) {
			var listeners = this.getListeners(event);
			listeners.push({callback: callback, once: true});
		},
		//
		//remove an event listener
		//
		removeListener: function(event, callback) {
			var listeners  = this.getListeners(event);
			for (var i = 0, l = listeners.length; i < l; i++) {
				if (listeners[i].callback === callback) {
					listeners.splice(i, 1);
				}
			}
		},
		unbind: function(event, callback) {
			this.removeListener(event, callback);
		},
		off: function(event, callback) {
			this.removeListener(event, callback);
		},
		unsubscribe: function(event, callback) {
			this.removeListener(event, callback);
		},
		unlisten: function(event, callback) {
			this.removeListener(event, callback);
		},
		//
		//emit an event and call listeners
		//
		emit: function() {
			var listeners = this.getListeners(arguments[0]);

			var args = Array.prototype.slice.call(arguments, 1);
			var toDelete = [];
			for (var i = 0, l = listeners.length; i < l; i++) {
				listeners[i].callback.apply(this, args);
				if (listeners[i].once)
					toDelete.push(i);
			}
			for (var i = 0, l = toDelete.length; i < l; i++) {
				listeners.splice(toDelete[i], 1);
			};
		},
		trigger: function(event, data) {
			this.emit(event, data);
		},
		publish: function(event, data) {
			this.emit(event, data);
		}
	};

	window.EventEmitter = EventEmitter;

})(window);