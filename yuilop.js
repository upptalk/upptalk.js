/*!
 * EventEmitter v4.2.4 - git.io/ee
 * Oliver Caldwell
 * MIT license
 * @preserve
 */

(function () {
	'use strict';

	/**
	 * Class for managing events.
	 * Can be extended to provide event functionality in other classes.
	 *
	 * @class EventEmitter Manages event registering and emitting.
	 */
	function EventEmitter() {}

	// Shortcuts to improve speed and size

	// Easy access to the prototype
	var proto = EventEmitter.prototype;

	/**
	 * Finds the index of the listener for the event in it's storage array.
	 *
	 * @param {Function[]} listeners Array of listeners to search through.
	 * @param {Function} listener Method to look for.
	 * @return {Number} Index of the specified listener, -1 if not found
	 * @api private
	 */
	function indexOfListener(listeners, listener) {
		var i = listeners.length;
		while (i--) {
			if (listeners[i].listener === listener) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Alias a method while keeping the context correct, to allow for overwriting of target method.
	 *
	 * @param {String} name The name of the target method.
	 * @return {Function} The aliased method
	 * @api private
	 */
	function alias(name) {
		return function aliasClosure() {
			return this[name].apply(this, arguments);
		};
	}

	/**
	 * Returns the listener array for the specified event.
	 * Will initialise the event object and listener arrays if required.
	 * Will return an object if you use a regex search. The object contains keys for each matched event. So /ba[rz]/ might return an object containing bar and baz. But only if you have either defined them with defineEvent or added some listeners to them.
	 * Each property in the object response is an array of listener functions.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Function[]|Object} All listener functions for the event.
	 */
	proto.getListeners = function getListeners(evt) {
		var events = this._getEvents();
		var response;
		var key;

		// Return a concatenated array of all matching events if
		// the selector is a regular expression.
		if (typeof evt === 'object') {
			response = {};
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					response[key] = events[key];
				}
			}
		}
		else {
			response = events[evt] || (events[evt] = []);
		}

		return response;
	};

	/**
	 * Takes a list of listener objects and flattens it into a list of listener functions.
	 *
	 * @param {Object[]} listeners Raw listener objects.
	 * @return {Function[]} Just the listener functions.
	 */
	proto.flattenListeners = function flattenListeners(listeners) {
		var flatListeners = [];
		var i;

		for (i = 0; i < listeners.length; i += 1) {
			flatListeners.push(listeners[i].listener);
		}

		return flatListeners;
	};

	/**
	 * Fetches the requested listeners via getListeners but will always return the results inside an object. This is mainly for internal use but others may find it useful.
	 *
	 * @param {String|RegExp} evt Name of the event to return the listeners from.
	 * @return {Object} All listener functions for an event in an object.
	 */
	proto.getListenersAsObject = function getListenersAsObject(evt) {
		var listeners = this.getListeners(evt);
		var response;

		if (listeners instanceof Array) {
			response = {};
			response[evt] = listeners;
		}

		return response || listeners;
	};

	/**
	 * Adds a listener function to the specified event.
	 * The listener will not be added if it is a duplicate.
	 * If the listener returns true then it will be removed after it is called.
	 * If you pass a regular expression as the event name then the listener will be added to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListener = function addListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var listenerIsWrapped = typeof listener === 'object';
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
				listeners[key].push(listenerIsWrapped ? listener : {
					listener: listener,
					once: false
				});
			}
		}

		return this;
	};

	/**
	 * Alias of addListener
	 */
	proto.on = alias('addListener');

	/**
	 * Semi-alias of addListener. It will add a listener that will be
	 * automatically removed after it's first execution.
	 *
	 * @param {String|RegExp} evt Name of the event to attach the listener to.
	 * @param {Function} listener Method to be called when the event is emitted. If the function returns true then it will be removed after calling.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addOnceListener = function addOnceListener(evt, listener) {
		return this.addListener(evt, {
			listener: listener,
			once: true
		});
	};

	/**
	 * Alias of addOnceListener.
	 */
	proto.once = alias('addOnceListener');

	/**
	 * Defines an event name. This is required if you want to use a regex to add a listener to multiple events at once. If you don't do this then how do you expect it to know what event to add to? Should it just add to every possible match for a regex? No. That is scary and bad.
	 * You need to tell it what event names should be matched by a regex.
	 *
	 * @param {String} evt Name of the event to create.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvent = function defineEvent(evt) {
		this.getListeners(evt);
		return this;
	};

	/**
	 * Uses defineEvent to define multiple events.
	 *
	 * @param {String[]} evts An array of event names to define.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.defineEvents = function defineEvents(evts) {
		for (var i = 0; i < evts.length; i += 1) {
			this.defineEvent(evts[i]);
		}
		return this;
	};

	/**
	 * Removes a listener function from the specified event.
	 * When passed a regular expression as the event name, it will remove the listener from all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to remove the listener from.
	 * @param {Function} listener Method to remove from the event.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListener = function removeListener(evt, listener) {
		var listeners = this.getListenersAsObject(evt);
		var index;
		var key;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				index = indexOfListener(listeners[key], listener);

				if (index !== -1) {
					listeners[key].splice(index, 1);
				}
			}
		}

		return this;
	};

	/**
	 * Alias of removeListener
	 */
	proto.off = alias('removeListener');

	/**
	 * Adds listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can add to multiple events at once. The object should contain key value pairs of events and listeners or listener arrays. You can also pass it an event name and an array of listeners to be added.
	 * You can also pass it a regular expression to add the array of listeners to all events that match it.
	 * Yeah, this function does quite a bit. That's probably a bad thing.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add to multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.addListeners = function addListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(false, evt, listeners);
	};

	/**
	 * Removes listeners in bulk using the manipulateListeners method.
	 * If you pass an object as the second argument you can remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be removed.
	 * You can also pass it a regular expression to remove the listeners from all events that match it.
	 *
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeListeners = function removeListeners(evt, listeners) {
		// Pass through to manipulateListeners
		return this.manipulateListeners(true, evt, listeners);
	};

	/**
	 * Edits listeners in bulk. The addListeners and removeListeners methods both use this to do their job. You should really use those instead, this is a little lower level.
	 * The first argument will determine if the listeners are removed (true) or added (false).
	 * If you pass an object as the second argument you can add/remove from multiple events at once. The object should contain key value pairs of events and listeners or listener arrays.
	 * You can also pass it an event name and an array of listeners to be added/removed.
	 * You can also pass it a regular expression to manipulate the listeners of all events that match it.
	 *
	 * @param {Boolean} remove True if you want to remove listeners, false if you want to add.
	 * @param {String|Object|RegExp} evt An event name if you will pass an array of listeners next. An object if you wish to add/remove from multiple events at once.
	 * @param {Function[]} [listeners] An optional array of listener functions to add/remove.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.manipulateListeners = function manipulateListeners(remove, evt, listeners) {
		var i;
		var value;
		var single = remove ? this.removeListener : this.addListener;
		var multiple = remove ? this.removeListeners : this.addListeners;

		// If evt is an object then pass each of it's properties to this method
		if (typeof evt === 'object' && !(evt instanceof RegExp)) {
			for (i in evt) {
				if (evt.hasOwnProperty(i) && (value = evt[i])) {
					// Pass the single listener straight through to the singular method
					if (typeof value === 'function') {
						single.call(this, i, value);
					}
					else {
						// Otherwise pass back to the multiple function
						multiple.call(this, i, value);
					}
				}
			}
		}
		else {
			// So evt must be a string
			// And listeners must be an array of listeners
			// Loop over it and pass each one to the multiple method
			i = listeners.length;
			while (i--) {
				single.call(this, evt, listeners[i]);
			}
		}

		return this;
	};

	/**
	 * Removes all listeners from a specified event.
	 * If you do not specify an event then all listeners will be removed.
	 * That means every event will be emptied.
	 * You can also pass a regex to remove all events that match it.
	 *
	 * @param {String|RegExp} [evt] Optional name of the event to remove all listeners for. Will remove from every event if not passed.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.removeEvent = function removeEvent(evt) {
		var type = typeof evt;
		var events = this._getEvents();
		var key;

		// Remove different things depending on the state of evt
		if (type === 'string') {
			// Remove all listeners for the specified event
			delete events[evt];
		}
		else if (type === 'object') {
			// Remove all events matching the regex.
			for (key in events) {
				if (events.hasOwnProperty(key) && evt.test(key)) {
					delete events[key];
				}
			}
		}
		else {
			// Remove all listeners in all events
			delete this._events;
		}

		return this;
	};

	/**
	 * Alias of removeEvent.
	 *
	 * Added to mirror the node API.
	 */
	proto.removeAllListeners = alias('removeEvent');

	/**
	 * Emits an event of your choice.
	 * When emitted, every listener attached to that event will be executed.
	 * If you pass the optional argument array then those arguments will be passed to every listener upon execution.
	 * Because it uses `apply`, your array of arguments will be passed as if you wrote them out separately.
	 * So they will not arrive within the array on the other side, they will be separate.
	 * You can also pass a regular expression to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {Array} [args] Optional array of arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emitEvent = function emitEvent(evt, args) {
		var listeners = this.getListenersAsObject(evt);
		var listener;
		var i;
		var key;
		var response;

		for (key in listeners) {
			if (listeners.hasOwnProperty(key)) {
				i = listeners[key].length;

				while (i--) {
					// If the listener returns true then it shall be removed from the event
					// The function is executed either with a basic call or an apply if there is an args array
					listener = listeners[key][i];

					if (listener.once === true) {
						this.removeListener(evt, listener.listener);
					}

					response = listener.listener.apply(this, args || []);

					if (response === this._getOnceReturnValue()) {
						this.removeListener(evt, listener.listener);
					}
				}
			}
		}

		return this;
	};

	/**
	 * Alias of emitEvent
	 */
	proto.trigger = alias('emitEvent');

	/**
	 * Subtly different from emitEvent in that it will pass its arguments on to the listeners, as opposed to taking a single array of arguments to pass on.
	 * As with emitEvent, you can pass a regex in place of the event name to emit to all events that match it.
	 *
	 * @param {String|RegExp} evt Name of the event to emit and execute listeners for.
	 * @param {...*} Optional additional arguments to be passed to each listener.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.emit = function emit(evt) {
		var args = Array.prototype.slice.call(arguments, 1);
		return this.emitEvent(evt, args);
	};

	/**
	 * Sets the current value to check against when executing listeners. If a
	 * listeners return value matches the one set here then it will be removed
	 * after execution. This value defaults to true.
	 *
	 * @param {*} value The new value to check for when executing listeners.
	 * @return {Object} Current instance of EventEmitter for chaining.
	 */
	proto.setOnceReturnValue = function setOnceReturnValue(value) {
		this._onceReturnValue = value;
		return this;
	};

	/**
	 * Fetches the current value to check against when executing listeners. If
	 * the listeners return value matches this one then it should be removed
	 * automatically. It will return true by default.
	 *
	 * @return {*|Boolean} The current value to check for or the default, true.
	 * @api private
	 */
	proto._getOnceReturnValue = function _getOnceReturnValue() {
		if (this.hasOwnProperty('_onceReturnValue')) {
			return this._onceReturnValue;
		}
		else {
			return true;
		}
	};

	/**
	 * Fetches the events object and creates one if required.
	 *
	 * @return {Object} The events storage object.
	 * @api private
	 */
	proto._getEvents = function _getEvents() {
		return this._events || (this._events = {});
	};

	// Expose the class either via AMD, CommonJS or the global object
	if (typeof define === 'function' && define.amd) {
		define(function () {
			return EventEmitter;
		});
	}
	else if (typeof module === 'object' && module.exports){
		module.exports = EventEmitter;
	}
	else {
		this.EventEmitter = EventEmitter;
	}
}.call(this));

(function(global) {

  'use strict';

  var parse = function(data) {
    if (typeof data !== 'string')
      return new TypeError('Not a string');

    var returnValue;
    try {
      returnValue = JSON.parse(data);
    }
    catch(e) {
      returnValue = e;
    }
    return returnValue;
  };
  var serialize = function(data) {
    if (typeof data !== 'object')
      return new TypeError('Not an object');

    try {
      data = JSON.stringify(data);
    }
    catch(e) {
      return e;
    }
    return data;
  };

  var utils = {parse: parse, serialize: serialize};

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = utils;
  else
    window.conducto = utils;

})();
(function() {

'use strict';

var EventEmitter;
var parse;
var serialize;
if (typeof window !== 'undefined') {
  EventEmitter = window.EventEmitter;
  parse = window.conducto.parse;
  serialize = window.conducto.serialize;
}
else {
  var utils = require('./utils');
  parse = utils.parse;
  serialize = utils.serialize;
  EventEmitter = require('events').EventEmitter;
}

var Connection = function() {
  this.transport = null;
  this.notificationHandlers = {};
  this.requestHandlers = {};
  this.responseHandlers = {};
  this.events  = new EventEmitter();
  this._emit = this.events.emit.bind(this.events);
  this._on = this.events.on.bind(this.events);
  this.lastId = 0;
  this.stack = [];
  this.localEvents = ['close', 'send', 'error', 'open', 'message'];
};
var methods = {
  isLocalEvent: function(event) {
    if (this.localEvents.indexOf(event) !== -1)
      return true;
    else
      return false;
  },
  onError: function(error) {
    if (error.data)
      error = error.data;

    this.emit('error', error);
  },
  onClose: function() {
    this.emit('close');
  },
  close: function() {
    this.transport.close();
  },
  on: function(event, callback) {
    if (this.isLocalEvent(event))
      return this._on(event, callback);

    this.addEventHandler(event, callback);
    // this.addRequestHandler(event, callback);
    // this.addNotificationHandler(event, callback);
    // this.use({name: event, handler: callback});
  },
  //payload and callback are optional
  emit: function(event, payload, callback) {
    if (this.isLocalEvent(event))
      return this._emit(event, arguments[1]);

    var stanza = {
      method: event
    };
    var payload;
    var callback;
    if (arguments[1]) {
      if (typeof arguments[1] === 'object') {
        payload = arguments[1];
      }
      else if (typeof arguments[1] === 'function')
        callback = arguments[1];
    }
    if (arguments[2] && typeof arguments[2] === 'function') {
      callback = arguments[2];
    }

    if (!callback)
      this.notify(event, payload);
    else {
      this.request(event, payload, callback);
    };
  },
  listen: function(event, callback) {
    this.addNotificationHandler(event, callback);
    this.addRequestHandler(event, callback);
  },
  onMessage: function(message) {
    if (message.data)
      message = message.data;

    var message = parse(message);
    if (message instanceof Error)
      return;//FIXME, do something, syntax error?

    if (Array.isArray(message)) {
      for (var i = 0, l = message.length; i < l; i++)
        this.onStanza(message[i]);
    }
    else
      this.onStanza(message);
  },
  onStanza: function(stanza) {
    this.emit('message', stanza);

    if (stanza.method) {
      if (this.server)
        this.server.onMessage(stanza, this);
      else {
        this.test(this, stanza);
      }
    }
    else {
      if (this.server) {
      }
      else {
        this.onResponse(stanza);
      }
    }

    // var type;
    // if (typeof stanza.id === 'undefined')
    //   this.onNotification(stanza);
    // else if (typeof stanza.method !== 'undefined')
    //   this.onRequest(stanza);
    // else
    //   this.onResponse(stanza);
  },
  notify: function(method, payload) {
    var notification = {
      method: method
    };
    if (payload !== undefined)
      notification.payload = payload;

    this.sendStanza(notification);
  },
  send: function(message) {
    this.sendStanza(message);
  },
  sendStanza: function(stanza) {
    var message = serialize(stanza);
    if (message instanceof Error)
      return message;

    this.transport.send(message);
    this.emit('send', stanza);
  },
  onRequest: function(request) {
    return;
    var handler = this.getRequestHandler(request.method);
    if (handler)
      return handler(request);
    var middleware = this.server ? this.server.middlewares[request.method] : null;
    if (!middleware)
      this.respond(request, {message: 'Method not found'});

    // this.emit('request', request);
  },
  onResponse: function(response) {
    var handler = this.getResponseHandler(response.id);
    if (handler) {
      handler(response.error, response.result);
      this.deleteResponseHandler(response.id);
    }
  },
  onNotification: function(notification) {
    var handler = this.getNotificationHandler(notification.method);
    if (handler)
      return handler(notification.payload);
  },
  sendRequest: function(request, callback) {
    if (typeof request.id === 'undefined')
      request.id = (this.lastId++).toString();

    if (callback)
      this.addResponseHandler(request.id, callback);

    this.sendStanza(request);
  },
  request: function(method, payload, callback) {
    var request = {
      method: method
    };
    var callback;
    if (typeof arguments[1] === 'function')
      callback = arguments[1];
    else {
      request.payload = arguments[1];
      callback = arguments[2];
    }
    this.sendRequest(request, callback);
  },
  respond: function(request, error, result) {
    var response = {
      id: request.id
    };

    if (error !== null && error !== undefined)
      response.error = error;
    else if (typeof result !== 'undefined')
      response.result = result;

    this.sendStanza(response);
  },
  //
  //response handler
  //
  addResponseHandler: function(id, callback) {
    this.responseHandlers[id] = callback.bind(this);
  },
  getResponseHandler: function(id) {
    return this.responseHandlers[id];
  },
  deleteResponseHandler: function(id) {
    delete this.responseHandlers[id];
  },
  //
  //request handler
  //
  addRequestHandler: function(method, handler) {
    this.requestHandlers[method] = handler;
  },
  getRequestHandler: function(method) {
    return this.requestHandlers[method];
  },
  deleteRequestHandler: function(method) {
    delete this.requestHandlers[method];
  },
  //
  //notification handler
  //
  addNotificationHandler: function(method, handler) {
    this.notificationHandlers[method] = handler.bind(this);
  },
  getNotificationHandler: function(method) {
    this.notificationHandlers[method];
  },
  deleteNotificationHandler: function(method) {
    delete this.notificationHandlers[method];
  },
  //
  //methods - goodies
  //
  use: function(middleware) {
    this.stack.push(middleware);
  },
  test: function(client, message) {
    var stack = this.stack;
    var i = 0;

    var req = {
      client: client,
      method: message.method,
      payload: message.payload
    };
    var res;

    //expect an answer
    if (message.id) {
      req.id = message.id;
      var responded = false;

      res = function(err, ok) {
        if (responded)
          throw new Error('A response to request ' + message.id + ' has already been sent.');

        client.respond(message, err, ok);
        responded = true;
      };

      var next = function() {
        var layer = stack[i++];
        if (!layer) {
          if (!responded)
            client.respond(message, 'Method not found');

          return;
        }
        // if (responded)
        //   res = function(err, res) {
        //     throw Error('Request already answered');
        //   };

        layer(req, res, next)
      };

    }
    //doesn't expect an answer
    else {
      var next = function() {
        var layer = stack[i++];
        if (!layer)
          return;
        else
          layer(req, res, next)
      };
    }

    next();
  },
  addEventHandler: function(name, handler) {
    this.use(function(req, res, next) {
      if (req.method !== name)
        return next();

      handler(req.payload, res, next);
    });
    return;
    // if (!handler)
    //   this.addNotificationHandler(name)
    // return;


    var name;
    var handler;
    //{name, handler}
    if (arguments.length === 1) {
      name = arguments[0].name;
      handler = arguments[0].handler;
    }
    //name, handler
    else {
      name = arguments[0];
      handler = arguments[1];
    }

    if (handler)
      handler = handler.bind(this);

    var that = this;
    this.addNotificationHandler(name, handler);
    this.addRequestHandler(name, function(request) {
      handler(request.payload, function(err, res) {
        that.respond(request, err, res);
      })
    });
  }
};
for (var i in methods)
  Connection.prototype[i] = methods[i];


  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Connection;
  else
    window.conducto.Connection = Connection;

})();
(function() {

  'use strict';

  var Connection;
  var WebSocket;
  if (typeof window !== 'undefined') {
    Connection = window.conducto.Connection;
    WebSocket = window.WebSocket;
  }
  else {
    Connection = require('./Connection');
    WebSocket = require('ws');
  }

  var Client = function() {
    this.transport = null;
    this.url = null;
  };
  Client.prototype = new Connection();

  var methods = {
    onOpen: function() {
      this.emit('open');
    },
    open: function(url) {
      this.url = url;
      var transport = new WebSocket(url);
      transport.addEventListener('open', this.onOpen.bind(this));
      transport.addEventListener('close', this.onClose.bind(this));
      transport.addEventListener('error', this.onError.bind(this));
      transport.addEventListener('message', this.onMessage.bind(this));
      transport = transport;
    },
  }
  for (var i in methods)
    Client.prototype[i] = methods[i];

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = Client;
  else
    window.conducto.Client = Client;


})();
(function() {
  'use strict';

  var conducto
  if (typeof window !== 'undefined') {
    conducto = window.conducto;
  }
  else {
    conducto = require('../node_modules/conducto');
  }


  var exports = function(url) {
    return new conducto.Client(url);
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = exports;
  else
    window.Y = exports;


})();