/*!
 * EventEmitter v4.2.6 - git.io/ee
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
	var proto = EventEmitter.prototype;
	var exports = this;
	var originalGlobalValue = exports.EventEmitter;

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

	/**
	 * Reverts the global {@link EventEmitter} to its previous value and returns a reference to this version.
	 *
	 * @return {Function} Non conflicting EventEmitter class.
	 */
	EventEmitter.noConflict = function noConflict() {
		exports.EventEmitter = originalGlobalValue;
		return EventEmitter;
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

  var formatQuery = function(query, sep, eq) {
    //separator character
    sep = sep || '&';
    //assignement character
    eq = eq || '=';

    var querystring = '';
    if (typeof query === 'object') {
      for (var i in query) {
        querystring += i + eq + query[i] + sep;
      }

      if (querystring.length > 0)
        querystring = '?' + querystring.slice(0, -1);
    }
    return querystring;
  };

  var formatURL = function(obj, sep, eq) {

    var querystring = formatQuery(obj.query);

    return [
      obj.secure ? 'https' : 'http',
      '://',
      obj.host,
      obj.port ? ':' + obj.port : '',
      obj.path || '/',
      querystring,
      obj.hash || ''
    ].join('');
  };

  var XMLHttpRequest = global.XMLHttpRequest;
  var dummy = function() {};

  var HTTPRequest = function(options) {
    var events = ['response', 'error', 'end'];
    for (var i = 0; i < events.length; i++)
      this['on' + events[i]] = dummy;

    var opts = HTTPClient.utils.handleOptions(options);

    for (var j in opts)
      this[j] = opts[j];

    var req = new XMLHttpRequest();

    req.addEventListener('error', (function(err) {
      this.onerror(err);
    }).bind(this));

    req.addEventListener('readystatechange', (function() {
      //0   UNSENT  open()has not been called yet.
      //1   OPENED  send()has not been called yet.
      //2   HEADERS_RECEIVED  send() has been called, and headers and status are available.
      //3   LOADING   Downloading; responseText holds partial data.
      //4   DONE  The operation is complete.
      // if (req.readyState === 1) {
      //   this.onopen();
      // }
      if (req.readyState === 2) {
        var headers = {};
        var str = req.getAllResponseHeaders();
        if (str) {
          var lines = str.split('\n');
          for (var i = 0; i < lines.length; i++) {
            if (!lines[i])
              continue;

            var keyvalue = lines[i].split(':');
            headers[keyvalue[0].toLowerCase()] = keyvalue.slice(1).join().trim();
          }
        }

        var status = req.status;
        this.onresponse({
          headers: headers,
          status: status,
          type: HTTPClient.utils.getTypeFromHeaders(headers)
        });
      }
      else if (req.readyState === 4) {
        this.onend(req.response);
      }
    }).bind(this));

    // req.addEventListener('progress', (function(e) {
    //   var complete = e.lengthComputable ? e.loaded / e.total : null;
    //   this.ondownloadprogress(complete);
    // }).bind(this));

    // req.upload.addEventListener('progress', (function(e) {
    //   var complete = e.lengthComputable ? e.loaded / e.total : null;
    //   this.onuploadprogress(complete);
    // }).bind(this));

    req.open(opts.method, formatURL(opts), true);

    // if (this.responseType)
    //   req.responseType = this.responseType;

    for (var k in opts.headers) {
      req.setRequestHeader(k, opts.headers[k]);
    }

    req.send(opts.body);

    this.req = req;
  };
  HTTPRequest.prototype.abort = function() {
    this.req.abort();
  };

  global.HTTPRequest = HTTPRequest;

})(this);
(function(global) {

  'use strict';

  var HTTPRequest;

  if (typeof module !== 'undefined' && module.exports)
    HTTPRequest = require('./lib/node');
  else
    HTTPRequest = global.HTTPRequest;

  var test = function(options, callback) {
    if (!callback)
      return new HTTPRequest(options);

    var req = new HTTPRequest(options);
    req.onerror = function(err) {
      callback(err);
    };
    var res;
    req.onresponse = function(response) {
      res = response;
    };
    req.onend = function(body) {
      res.body = body;
      callback(null, res);
    };

    return req;
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = test;
  else
    global.HTTPClient = test;

})(this);
(function(global) {

  'use strict';

  var base64;
  if (typeof Buffer !== 'undefined') {
    base64 = function(str) {
      return (new Buffer(str)).toString('base64');
    };
  }
  else {
    base64 = global.btoa;
  }

  var getPrototypeOf = function(obj) {
    if (Object.getPrototypeOf)
      return Object.getPrototypeOf(obj);
    else
      return obj.__proto__;
  };

  var prototypeOfObject = getPrototypeOf({});

  var handleOptions = function(opts) {

    var options = {};

    options.query = typeof opts.query === 'object' ? opts.query : {};
    options.secure = !!opts.secure || false;
    options.port = opts.port || (options.secure ? 443 : 80);
    options.host = opts.host || 'localhost';
    options.path = opts.path || '/';
    options.headers = typeof opts.headers === 'object' ? opts.headers : {};
    options.method = typeof opts.method === 'string' ? opts.method.toUpperCase() : 'GET';

    //to lower cases headers
    for (var i in options.headers) {
      var v = options.headers[i];
      delete options.headers[i];
      options.headers[i.toLowerCase()] = v;
    }

    //basic auth
    if (typeof opts.username === 'string' && typeof opts.password === 'string') {
      var creds = opts.username + ':' + opts.password;
      options.headers.authorization = 'Basic ' + base64(creds);
    }

    //json
    if (Array.isArray(opts.body) || (typeof opts.body == 'object' && getPrototypeOf(opts.body) === prototypeOfObject)) {
      options.body = JSON.stringify(opts.body);
      if (!options.headers['tontent-type'])
        options.headers['content-type'] = 'application/json; charset=utf-8';
    }
    //string
    else if (typeof opts.body === 'string') {
      options.body = opts.body;
      if (!options.headers['content-type'])
        options.headers['content-type'] = 'text/plain; charset=utf-8';
    }
    else if (opts.body !== undefined || opts.body !== null) {
      options.body = opts.body;
    }

    return options;
  };

  var getTypeFromHeaders = function(headers) {
    var type = '';
    if (typeof headers === 'object') {
      var contentType = headers['content-type'];
      if (contentType)
        type = contentType.split(';')[0];
    }
    return type;
  };

  var utils = {
    handleOptions: handleOptions,
    getTypeFromHeaders: getTypeFromHeaders,
    getPrototypeOf: getPrototypeOf
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = utils;
  else
    global.HTTPClient.utils = utils;

})(this);
(function(global) {

  'use strict';

  if (typeof module !== 'undefined' && module.exports) {
    var utils = require('./lib/utils');
    var Connection = require('./lib/Connection');
    module.exports = {
      parse: utils.parse,
      serialize: utils.serialize,
      Connection: Connection
    };
  }
  else
    global.conducto = {};

})(this);
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
    if (typeof data !== 'object' || data === null)
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

  if (typeof module !== 'undefined' && module.exports)
    module.exports = utils;
  else {
    global.conducto.parse = parse;
    global.conducto.serialize = serialize;
  }

})(this);
(function(global) {

  'use strict';

  var EventEmitter;
  var utils;
  var inherits;

  if (typeof module !== 'undefined' && module.exports) {
    utils = require('./utils');
    EventEmitter = require('events').EventEmitter;
    inherits = require('util').inherits;
  }
  else {
    utils = {
      serialize: global.conducto.serialize,
      parse: global.conducto.parse
    };
    EventEmitter = global.EventEmitter;
    //https://github.com/joyent/node/blob/master/lib/util.js#L558
    inherits = function(ctor, superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
  }

  var Connection = function() {
    EventEmitter.call(this);
    this.actions = {};
    this.responseHandlers = {};
    this.lastId = 0;
  };
  inherits(Connection, EventEmitter);
  var methods = {
    onError: function(error) {
      if (error.data)
        error = error.data;

      this.emit('error', error);
    },
    onOpen: function() {
      this.emit('open');
    },
    onClose: function() {
      this.emit('close');
    },
    close: function() {
      if (this.transport)
        this.transport.close();

      this.onClose();
    },
    onData: function(data) {
      if (typeof data === 'object' && 'data' in data)
        data = data.data;

      var message = utils.parse(data);
      if (message instanceof Error)
        return; //FIXME

      if (Array.isArray(message)) {
        for (var i = 0, l = message.length; i < l; i++)
          this.onMessage(message[i]);
      }
      else
        this.onMessage(message);

      this.emit('message', message, data);
    },
    onMessage: function(message) {
      if (message.method)
        this.emit(message.method, message.payload);
      else
        this.onResponse(message);
    },
    notify: function(method, payload) {
      var notification = {
        method: method
      };
      if (payload !== undefined)
        notification.payload = payload;

      this.sendNotification(notification);
    },
    send: function() {
      if (typeof arguments[0] === 'object') {
        if (typeof arguments[1] === 'function')
          this.sendRequest(arguments[0], arguments[1]);
        else
          this.sendNotification(arguments[0]);

        return;
      }

      var event = arguments[0];

      if (this.actions[event])
        return this.actions[event].apply(this, Array.prototype.slice.call(arguments, 1));

      var payload;
      var callback;
      if (typeof arguments[1] === 'function')
        callback = arguments[1];
      else if (typeof arguments[1] !== 'undefined') {
        payload = arguments[1];
        if (typeof arguments[2] === 'function')
          callback = arguments[2];
      }

      if (!callback)
        this.notify(event, payload);
      else {
        if (payload !== undefined)
          this.request(event, payload, callback);
        else
          this.request(event, callback);
      }
    },
    defineAction: function(name, callback) {
      this.actions[name] = callback.bind(this);
    },
    sendMessage: function(message) {
      if (!this.transport)
        return; //FIXME do something?
      if (this.readyState !== 1)
        return; //FIXME do something?

      var serialized = utils.serialize(message);
      if (serialized instanceof Error)
        return serialized;

      this.transport.send(serialized);

      //FIXME dirty hack
      var hack = (function() {
        this.emit('send', message, serialized);
      }).bind(this);

      if (typeof process !== 'undefined' && process.nextTick)
        process.nextTick(hack);
      else
        setTimeout(hack, 0);
    },
    // onRequest: function(request) {
    //   return;
    //   // var handler = this.getRequestHandler(request.method);
    //   // if (handler)
    //   //   return handler(request);
    //   // var middleware = this.server ? this.server.middlewares[request.method] : null;
    //   // if (!middleware)
    //   //   this.respond(request, {message: 'Method not found'});

    //   // this.emit('request', request);
    // },
    onResponse: function(response) {
      var handler = this.getResponseHandler(response.id);
      if (handler) {
        handler(response.error, response.result);
        this.deleteResponseHandler(response.id);
      }
    },
    sendNotification: function(notif) {
      delete notif.id;
      this.sendMessage(notif);
    },
    sendRequest: function(request, callback) {
      if (request.id === undefined)
        request.id = (this.lastId++).toString();

      if (callback)
        this.addResponseHandler(request.id, callback);

      this.sendMessage(request);
    },
    request: function(method, payload, callback) {
      var request = {
        method: method
      };

      if (typeof arguments[1] === 'function') {
        callback = arguments[1];
        payload = undefined;
      }
      else {
        callback = arguments[2];
        payload = arguments[1];
      }

      if (payload !== undefined)
        request.payload = payload;

      this.sendRequest(request, callback);
    },
    respond: function(request, error, result) {
      var response = {
        id: request.id
      };

      if (error !== null && error !== undefined)
        response.error = error;
      else if (result !== undefined)
        response.result = result;

      this.sendMessage(response);
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
  };
  for (var i in methods)
    Connection.prototype[i] = methods[i];

  Object.defineProperty(Connection.prototype, 'readyState', {
    get: function() {
      return this.transport ? this.transport.readyState : 3;
    }
  });

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Connection;
  else
    global.conducto.Connection = Connection;

})(this);
(function(global) {

  'use strict';

  var Connection;
  var WebSocket;
  var http;
  if (typeof module !== 'undefined' && module.exports) {
    Connection = require('conducto-core').Connection;
    WebSocket = require('ws');
    http = require('httpclient');
  }
  else {
    Connection = global.conducto.Connection;
    WebSocket = global.WebSocket;
    http = global.HTTPClient;
  }

  var formatQuery = function(query) {
    var querystring = '';
    if (typeof query === 'object') {
      for (var i in query) {
        querystring += i + '=' + query[i] + '&';
      }

      if (querystring.length > 0)
        querystring = '?' + querystring.slice(0, -1);
    }
    return querystring;
  };

  var opts = {
    keepalive: 5000,
    timeout: 2500,
    path: '/',
    port: 443,
    secure: true,
    host: 'localhost',
    query: {}
  };

  var Client = function(option) {
    this.transport = null;
    Connection.call(this);
    for (var i in opts)
      this[i] = opts[i];
    this.handleOption(option);
  };
  Client.prototype = Connection.prototype;

  var methods = {
    open: function() {
      var option;
      var callback;
      if (typeof arguments[0] === 'function')
        callback = arguments[0];
      else if (typeof arguments[0] !== 'function') {
        option = arguments[0];
        if (typeof arguments[1] === 'function')
          callback = arguments[1];
      }

      this.handleOption(option);

      if (callback)
        this.once('open', callback);

      var url = (this.secure ? 'wss' : 'ws') + '://' + this.host + ':' + this.port + this.path;
      var qs = formatQuery(this.query);
      if (qs)
        url += qs;

      this.transport = new WebSocket(url);
      this.transport.addEventListener('open', this.onOpen.bind(this));
      this.transport.addEventListener('close', this.onClose.bind(this));
      this.transport.addEventListener('error', this.onError.bind(this));
      this.transport.addEventListener('message', this.onData.bind(this));

      if (this.keepalive) {
        this.on('message', this.pingpong);
        this.once('close', function() {
          this.removeListener('message', this.pingpong);
        });
      }
    },
    handleOption: function(option) {
      if (typeof option === 'string')
        this.host = option;
      else if (typeof option === 'object') {
        for (var i in opts) {
          if (i in option) {
            this[i] = option[i];
          }
        }
      }
    },
    pingpong: function() {
      if (this.pingTimeout)
        clearTimeout(this.pingTimeout);

      var that = this;

      this.pingTimeout = setTimeout(function() {
        var pong = setTimeout(function() {
          that.close();
        }, that.timeout);
        that.send('ping', function() {
          clearTimeout(pong);
        });
      }, this.keepalive);
    },
    HTTPRequest: function(opts, callback) {
      var options = {
        host: this.host,
        port: this.port,
        secure: this.secure,
        username: this.username,
        password: this.password,
        query: this.query,
        path: this.path
      };

      if (opts.auth === false) {
        delete options.username;
        delete options.password;
        delete opts.auth;
      }
      delete opts.path;
      for (var i in opts)
        options[i] = opts[i];

      http(options, callback);
    }
  };

  for (var i in methods)
    Client.prototype[i] = methods[i];

  if (typeof module !== 'undefined' && module.exports)
    module.exports = Client;
  else
    global.conducto.Client = Client;

})(this);
/* Automatically generated. Do not edit. */
var PHONE_NUMBER_META_DATA = {
"46": '["SE","00","0",,,"$NP$FG","\\d{5,10}","[1-9]\\d{5,9}",[["(8)(\\d{2,3})(\\d{2,3})(\\d{2})","$1-$2 $3 $4","8",,"$1 $2 $3 $4"],["([1-69]\\d)(\\d{2,3})(\\d{2})(\\d{2})","$1-$2 $3 $4","1[013689]|2[0136]|3[1356]|4[0246]|54|6[03]|90",,"$1 $2 $3 $4"],["([1-69]\\d)(\\d{3})(\\d{2})","$1-$2 $3","1[13689]|2[136]|3[1356]|4[0246]|54|6[03]|90",,"$1 $2 $3"],["(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1-$2 $3 $4","1[2457]|2[2457-9]|3[0247-9]|4[1357-9]|5[0-35-9]|6[124-9]|9(?:[125-8]|3[0-5]|4[0-3])",,"$1 $2 $3 $4"],["(\\d{3})(\\d{2,3})(\\d{2})","$1-$2 $3","1[2457]|2[2457-9]|3[0247-9]|4[1357-9]|5[0-35-9]|6[124-9]|9(?:[125-8]|3[0-5]|4[0-3])",,"$1 $2 $3"],["(7\\d)(\\d{3})(\\d{2})(\\d{2})","$1-$2 $3 $4","7",,"$1 $2 $3 $4"],["(77)(\\d{2})(\\d{2})","$1-$2$3","7",,"$1 $2 $3"],["(20)(\\d{2,3})(\\d{2})","$1-$2 $3","20",,"$1 $2 $3"],["(9[034]\\d)(\\d{2})(\\d{2})(\\d{3})","$1-$2 $3 $4","9[034]",,"$1 $2 $3 $4"],["(9[034]\\d)(\\d{4})","$1-$2","9[034]",,"$1 $2"]]]',
"299": '["GL","00",,,,,"\\d{6}","[1-689]\\d{5}",[["(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",,,]]]',
"385": '["HR","00","0",,,"$NP$FG","\\d{6,12}","[1-7]\\d{5,8}|[89]\\d{6,11}",[["(1)(\\d{4})(\\d{3})","$1 $2 $3","1",,],["(6[09])(\\d{4})(\\d{3})","$1 $2 $3","6[09]",,],["(62)(\\d{3})(\\d{3,4})","$1 $2 $3","62",,],["([2-5]\\d)(\\d{3})(\\d{3})","$1 $2 $3","[2-5]",,],["(9\\d)(\\d{3})(\\d{3,4})","$1 $2 $3","9",,],["(9\\d)(\\d{4})(\\d{4})","$1 $2 $3","9",,],["(9\\d)(\\d{3,4})(\\d{3})(\\d{3})","$1 $2 $3 $4","9",,],["(\\d{2})(\\d{2})(\\d{2,3})","$1 $2 $3","6[145]|7",,],["(\\d{2})(\\d{3,4})(\\d{3})","$1 $2 $3","6[145]|7",,],["(80[01])(\\d{2})(\\d{2,3})","$1 $2 $3","8",,],["(80[01])(\\d{3,4})(\\d{3})","$1 $2 $3","8",,]]]',
"670": '["TL","00",,,,,"\\d{7,8}","[2-489]\\d{6}|7\\d{6,7}",[["(\\d{3})(\\d{4})","$1 $2","[2-489]",,],["(\\d{4})(\\d{4})","$1 $2","7",,]]]',
"258": '["MZ","00",,,,,"\\d{8,9}","[28]\\d{7,8}",[["([28]\\d)(\\d{3})(\\d{3,4})","$1 $2 $3","2|8[246]",,],["(80\\d)(\\d{3})(\\d{3})","$1 $2 $3","80",,]]]',
"359": '["BG","00","0",,,"$NP$FG","\\d{5,9}","[23567]\\d{5,7}|[489]\\d{6,8}",[["(2)(\\d{5})","$1 $2","29",,],["(2)(\\d{3})(\\d{3,4})","$1 $2 $3","2",,],["(\\d{3})(\\d{4})","$1 $2","43[124-7]|70[1-9]",,],["(\\d{3})(\\d{3})(\\d{2})","$1 $2 $3","43[124-7]|70[1-9]",,],["(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3","[78]00",,],["(\\d{2})(\\d{3})(\\d{2,3})","$1 $2 $3","[356]|4[124-7]|7[1-9]|8[1-6]|9[1-7]",,],["(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3","48|8[7-9]|9[08]",,]]]',
"682": '["CK","00",,,,,"\\d{5}","[2-57]\\d{4}",[["(\\d{2})(\\d{3})","$1 $2",,,]]]',
"852": '["HK","00",,,,,"\\d{5,11}","[235-7]\\d{7}|8\\d{7,8}|9\\d{4,10}",[["(\\d{4})(\\d{4})","$1 $2","[235-7]|[89](?:0[1-9]|[1-9])",,],["(800)(\\d{3})(\\d{3})","$1 $2 $3","800",,],["(900)(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3 $4","900",,],["(900)(\\d{2,5})","$1 $2","900",,]]]',
"998": '["UZ","810","8",,,"$NP $FG","\\d{7,9}","[679]\\d{8}",[["([679]\\d)(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"291": '["ER","00","0",,,"$NP$FG","\\d{6,7}","[178]\\d{6}",[["(\\d)(\\d{3})(\\d{3})","$1 $2 $3",,,]]]',
"95": '["MM","00","0",,,"$NP$FG","\\d{5,10}","[14578]\\d{5,7}|[26]\\d{5,8}|9(?:[258]|3\\d|4\\d{1,2}|[679]\\d?)\\d{6}",[["(\\d)(\\d{3})(\\d{3,4})","$1 $2 $3","1|2[45]",,],["(2)(\\d{4})(\\d{4})","$1 $2 $3","251",,],["(\\d)(\\d{2})(\\d{3})","$1 $2 $3","16|2",,],["(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3","67|81",,],["(\\d{2})(\\d{2})(\\d{3,4})","$1 $2 $3","[4-8]",,],["(9)(\\d{3})(\\d{4,5})","$1 $2 $3","9(?:[235-9]|4[13789])",,],["(9)(4\\d{4})(\\d{4})","$1 $2 $3","94[0245]",,]]]',
"266": '["LS","00",,,,,"\\d{8}","[2568]\\d{7}",[["(\\d{4})(\\d{4})","$1 $2",,,]]]',
"245": '["GW","00",,,,,"\\d{7}","[3-79]\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"374": '["AM","00","0",,,"($NP$FG)","\\d{5,8}","[1-9]\\d{7}",[["(\\d{2})(\\d{6})","$1 $2","1|47",,],["(\\d{2})(\\d{6})","$1 $2","[5-7]|9[1-9]","$NP$FG",],["(\\d{3})(\\d{5})","$1 $2","[23]",,],["(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3","8|90","$NP $FG",]]]',
"379": '["VA","00",,,,,"\\d{10}","06\\d{8}",[["(06)(\\d{4})(\\d{4})","$1 $2 $3",,,]]]',
"61": ['["AU","(?:14(?:1[14]|34|4[17]|[56]6|7[47]|88))?001[14-689]","0",,,,"\\d{6,10}","[1-578]\\d{5,9}",[["([2378])(\\d{4})(\\d{4})","$1 $2 $3","[2378]","($NP$FG)",],["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3","[45]|14","$NP$FG",],["(16)(\\d{3})(\\d{2,4})","$1 $2 $3","16","$NP$FG",],["(1[389]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","1(?:[38]0|90)","$FG",],["(180)(2\\d{3})","$1 $2","180","$FG",],["(19\\d)(\\d{3})","$1 $2","19[13]","$FG",],["(19\\d{2})(\\d{4})","$1 $2","19[67]","$FG",],["(13)(\\d{2})(\\d{2})","$1 $2 $3","13[1-9]","$FG",]]]','["CC","(?:14(?:1[14]|34|4[17]|[56]6|7[47]|88))?001[14-689]","0",,,,"\\d{6,10}","[1458]\\d{5,9}",]','["CX","(?:14(?:1[14]|34|4[17]|[56]6|7[47]|88))?001[14-689]","0",,,,"\\d{6,10}","[1458]\\d{5,9}",]'],
"500": '["FK","00",,,,,"\\d{5}","[2-7]\\d{4}",]',
"261": '["MG","00","0",,,"$NP$FG","\\d{7,9}","[23]\\d{8}",[["([23]\\d)(\\d{2})(\\d{3})(\\d{2})","$1 $2 $3 $4",,,]]]',
"92": '["PK","00","0",,,"($NP$FG)","\\d{6,12}","1\\d{8}|[2-8]\\d{5,11}|9(?:[013-9]\\d{4,9}|2\\d(?:111\\d{6}|\\d{3,7}))",[["(\\d{2})(111)(\\d{3})(\\d{3})","$1 $2 $3 $4","(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)1",,],["(\\d{3})(111)(\\d{3})(\\d{3})","$1 $2 $3 $4","2[349]|45|54|60|72|8[2-5]|9[2-9]",,],["(\\d{2})(\\d{7,8})","$1 $2","(?:2[125]|4[0-246-9]|5[1-35-7]|6[1-8]|7[14]|8[16]|91)[2-9]",,],["(\\d{3})(\\d{6,7})","$1 $2","2[349]|45|54|60|72|8[2-5]|9[2-9]",,],["(3\\d{2})(\\d{7})","$1 $2","3","$NP$FG",],["([15]\\d{3})(\\d{5,6})","$1 $2","58[12]|1",,],["(586\\d{2})(\\d{5})","$1 $2","586",,],["([89]00)(\\d{3})(\\d{2})","$1 $2 $3","[89]00","$NP$FG",]]]',
"234": '["NG","009","0",,,"$NP$FG","\\d{5,14}","[1-69]\\d{5,8}|[78]\\d{5,13}",[["([129])(\\d{3})(\\d{3,4})","$1 $2 $3","[129]",,],["([3-8]\\d)(\\d{3})(\\d{2,3})","$1 $2 $3","[3-6]|7(?:[1-79]|0[1-9])|8[2-9]",,],["([78]\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3","70|8[01]",,],["([78]00)(\\d{4})(\\d{4,5})","$1 $2 $3","[78]00",,],["([78]00)(\\d{5})(\\d{5,6})","$1 $2 $3","[78]00",,],["(78)(\\d{2})(\\d{3})","$1 $2 $3","78",,]]]',
"350": '["GI","00",,,,,"\\d{8}","[2568]\\d{7}",[["(\\d{3})(\\d{5})","$1 $2","2",,]]]',
"45": '["DK","00",,,,,"\\d{8}","[2-9]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"963": '["SY","00","0",,,"$NP$FG","\\d{6,9}","[1-59]\\d{7,8}",[["(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3","[1-5]",,],["(9\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","9",,]]]',
"226": '["BF","00",,,,,"\\d{8}","[24-7]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"974": '["QA","00",,,,,"\\d{7,8}","[2-8]\\d{6,7}",[["([28]\\d{2})(\\d{4})","$1 $2","[28]",,],["([3-7]\\d{3})(\\d{4})","$1 $2","[3-7]",,]]]',
"218": '["LY","00","0",,,"$NP$FG","\\d{7,9}","[25679]\\d{8}",[["([25679]\\d)(\\d{7})","$1-$2",,,]]]',
"51": '["PE","19(?:1[124]|77|90)00","0",,,"($NP$FG)","\\d{6,9}","[14-9]\\d{7,8}",[["(1)(\\d{7})","$1 $2","1",,],["([4-8]\\d)(\\d{6})","$1 $2","[4-7]|8[2-4]",,],["(\\d{3})(\\d{5})","$1 $2","80",,],["(9\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","9","$FG",]]]',
"62": '["ID","0(?:0[1789]|10(?:00|1[67]))","0",,,"$NP$FG","\\d{5,11}","[1-9]\\d{6,10}",[["(\\d{2})(\\d{7,8})","$1 $2","2[124]|[36]1","($NP$FG)",],["(\\d{3})(\\d{5,7})","$1 $2","[4579]|2[035-9]|[36][02-9]","($NP$FG)",],["(8\\d{2})(\\d{3,4})(\\d{3,4})","$1-$2-$3","8[1-35-9]",,],["(177)(\\d{6,8})","$1 $2","1",,],["(800)(\\d{5,7})","$1 $2","800",,],["(809)(\\d)(\\d{3})(\\d{3})","$1 $2 $3 $4","809",,]]]',
"298": '["FO","00",,"(10(?:01|[12]0|88))",,,"\\d{6}","[2-9]\\d{5}",[["(\\d{6})","$1",,,]]]',
"381": '["RS","00","0",,,"$NP$FG","\\d{5,12}","[126-9]\\d{4,11}|3(?:[0-79]\\d{3,10}|8[2-9]\\d{2,9})",[["([23]\\d{2})(\\d{4,9})","$1 $2","(?:2[389]|39)0",,],["([1-3]\\d)(\\d{5,10})","$1 $2","1|2(?:[0-24-7]|[389][1-9])|3(?:[0-8]|9[1-9])",,],["(6\\d)(\\d{6,8})","$1 $2","6",,],["([89]\\d{2})(\\d{3,9})","$1 $2","[89]",,],["(7[26])(\\d{4,9})","$1 $2","7[26]",,],["(7[08]\\d)(\\d{4,9})","$1 $2","7[08]",,]]]',
"975": '["BT","00",,,,,"\\d{6,8}","[1-8]\\d{6,7}",[["([17]7)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","1|77",,],["([2-8])(\\d{3})(\\d{3})","$1 $2 $3","[2-68]|7[246]",,]]]',
"34": '["ES","00",,,,,"\\d{9}","[5-9]\\d{8}",[["([5-9]\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[568]|[79][0-8]",,]]]',
"881": '["001",,,,,,"\\d{9}","[67]\\d{8}",[["(\\d)(\\d{3})(\\d{5})","$1 $2 $3","[67]",,]]]',
"855": '["KH","00[14-9]","0",,,,"\\d{6,10}","[1-9]\\d{7,9}",[["(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3","1\\d[1-9]|[2-9]","$NP$FG",],["(1[89]00)(\\d{3})(\\d{3})","$1 $2 $3","1[89]0",,]]]',
"420": '["CZ","00",,,,,"\\d{9,12}","[2-8]\\d{8}|9\\d{8,11}",[["([2-9]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","[2-8]|9[015-7]",,],["(96\\d)(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4","96",,],["(9\\d)(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4","9[36]",,]]]',
"216": '["TN","00",,,,,"\\d{8}","[2-57-9]\\d{7}",[["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3",,,]]]',
"673": '["BN","00",,,,,"\\d{7}","[2-578]\\d{6}",[["([2-578]\\d{2})(\\d{4})","$1 $2",,,]]]',
"290": ['["SH","00",,,,,"\\d{4,5}","[2-79]\\d{3,4}",]','["TA","00",,,,,"\\d{4}","8\\d{3}",]'],
"882": '["001",,,,,,"\\d{7,12}","[13]\\d{6,11}",[["(\\d{2})(\\d{4})(\\d{3})","$1 $2 $3","3[23]",,],["(\\d{2})(\\d{5})","$1 $2","16|342",,],["(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3","34[57]",,],["(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3","348",,],["(\\d{2})(\\d{2})(\\d{4})","$1 $2 $3","1",,],["(\\d{2})(\\d{3,4})(\\d{4})","$1 $2 $3","16",,],["(\\d{2})(\\d{4,5})(\\d{5})","$1 $2 $3","16",,]]]',
"267": '["BW","00",,,,,"\\d{7,8}","[2-79]\\d{6,7}",[["(\\d{3})(\\d{4})","$1 $2","[2-6]",,],["(7\\d)(\\d{3})(\\d{3})","$1 $2 $3","7",,],["(90)(\\d{5})","$1 $2","9",,]]]',
"94": '["LK","00","0",,,"$NP$FG","\\d{7,9}","[1-9]\\d{8}",[["(\\d{2})(\\d{1})(\\d{6})","$1 $2 $3","[1-689]",,],["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","7",,]]]',
"356": '["MT","00",,,,,"\\d{8}","[2357-9]\\d{7}",[["(\\d{4})(\\d{4})","$1 $2",,,]]]',
"375": '["BY","810","8","8?0?",,,"\\d{7,11}","[1-4]\\d{8}|[89]\\d{9,10}",[["([1-4]\\d)(\\d{3})(\\d{4})","$1 $2 $3","[1-4]","$NP 0$FG",],["([89]\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","8[01]|9","$NP $FG",],["(8\\d{2})(\\d{4})(\\d{4})","$1 $2 $3","82","$NP $FG",]]]',
"690": '["TK","00",,,,,"\\d{4}","[2-9]\\d{3}",]',
"507": '["PA","00",,,,,"\\d{7,8}","[1-9]\\d{6,7}",[["(\\d{3})(\\d{4})","$1-$2","[1-57-9]",,],["(\\d{4})(\\d{4})","$1-$2","6",,]]]',
"692": '["MH","011","1",,,,"\\d{7}","[2-6]\\d{6}",[["(\\d{3})(\\d{4})","$1-$2",,,]]]',
"250": '["RW","00","0",,,,"\\d{8,9}","[027-9]\\d{7,8}",[["(2\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","2","$FG",],["([7-9]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","[7-9]","$NP$FG",],["(0\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","0",,]]]',
"81": '["JP","010","0",,,"$NP$FG","\\d{7,16}","[1-9]\\d{8,9}|0(?:[36]\\d{7,14}|7\\d{5,7}|8\\d{7})",[["(\\d{3})(\\d{3})(\\d{3})","$1-$2-$3","(?:12|57|99)0",,],["(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3","800",,],["(\\d{3})(\\d{4})","$1-$2","077",,],["(\\d{3})(\\d{2})(\\d{3,4})","$1-$2-$3","077",,],["(\\d{3})(\\d{2})(\\d{4})","$1-$2-$3","088",,],["(\\d{3})(\\d{3})(\\d{3,4})","$1-$2-$3","0(?:37|66)",,],["(\\d{3})(\\d{4})(\\d{4,5})","$1-$2-$3","0(?:37|66)",,],["(\\d{3})(\\d{5})(\\d{5,6})","$1-$2-$3","0(?:37|66)",,],["(\\d{3})(\\d{6})(\\d{6,7})","$1-$2-$3","0(?:37|66)",,],["(\\d{2})(\\d{4})(\\d{4})","$1-$2-$3","[2579]0|80[1-9]",,],["(\\d{4})(\\d)(\\d{4})","$1-$2-$3","1(?:26|3[79]|4[56]|5[4-68]|6[3-5])|5(?:76|97)|499|746|8(?:3[89]|63|47|51)|9(?:49|80|9[16])",,],["(\\d{3})(\\d{2})(\\d{4})","$1-$2-$3","1(?:2[3-6]|3[3-9]|4[2-6]|5[2-8]|[68][2-7]|7[2-689]|9[1-578])|2(?:2[03-689]|3[3-58]|4[0-468]|5[04-8]|6[013-8]|7[06-9]|8[02-57-9]|9[13])|4(?:2[28]|3[689]|6[035-7]|7[05689]|80|9[3-5])|5(?:3[1-36-9]|4[4578]|5[013-8]|6[1-9]|7[2-8]|8[14-7]|9[4-9])|7(?:2[15]|3[5-9]|4[02-9]|6[135-8]|7[0-4689]|9[014-9])|8(?:2[49]|3[3-8]|4[5-8]|5[2-9]|6[35-9]|7[579]|8[03-579]|9[2-8])|9(?:[23]0|4[02-46-9]|5[024-79]|6[4-9]|7[2-47-9]|8[02-7]|9[3-7])",,],["(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3","1|2(?:2[37]|5[5-9]|64|78|8[39]|91)|4(?:2[2689]|64|7[347])|5(?:[2-589]|39)|60|8(?:[46-9]|3[279]|2[124589])|9(?:[235-8]|93)",,],["(\\d{3})(\\d{2})(\\d{4})","$1-$2-$3","2(?:9[14-79]|74|[34]7|[56]9)|82|993",,],["(\\d)(\\d{4})(\\d{4})","$1-$2-$3","3|4(?:2[09]|7[01])|6[1-9]",,],["(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3","[2479][1-9]",,]]]',
"237": '["CM","00",,,,,"\\d{8}","[2357-9]\\d{7}",[["([2357-9]\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[23579]|88",,],["(800)(\\d{2})(\\d{3})","$1 $2 $3","80",,]]]',
"351": '["PT","00",,,,,"\\d{9}","[2-46-9]\\d{8}",[["(2\\d)(\\d{3})(\\d{4})","$1 $2 $3","2[12]",,],["([2-46-9]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","2[3-9]|[346-9]",,]]]',
"246": '["IO","00",,,,,"\\d{7}","3\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"227": '["NE","00",,,,,"\\d{8}","[0289]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[289]|09",,],["(08)(\\d{3})(\\d{3})","$1 $2 $3","08",,]]]',
"27": '["ZA","00","0",,,"$NP$FG","\\d{5,9}","[1-79]\\d{8}|8(?:[067]\\d{7}|[1-4]\\d{3,7})",[["(860)(\\d{3})(\\d{3})","$1 $2 $3","860",,],["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","[1-79]|8(?:[0-47]|6[1-9])",,],["(\\d{2})(\\d{3,4})","$1 $2","8[1-4]",,],["(\\d{2})(\\d{3})(\\d{2,3})","$1 $2 $3","8[1-4]",,]]]',
"962": '["JO","00","0",,,"$NP$FG","\\d{7,9}","[235-9]\\d{7,8}",[["(\\d)(\\d{3})(\\d{4})","$1 $2 $3","[2356]|87","($NP$FG)",],["(7)(\\d{4})(\\d{4})","$1 $2 $3","7[457-9]",,],["(\\d{3})(\\d{5,6})","$1 $2","70|8[0158]|9",,]]]',
"387": '["BA","00","0",,,"$NP$FG","\\d{6,9}","[3-9]\\d{7,8}",[["(\\d{2})(\\d{3})(\\d{3})","$1 $2-$3","[3-5]",,],["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","6[1-356]|[7-9]",,],["(\\d{2})(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3 $4","6[047]",,]]]',
"33": '["FR","00","0",,,"$NP$FG","\\d{9}","[1-9]\\d{8}",[["([1-79])(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5","[1-79]",,],["(1\\d{2})(\\d{3})","$1 $2","11","$FG","NA"],["(8\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","8","$NP $FG",]]]',
"972": '["IL","0(?:0|1[2-9])","0",,,"$FG","\\d{4,10}","[17]\\d{6,9}|[2-589]\\d{3}(?:\\d{3,6})?|6\\d{3}",[["([2-489])(\\d{3})(\\d{4})","$1-$2-$3","[2-489]","$NP$FG",],["([57]\\d)(\\d{3})(\\d{4})","$1-$2-$3","[57]","$NP$FG",],["(1)([7-9]\\d{2})(\\d{3})(\\d{3})","$1-$2-$3-$4","1[7-9]",,],["(1255)(\\d{3})","$1-$2","125",,],["(1200)(\\d{3})(\\d{3})","$1-$2-$3","120",,],["(1212)(\\d{2})(\\d{2})","$1-$2-$3","121",,],["(1599)(\\d{6})","$1-$2","15",,],["(\\d{4})","*$1","[2-689]",,]]]',
"248": '["SC","0[0-2]",,,,,"\\d{6,7}","[24689]\\d{5,6}",[["(\\d{3})(\\d{3})","$1 $2","[89]",,],["(\\d)(\\d{3})(\\d{3})","$1 $2 $3","[246]",,]]]',
"297": '["AW","00",,,,,"\\d{7}","[25-9]\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"421": '["SK","00","0",,,"$NP$FG","\\d{9}","[2-689]\\d{8}",[["(2)(\\d{3})(\\d{3})(\\d{2})","$1/$2 $3 $4","2",,],["([3-5]\\d)(\\d{3})(\\d{2})(\\d{2})","$1/$2 $3 $4","[3-5]",,],["([689]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","[689]",,]]]',
"672": '["NF","00",,,,,"\\d{5,6}","[13]\\d{5}",[["(\\d{2})(\\d{4})","$1 $2","1",,],["(\\d)(\\d{5})","$1 $2","3",,]]]',
"870": '["001",,,,,,"\\d{9}","[35-7]\\d{8}",[["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",,,]]]',
"883": '["001",,,,,,"\\d{9}(?:\\d{3})?","51\\d{7}(?:\\d{3})?",[["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",,,],["(\\d{3})(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3 $4",,,]]]',
"264": '["NA","00","0",,,"$NP$FG","\\d{8,9}","[68]\\d{7,8}",[["(8\\d)(\\d{3})(\\d{4})","$1 $2 $3","8[1235]",,],["(6\\d)(\\d{2,3})(\\d{4})","$1 $2 $3","6",,],["(88)(\\d{3})(\\d{3})","$1 $2 $3","88",,],["(870)(\\d{3})(\\d{3})","$1 $2 $3","870",,]]]',
"878": '["001",,,,,,"\\d{12}","1\\d{11}",[["(\\d{2})(\\d{5})(\\d{5})","$1 $2 $3",,,]]]',
"239": '["ST","00",,,,,"\\d{7}","[29]\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"357": '["CY","00",,,,,"\\d{8}","[257-9]\\d{7}",[["(\\d{2})(\\d{6})","$1 $2",,,]]]',
"240": '["GQ","00",,,,,"\\d{9}","[23589]\\d{8}",[["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3","[235]",,],["(\\d{3})(\\d{6})","$1 $2","[89]",,]]]',
"506": '["CR","00",,"(19(?:0[01468]|19|20|66|77))",,,"\\d{8,10}","[24-9]\\d{7,9}",[["(\\d{4})(\\d{4})","$1 $2","[24-7]|8[3-9]",,],["(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3","[89]0",,]]]',
"86": '["CN","(1[1279]\\d{3})?00","0","(1[1279]\\d{3})|0",,,"\\d{4,12}","1(?:00\\d{2}|\\d{6,11})|[2-7]\\d{6,11}|8[0-357-9]\\d{6,9}|9(?:5\\d{3,4}|\\d{9})",[["(80\\d{2})(\\d{4})","$1 $2","80[2678]","$NP$FG",],["([48]00)(\\d{3})(\\d{4})","$1 $2 $3","[48]00",,],["(\\d{5,6})","$1","100|95",,"NA"],["(\\d{2})(\\d{5,6})","$1 $2","(?:10|2\\d)[19]","$NP$FG",],["(\\d{3})(\\d{5,6})","$1 $2","[3-9]","$NP$FG",],["(\\d{3,4})(\\d{4})","$1 $2","[2-9]",,"NA"],["(21)(\\d{4})(\\d{4,6})","$1 $2 $3","21","$NP$FG",],["([12]\\d)(\\d{4})(\\d{4})","$1 $2 $3","10[1-9]|2[02-9]","$NP$FG",],["(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3","3(?:11|7[179])|4(?:[15]1|3[12])|5(?:1|2[37]|3[12]|51|7[13-79]|9[15])|7(?:31|5[457]|6[09]|91)|8(?:71|98)","$NP$FG",],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","3(?:1[02-9]|35|49|5|7[02-68]|9[1-68])|4(?:1[02-9]|2[179]|[35][2-9]|6[4789]|7\\d|8[23])|5(?:3[03-9]|4[36]|5[02-9]|6[1-46]|7[028]|80|9[2-46-9])|6(?:3[1-5]|6[0238]|9[12])|7(?:01|[1579]|2[248]|3[04-9]|4[3-6]|6[2368])|8(?:1[236-8]|2[5-7]|3|5[1-9]|7[02-9]|8[3678]|9[1-7])|9(?:0[1-3689]|1[1-79]|[379]|4[13]|5[1-5])","$NP$FG",],["(1[3-58]\\d)(\\d{4})(\\d{4})","$1 $2 $3","1[3-58]",,],["(10800)(\\d{3})(\\d{4})","$1 $2 $3","108",,]]]',
"257": '["BI","00",,,,,"\\d{8}","[27]\\d{7}",[["([27]\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"683": '["NU","00",,,,,"\\d{4}","[1-5]\\d{3}",]',
"43": '["AT","00","0",,,"$NP$FG","\\d{3,13}","[1-9]\\d{3,12}",[["(1)(\\d{3,12})","$1 $2","1",,],["(5\\d)(\\d{3,5})","$1 $2","5[079]",,],["(5\\d)(\\d{3})(\\d{3,4})","$1 $2 $3","5[079]",,],["(5\\d)(\\d{4})(\\d{4,7})","$1 $2 $3","5[079]",,],["(\\d{3})(\\d{3,10})","$1 $2","316|46|51|732|6(?:44|5[0-3579]|[6-9])|7(?:1|[28]0)|[89]",,],["(\\d{4})(\\d{3,9})","$1 $2","2|3(?:1[1-578]|[3-8])|4[2378]|5[2-6]|6(?:[12]|4[1-35-9]|5[468])|7(?:2[1-8]|35|4[1-8]|[5-79])",,]]]',
"247": '["AC","00",,,,,"\\d{4}","[2-467]\\d{3}",]',
"675": '["PG","00",,,,,"\\d{7,8}","[1-9]\\d{6,7}",[["(\\d{3})(\\d{4})","$1 $2","[1-689]",,],["(7\\d{3})(\\d{4})","$1 $2","7",,]]]',
"376": '["AD","00",,,,,"\\d{6,8}","(?:[346-9]|180)\\d{5}",[["(\\d{3})(\\d{3})","$1 $2","[346-9]",,],["(180[02])(\\d{4})","$1 $2","1",,]]]',
"63": '["PH","00","0",,,,"\\d{5,13}","2\\d{5,7}|[3-9]\\d{7,9}|1800\\d{7,9}",[["(2)(\\d{3})(\\d{4})","$1 $2 $3","2","($NP$FG)",],["(2)(\\d{5})","$1 $2","2","($NP$FG)",],["(\\d{4})(\\d{4,6})","$1 $2","3(?:23|39|46)|4(?:2[3-6]|[35]9|4[26]|76)|5(?:22|44)|642|8(?:62|8[245])","($NP$FG)",],["(\\d{5})(\\d{4})","$1 $2","346|4(?:27|9[35])|883","($NP$FG)",],["([3-8]\\d)(\\d{3})(\\d{4})","$1 $2 $3","[3-8]","($NP$FG)",],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","81|9","$NP$FG",],["(1800)(\\d{3})(\\d{4})","$1 $2 $3","1",,],["(1800)(\\d{1,2})(\\d{3})(\\d{4})","$1 $2 $3 $4","1",,]]]',
"236": '["CF","00",,,,,"\\d{8}","[278]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"590": ['["GP","00","0",,,"$NP$FG","\\d{9}","[56]\\d{8}",[["([56]90)(\\d{2})(\\d{4})","$1 $2-$3",,,]]]','["BL","00","0",,,,"\\d{9}","[56]\\d{8}",]','["MF","00","0",,,,"\\d{9}","[56]\\d{8}",]'],
"53": '["CU","119","0",,,"($NP$FG)","\\d{4,8}","[2-57]\\d{5,7}",[["(\\d)(\\d{6,7})","$1 $2","7",,],["(\\d{2})(\\d{4,6})","$1 $2","[2-4]",,],["(\\d)(\\d{7})","$1 $2","5","$NP$FG",]]]',
"64": '["NZ","0(?:0|161)","0",,,"$NP$FG","\\d{7,11}","6[235-9]\\d{6}|[2-57-9]\\d{7,10}",[["([34679])(\\d{3})(\\d{4})","$1-$2 $3","[3467]|9[1-9]",,],["(24099)(\\d{3})","$1 $2","240",,],["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","21",,],["(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3","2(?:1[1-9]|[69]|7[0-35-9])|86",,],["(2\\d)(\\d{3,4})(\\d{4})","$1 $2 $3","2[028]",,],["(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3","2(?:10|74)|5|[89]0",,]]]',
"965": '["KW","00",,,,,"\\d{7,8}","[12569]\\d{6,7}",[["(\\d{4})(\\d{3,4})","$1 $2","[1269]",,],["(5[015]\\d)(\\d{5})","$1 $2","5",,]]]',
"224": '["GN","00",,,,,"\\d{8,9}","[367]\\d{7,8}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","3",,],["(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[67]",,]]]',
"973": '["BH","00",,,,,"\\d{8}","[136-9]\\d{7}",[["(\\d{4})(\\d{4})","$1 $2",,,]]]',
"32": '["BE","00","0",,,"$NP$FG","\\d{8,9}","[1-9]\\d{7,8}",[["(4[6-9]\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","4[6-9]",,],["([2-49])(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4","[23]|[49][23]",,],["([15-8]\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[156]|7[018]|8(?:0[1-9]|[1-79])",,],["([89]\\d{2})(\\d{2})(\\d{3})","$1 $2 $3","(?:80|9)0",,]]]',
"249": '["SD","00","0",,,"$NP$FG","\\d{9}","[19]\\d{8}",[["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3",,,]]]',
"678": '["VU","00",,,,,"\\d{5,7}","[2-57-9]\\d{4,6}",[["(\\d{3})(\\d{4})","$1 $2","[579]",,]]]',
"52": '["MX","0[09]","01","0[12]|04[45](\\d{10})","1$1","$NP $FG","\\d{7,11}","[1-9]\\d{9,10}",[["([358]\\d)(\\d{4})(\\d{4})","$1 $2 $3","33|55|81",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","[2467]|3[12457-9]|5[89]|8[02-9]|9[0-35-9]",,],["(1)([358]\\d)(\\d{4})(\\d{4})","044 $2 $3 $4","1(?:33|55|81)","$FG","$1 $2 $3 $4"],["(1)(\\d{3})(\\d{3})(\\d{4})","044 $2 $3 $4","1(?:[2467]|3[12457-9]|5[89]|8[2-9]|9[1-35-9])","$FG","$1 $2 $3 $4"]]]',
"968": '["OM","00",,,,,"\\d{7,9}","(?:2[2-6]|5|9[1-9])\\d{6}|800\\d{5,6}",[["(2\\d)(\\d{6})","$1 $2","2",,],["(9\\d{3})(\\d{4})","$1 $2","9",,],["([58]00)(\\d{4,6})","$1 $2","[58]",,]]]',
"599": ['["CW","00",,,,,"\\d{7,8}","[169]\\d{6,7}",[["(\\d{3})(\\d{4})","$1 $2","[13-7]",,],["(9)(\\d{3})(\\d{4})","$1 $2 $3","9",,]]]','["BQ","00",,,,,"\\d{7}","[347]\\d{6}",]'],
"800": '["001",,,,,,"\\d{8}","\\d{8}",[["(\\d{4})(\\d{4})","$1 $2",,,]]]',
"386": '["SI","00","0",,,"$NP$FG","\\d{5,8}","[1-7]\\d{6,7}|[89]\\d{4,7}",[["(\\d)(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4","[12]|3[4-8]|4[24-8]|5[2-8]|7[3-8]","($NP$FG)",],["([3-7]\\d)(\\d{3})(\\d{3})","$1 $2 $3","[37][01]|4[019]|51|6",,],["([89][09])(\\d{3,6})","$1 $2","[89][09]",,],["([58]\\d{2})(\\d{5})","$1 $2","59|8[1-3]",,]]]',
"679": '["FJ","0(?:0|52)",,,,,"\\d{7}(?:\\d{4})?","[36-9]\\d{6}|0\\d{10}",[["(\\d{3})(\\d{4})","$1 $2","[36-9]",,],["(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3","0",,]]]',
"238": '["CV","0",,,,,"\\d{7}","[259]\\d{6}",[["(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3",,,]]]',
"691": '["FM","00",,,,,"\\d{7}","[39]\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"262": ['["RE","00","0",,,"$NP$FG","\\d{9}","[268]\\d{8}",[["([268]\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]','["YT","00","0",,,"$NP$FG","\\d{9}","[268]\\d{8}",]'],
"241": '["GA","00",,,,,"\\d{8}","0\\d{7}",[["(0\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"370": '["LT","00","8","[08]",,"($NP-$FG)","\\d{8}","[3-9]\\d{7}",[["([34]\\d)(\\d{6})","$1 $2","37|4(?:1|5[45]|6[2-4])",,],["([3-6]\\d{2})(\\d{5})","$1 $2","3[148]|4(?:[24]|6[09])|528|6",,],["([7-9]\\d{2})(\\d{2})(\\d{3})","$1 $2 $3","[7-9]","$NP $FG",],["(5)(2\\d{2})(\\d{4})","$1 $2 $3","52[0-79]",,]]]',
"256": '["UG","00[057]","0",,,"$NP$FG","\\d{5,9}","\\d{9}",[["(\\d{3})(\\d{6})","$1 $2","[7-9]|20(?:[013-8]|2[5-9])|4(?:6[45]|[7-9])",,],["(\\d{2})(\\d{7})","$1 $2","3|4(?:[1-5]|6[0-36-9])",,],["(2024)(\\d{5})","$1 $2","2024",,]]]',
"677": '["SB","0[01]",,,,,"\\d{5,7}","[1-9]\\d{4,6}",[["(\\d{3})(\\d{4})","$1 $2","[7-9]",,]]]',
"377": '["MC","00","0",,,"$NP$FG","\\d{8,9}","[4689]\\d{7,8}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[89]","$FG",],["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","4",,],["(6)(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5","6",,]]]',
"382": '["ME","00","0",,,"$NP$FG","\\d{6,9}","[2-9]\\d{7,8}",[["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","[2-57-9]|6[3789]",,],["(67)(9)(\\d{3})(\\d{3})","$1 $2 $3 $4","679",,]]]',
"231": '["LR","00","0",,,"$NP$FG","\\d{7,9}","(?:[29]\\d|[4-6]|7\\d{1,2}|[38]\\d{2})\\d{6}",[["([279]\\d)(\\d{3})(\\d{3})","$1 $2 $3","[279]",,],["(7\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","7",,],["([4-6])(\\d{3})(\\d{3})","$1 $2 $3","[4-6]",,],["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","[38]",,]]]',
"591": '["BO","00(1\\d)?","0","0(1\\d)?",,,"\\d{7,8}","[23467]\\d{7}",[["([234])(\\d{7})","$1 $2","[234]",,],["([67]\\d{7})","$1","[67]",,]]]',
"808": '["001",,,,,,"\\d{8}","\\d{8}",[["(\\d{4})(\\d{4})","$1 $2",,,]]]',
"964": '["IQ","00","0",,,"$NP$FG","\\d{6,10}","[1-7]\\d{7,9}",[["(1)(\\d{3})(\\d{4})","$1 $2 $3","1",,],["([2-6]\\d)(\\d{3})(\\d{3,4})","$1 $2 $3","[2-6]",,],["(7\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","7",,]]]',
"225": '["CI","00",,,,,"\\d{8}","[02-6]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"992": '["TJ","810","8",,,"($NP) $FG","\\d{3,9}","[3-59]\\d{8}",[["([349]\\d{2})(\\d{2})(\\d{4})","$1 $2 $3","[34]7|91[78]",,],["([459]\\d)(\\d{3})(\\d{4})","$1 $2 $3","4[48]|5|9(?:1[59]|[0235-9])",,],["(331700)(\\d)(\\d{2})","$1 $2 $3","331",,],["(\\d{4})(\\d)(\\d{4})","$1 $2 $3","3[1-5]",,]]]',
"55": '["BR","00(?:1[45]|2[135]|[34]1|43)","0","(?:0|90)(?:(1[245]|2[135]|[34]1)(\\d{10,11}))?","$2",,"\\d{8,11}","[1-46-9]\\d{7,10}|5\\d{8,9}",[["(\\d{4})(\\d{4})","$1-$2","[2-9](?:[1-9]|0[1-9])","$FG","NA"],["(\\d{5})(\\d{4})","$1-$2","9(?:[1-9]|0[1-9])","$FG","NA"],["(\\d{3,5})","$1","1[125689]","$FG","NA"],["(\\d{2})(\\d{5})(\\d{4})","$1 $2-$3","(?:1[1-9]|2[12478])9","($FG)",],["(\\d{2})(\\d{4})(\\d{4})","$1 $2-$3","[1-9][1-9]","($FG)",],["([34]00\\d)(\\d{4})","$1-$2","[34]00",,],["([3589]00)(\\d{2,3})(\\d{4})","$1 $2 $3","[3589]00","$NP$FG",]]]',
"674": '["NR","00",,,,,"\\d{7}","[458]\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"967": '["YE","00","0",,,"$NP$FG","\\d{6,9}","[1-7]\\d{6,8}",[["([1-7])(\\d{3})(\\d{3,4})","$1 $2 $3","[1-6]|7[24-68]",,],["(7\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","7[0137]",,]]]',
"49": '["DE","00","0",,,"$NP$FG","\\d{2,15}","[1-35-9]\\d{3,14}|4(?:[0-8]\\d{4,12}|9(?:[0-37]\\d|4(?:[1-35-8]|4\\d?)|5\\d{1,2}|6[1-8]\\d?)\\d{2,7})",[["(1\\d{2})(\\d{7,8})","$1 $2","1[67]",,],["(1\\d{3})(\\d{7})","$1 $2","15",,],["(\\d{2})(\\d{3,11})","$1 $2","3[02]|40|[68]9",,],["(\\d{3})(\\d{3,11})","$1 $2","2(?:\\d1|0[2389]|1[24]|28|34)|3(?:[3-9][15]|40)|[4-8][1-9]1|9(?:06|[1-9]1)",,],["(\\d{4})(\\d{2,11})","$1 $2","[24-6]|[7-9](?:\\d[1-9]|[1-9]\\d)|3(?:[3569][02-46-9]|4[2-4679]|7[2-467]|8[2-46-8])",,],["(3\\d{4})(\\d{1,10})","$1 $2","3",,],["(800)(\\d{7,12})","$1 $2","800",,],["(177)(99)(\\d{7,8})","$1 $2 $3","177",,],["(\\d{3})(\\d)(\\d{4,10})","$1 $2 $3","(?:18|90)0",,],["(1\\d{2})(\\d{5,11})","$1 $2","181",,],["(18\\d{3})(\\d{6})","$1 $2","185",,],["(18\\d{2})(\\d{7})","$1 $2","18[68]",,],["(18\\d)(\\d{8})","$1 $2","18[2-579]",,],["(700)(\\d{4})(\\d{4})","$1 $2 $3","700",,]]]',
"31": '["NL","00","0",,,"$NP$FG","\\d{5,10}","1\\d{4,8}|[2-7]\\d{8}|[89]\\d{6,9}",[["([1-578]\\d)(\\d{3})(\\d{4})","$1 $2 $3","1[035]|2[0346]|3[03568]|4[0356]|5[0358]|7|8[4578]",,],["([1-5]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","1[16-8]|2[259]|3[124]|4[17-9]|5[124679]",,],["(6)(\\d{8})","$1 $2","6[0-57-9]",,],["(66)(\\d{7})","$1 $2","66",,],["(14)(\\d{3,4})","$1 $2","14","$FG",],["([89]0\\d)(\\d{4,7})","$1 $2","80|9",,]]]',
"970": '["PS","00","0",,,"$NP$FG","\\d{4,10}","[24589]\\d{7,8}|1(?:[78]\\d{8}|[49]\\d{2,3})",[["([2489])(2\\d{2})(\\d{4})","$1 $2 $3","[2489]",,],["(5[69]\\d)(\\d{3})(\\d{3})","$1 $2 $3","5",,],["(1[78]00)(\\d{3})(\\d{3})","$1 $2 $3","1[78]","$FG",]]]',
"58": '["VE","00","0",,,"$NP$FG","\\d{7,10}","[24589]\\d{9}",[["(\\d{3})(\\d{7})","$1-$2",,,]]]',
"856": '["LA","00","0",,,"$NP$FG","\\d{6,10}","[2-8]\\d{7,9}",[["(20)(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3 $4","20",,],["([2-8]\\d)(\\d{3})(\\d{3})","$1 $2 $3","2[13]|[3-8]",,]]]',
"354": '["IS","00",,,,,"\\d{7,9}","[4-9]\\d{6}|38\\d{7}",[["(\\d{3})(\\d{4})","$1 $2","[4-9]",,],["(3\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","3",,]]]',
"242": '["CG","00",,,,,"\\d{9}","[028]\\d{8}",[["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","[02]",,],["(\\d)(\\d{4})(\\d{4})","$1 $2 $3","8",,]]]',
"423": '["LI","00","0",,,,"\\d{7,9}","6\\d{8}|[23789]\\d{6}",[["(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3","[23]|7[3-57-9]|87",,],["(6\\d)(\\d{3})(\\d{3})","$1 $2 $3","6",,],["(6[567]\\d)(\\d{3})(\\d{3})","$1 $2 $3","6[567]",,],["(69)(7\\d{2})(\\d{4})","$1 $2 $3","697",,],["([7-9]0\\d)(\\d{2})(\\d{2})","$1 $2 $3","[7-9]0",,],["([89]0\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[89]0","$NP$FG",]]]',
"213": '["DZ","00","0",,,"$NP$FG","\\d{8,9}","(?:[1-4]|[5-9]\\d)\\d{7}",[["([1-4]\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[1-4]",,],["([5-8]\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[5-8]",,],["(9\\d)(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4","9",,]]]',
"371": '["LV","00",,,,,"\\d{8}","[2689]\\d{7}",[["([2689]\\d)(\\d{3})(\\d{3})","$1 $2 $3",,,]]]',
"503": '["SV","00",,,,,"\\d{7,8}|\\d{11}","[267]\\d{7}|[89]\\d{6}(?:\\d{4})?",[["(\\d{4})(\\d{4})","$1 $2","[267]",,],["(\\d{3})(\\d{4})","$1 $2","[89]",,],["(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3","[89]",,]]]',
"685": '["WS","0",,,,,"\\d{5,7}","[2-8]\\d{4,6}",[["(8\\d{2})(\\d{3,4})","$1 $2","8",,],["(7\\d)(\\d{5})","$1 $2","7",,]]]',
"880": '["BD","00[12]?","0",,,"$NP$FG","\\d{6,10}","[2-79]\\d{5,9}|1\\d{9}|8[0-7]\\d{4,8}",[["(2)(\\d{7})","$1-$2","2",,],["(\\d{2})(\\d{4,6})","$1-$2","[3-79]1",,],["(\\d{4})(\\d{3,6})","$1-$2","1|3(?:0|[2-58]2)|4(?:0|[25]2|3[23]|[4689][25])|5(?:[02-578]2|6[25])|6(?:[0347-9]2|[26][25])|7[02-9]2|8(?:[023][23]|[4-7]2)|9(?:[02][23]|[458]2|6[016])",,],["(\\d{3})(\\d{3,7})","$1-$2","[3-79][2-9]|8",,]]]',
"265": '["MW","00","0",,,"$NP$FG","\\d{7,9}","(?:1(?:\\d{2})?|[2789]\\d{2})\\d{6}",[["(\\d)(\\d{3})(\\d{3})","$1 $2 $3","1",,],["(2\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","2",,],["(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[1789]",,]]]',
"65": '["SG","0[0-3]\\d",,,,,"\\d{8,11}","[36]\\d{7}|[17-9]\\d{7,10}",[["([3689]\\d{3})(\\d{4})","$1 $2","[369]|8[1-9]",,],["(1[89]00)(\\d{3})(\\d{4})","$1 $2 $3","1[89]",,],["(7000)(\\d{4})(\\d{3})","$1 $2 $3","70",,],["(800)(\\d{3})(\\d{4})","$1 $2 $3","80",,]]]',
"504": '["HN","00",,,,,"\\d{8}","[237-9]\\d{7}",[["(\\d{4})(\\d{4})","$1-$2",,,]]]',
"688": '["TV","00",,,,,"\\d{5,6}","[29]\\d{4,5}",]',
"84": '["VN","00","0",,,"$NP$FG","\\d{7,10}","[17]\\d{6,9}|[2-69]\\d{7,9}|8\\d{6,8}",[["([17]99)(\\d{4})","$1 $2","[17]99",,],["([48])(\\d{4})(\\d{4})","$1 $2 $3","[48]",,],["([235-7]\\d)(\\d{4})(\\d{3})","$1 $2 $3","2[025-79]|3[0136-9]|5[2-9]|6[0-46-8]|7[02-79]",,],["(80)(\\d{5})","$1 $2","80",,],["(69\\d)(\\d{4,5})","$1 $2","69",,],["([235-7]\\d{2})(\\d{4})(\\d{3})","$1 $2 $3","2[1348]|3[25]|5[01]|65|7[18]",,],["(9\\d)(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4","9",,],["(1[2689]\\d)(\\d{3})(\\d{4})","$1 $2 $3","1(?:[26]|8[68]|99)",,],["(1[89]00)(\\d{4,6})","$1 $2","1[89]0","$FG",]]]',
"255": '["TZ","00[056]","0",,,"$NP$FG","\\d{7,9}","\\d{9}",[["([24]\\d)(\\d{3})(\\d{4})","$1 $2 $3","[24]",,],["([67]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","[67]",,],["([89]\\d{2})(\\d{2})(\\d{4})","$1 $2 $3","[89]",,]]]',
"222": '["MR","00",,,,,"\\d{8}","[2-48]\\d{7}",[["([2-48]\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"230": '["MU","0(?:0|[2-7]0|33)",,,,,"\\d{7,8}","[2-9]\\d{6,7}",[["([2-46-9]\\d{2})(\\d{4})","$1 $2","[2-46-9]",,],["(5\\d{3})(\\d{4})","$1 $2","5",,]]]',
"592": '["GY","001",,,,,"\\d{7}","[2-4679]\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"41": '["CH","00","0",,,"$NP$FG","\\d{9}(?:\\d{3})?","[2-9]\\d{8}|860\\d{9}",[["([2-9]\\d)(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4","[2-7]|[89]1",,],["([89]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","8[047]|90",,],["(\\d{3})(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4 $5","860",,]]]',
"39": '["IT","00",,,,,"\\d{6,11}","[01589]\\d{5,10}|3(?:[12457-9]\\d{8}|[36]\\d{7,9})",[["(\\d{2})(\\d{3,4})(\\d{4})","$1 $2 $3","0[26]|55",,],["(0[26])(\\d{4})(\\d{5})","$1 $2 $3","0[26]",,],["(0[26])(\\d{4,6})","$1 $2","0[26]",,],["(0\\d{2})(\\d{3,4})(\\d{4})","$1 $2 $3","0[13-57-9][0159]",,],["(\\d{3})(\\d{3,6})","$1 $2","0[13-57-9][0159]|8(?:03|4[17]|9[245])",,],["(0\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","0[13-57-9][2-46-8]",,],["(0\\d{3})(\\d{2,6})","$1 $2","0[13-57-9][2-46-8]",,],["(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3","[13]|8(?:00|4[08]|9[59])",,],["(\\d{4})(\\d{4})","$1 $2","894",,],["(\\d{3})(\\d{4})(\\d{4})","$1 $2 $3","3",,]]]',
"993": '["TM","810","8",,,"($NP $FG)","\\d{8}","[1-6]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2-$3-$4","12",,],["(\\d{2})(\\d{6})","$1 $2","6","$NP $FG",],["(\\d{3})(\\d)(\\d{2})(\\d{2})","$1 $2-$3-$4","13|[2-5]",,]]]',
"888": '["001",,,,,,"\\d{11}","\\d{11}",[["(\\d{3})(\\d{3})(\\d{5})","$1 $2 $3",,,]]]',
"353": '["IE","00","0",,,"($NP$FG)","\\d{5,10}","[124-9]\\d{6,9}",[["(1)(\\d{3,4})(\\d{4})","$1 $2 $3","1",,],["(\\d{2})(\\d{5})","$1 $2","2[24-9]|47|58|6[237-9]|9[35-9]",,],["(\\d{3})(\\d{5})","$1 $2","40[24]|50[45]",,],["(48)(\\d{4})(\\d{4})","$1 $2 $3","48",,],["(818)(\\d{3})(\\d{3})","$1 $2 $3","81",,],["(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3","[24-69]|7[14]",,],["([78]\\d)(\\d{3,4})(\\d{4})","$1 $2 $3","76|8[35-9]","$NP$FG",],["(700)(\\d{3})(\\d{3})","$1 $2 $3","70","$NP$FG",],["(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3","1(?:8[059]|5)","$FG",]]]',
"966": '["SA","00","0",,,"$NP$FG","\\d{7,10}","1\\d{7,8}|(?:[2-467]|92)\\d{7}|5\\d{8}|8\\d{9}",[["([1-467])(\\d{3})(\\d{4})","$1 $2 $3","[1-467]",,],["(1\\d)(\\d{3})(\\d{4})","$1 $2 $3","1[1-467]",,],["(5\\d)(\\d{3})(\\d{4})","$1 $2 $3","5",,],["(92\\d{2})(\\d{5})","$1 $2","92","$FG",],["(800)(\\d{3})(\\d{4})","$1 $2 $3","80","$FG",],["(811)(\\d{3})(\\d{3,4})","$1 $2 $3","81",,]]]',
"380": '["UA","00","0",,,"$NP$FG","\\d{5,9}","[3-689]\\d{8}",[["([3-689]\\d)(\\d{3})(\\d{4})","$1 $2 $3","[38]9|4(?:[45][0-5]|87)|5(?:0|6[37]|7[37])|6[36-8]|9[1-9]",,],["([3-689]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","3[1-8]2|4[13678]2|5(?:[12457]2|6[24])|6(?:[49]2|[12][29]|5[24])|8[0-8]|90",,],["([3-6]\\d{3})(\\d{5})","$1 $2","3(?:5[013-9]|[1-46-8])|4(?:[137][013-9]|6|[45][6-9]|8[4-6])|5(?:[1245][013-9]|6[0135-9]|3|7[4-6])|6(?:[49][013-9]|5[0135-9]|[12][13-8])",,]]]',
"98": '["IR","00","0",,,"$NP$FG","\\d{4,10}","[14-8]\\d{6,9}|[23]\\d{4,9}|9(?:[1-4]\\d{8}|9\\d{2,8})",[["(2[15])(\\d{3,5})","$1 $2","2(?:1|5[0-47-9])",,],["(2[15])(\\d{3})(\\d{3,4})","$1 $2 $3","2(?:1|5[0-47-9])",,],["(2\\d)(\\d{4})(\\d{4})","$1 $2 $3","2(?:[16]|5[0-47-9])",,],["(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3","[13-9]|2[02-57-9]",,],["(\\d{3})(\\d{2})(\\d{2,3})","$1 $2 $3","[13-9]|2[02-57-9]",,],["(\\d{3})(\\d{3})","$1 $2","[13-9]|2[02-57-9]",,]]]',
"971": '["AE","00","0",,,"$NP$FG","\\d{5,12}","[2-79]\\d{7,8}|800\\d{2,9}",[["([2-4679])(\\d{3})(\\d{4})","$1 $2 $3","[2-4679][2-8]",,],["(5[0256])(\\d{3})(\\d{4})","$1 $2 $3","5",,],["([479]00)(\\d)(\\d{5})","$1 $2 $3","[479]0","$FG",],["([68]00)(\\d{2,9})","$1 $2","60|8","$FG",]]]',
"30": '["GR","00",,,,,"\\d{10}","[26-9]\\d{9}",[["([27]\\d)(\\d{4})(\\d{4})","$1 $2 $3","21|7",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","2[2-9]1|[689]",,],["(2\\d{3})(\\d{6})","$1 $2","2[2-9][02-9]",,]]]',
"228": '["TG","00",,,,,"\\d{8}","[29]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"48": '["PL","00",,,,,"\\d{6,9}","[1-58]\\d{6,8}|9\\d{8}|[67]\\d{5,8}",[["(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4","[124]|3[2-4]|5[24-689]|6[1-3578]|7[14-7]|8[1-79]|9[145]",,],["(\\d{2})(\\d{4,6})","$1 $2","[124]|3[2-4]|5[24-689]|6[1-3578]|7[14-7]|8[1-7]",,],["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3","39|5[013]|6[0469]|7[02389]|8[08]",,],["(\\d{3})(\\d{2})(\\d{2,3})","$1 $2 $3","64",,],["(\\d{3})(\\d{3})","$1 $2","64",,]]]',
"886": '["TW","0(?:0[25679]|19)","0",,,"$NP$FG","\\d{8,9}","[2-9]\\d{7,8}",[["([2-8])(\\d{3,4})(\\d{4})","$1 $2 $3","[2-7]|8[1-9]",,],["([89]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","80|9",,]]]',
"212": ['["MA","00","0",,,"$NP$FG","\\d{9}","[5689]\\d{8}",[["([56]\\d{2})(\\d{6})","$1-$2","5(?:2[015-7]|3[0-4])|6",,],["([58]\\d{3})(\\d{5})","$1-$2","5(?:2[2-489]|3[5-9])|892",,],["(5\\d{4})(\\d{4})","$1-$2","5(?:29|38)",,],["(8[09])(\\d{7})","$1-$2","8(?:0|9[013-9])",,]]]','["EH","00","0",,,"$NP$FG","\\d{9}","[5689]\\d{8}",]'],
"372": '["EE","00",,,,,"\\d{4,10}","1\\d{3,4}|[3-9]\\d{6,7}|800\\d{6,7}",[["([3-79]\\d{2})(\\d{4})","$1 $2","[369]|4[3-8]|5(?:[0-2]|5[0-478]|6[45])|7[1-9]",,],["(70)(\\d{2})(\\d{4})","$1 $2 $3","70",,],["(8000)(\\d{3})(\\d{3})","$1 $2 $3","800",,],["([458]\\d{3})(\\d{3,4})","$1 $2","40|5|8(?:00|[1-5])",,]]]',
"598": '["UY","0(?:1[3-9]\\d|0)","0",,,,"\\d{7,8}","[2489]\\d{6,7}",[["(\\d{4})(\\d{4})","$1 $2","[24]",,],["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","9[1-9]","$NP$FG",],["(\\d{3})(\\d{4})","$1 $2","[89]0","$NP$FG",]]]',
"502": '["GT","00",,,,,"\\d{8}(?:\\d{3})?","[2-7]\\d{7}|1[89]\\d{9}",[["(\\d{4})(\\d{4})","$1 $2","[2-7]",,],["(\\d{4})(\\d{3})(\\d{4})","$1 $2 $3","1",,]]]',
"82": '["KR","00(?:[124-68]|[37]\\d{2})","0","0(8[1-46-8]|85\\d{2})?",,"$NP$FG","\\d{4,10}","[1-7]\\d{3,9}|8\\d{8}",[["(\\d{2})(\\d{4})(\\d{4})","$1-$2-$3","1(?:0|1[19]|[69]9|5[458])|[57]0",,],["(\\d{2})(\\d{3,4})(\\d{4})","$1-$2-$3","1(?:[169][2-8]|[78]|5[1-4])|[68]0|[3-6][1-9][1-9]",,],["(\\d{3})(\\d)(\\d{4})","$1-$2-$3","131",,],["(\\d{3})(\\d{2})(\\d{4})","$1-$2-$3","131",,],["(\\d{3})(\\d{3})(\\d{4})","$1-$2-$3","13[2-9]",,],["(\\d{2})(\\d{2})(\\d{3})(\\d{4})","$1-$2-$3-$4","30",,],["(\\d)(\\d{3,4})(\\d{4})","$1-$2-$3","2[1-9]",,],["(\\d)(\\d{3,4})","$1-$2","21[0-46-9]",,],["(\\d{2})(\\d{3,4})","$1-$2","[3-6][1-9]1",,],["(\\d{4})(\\d{4})","$1-$2","1(?:5[46-9]|6[04678])","$FG",]]]',
"253": '["DJ","00",,,,,"\\d{8}","[27]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"91": '["IN","00","0",,,"$NP$FG","\\d{6,13}","1\\d{7,12}|[2-9]\\d{9,10}",[["(\\d{2})(\\d{2})(\\d{6})","$1 $2 $3","7(?:2[0579]|3[057-9]|4[0-389]|5[024-9]|6[0-35-9]|7|8[0-79])|8(?:0[015689]|1[0-57-9]|2[2356-9]|3[0-57-9]|[45]|6[0245789]|7[1-69]|8[0124-9]|9[02-9])|9",,],["(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3","11|2[02]|33|4[04]|79|80[2-46]",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","1(?:2[0-249]|3[0-25]|4[145]|[569][14]|7[1257]|8[1346]|[68][1-9])|2(?:1[257]|3[013]|4[01]|5[0137]|6[0158]|78|8[1568]|9[14])|3(?:26|4[1-3]|5[34]|6[01489]|7[02-46]|8[159])|4(?:1[36]|2[1-47]|3[15]|5[12]|6[126-9]|7[0-24-9]|8[013-57]|9[014-7])|5(?:[136][25]|22|4[28]|5[12]|[78]1|9[15])|6(?:12|[2345]1|57|6[13]|7[14]|80)",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","7(?:12|2[14]|3[134]|4[47]|5[15]|[67]1|88)",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","8(?:16|2[014]|3[126]|6[136]|7[078]|8[34]|91)",,],["(\\d{4})(\\d{3})(\\d{3})","$1 $2 $3","1(?:[2-579]|[68][1-9])|[2-8]",,],["(1600)(\\d{2})(\\d{4})","$1 $2 $3","160","$FG",],["(1800)(\\d{4,5})","$1 $2","180","$FG",],["(18[06]0)(\\d{2,4})(\\d{4})","$1 $2 $3","18[06]","$FG",],["(\\d{4})(\\d{3})(\\d{4})(\\d{2})","$1 $2 $3 $4","18[06]","$FG",]]]',
"389": '["MK","00","0",,,"$NP$FG","\\d{8}","[2-578]\\d{7}",[["(2)(\\d{3})(\\d{4})","$1 $2 $3","2",,],["([347]\\d)(\\d{3})(\\d{3})","$1 $2 $3","[347]",,],["([58]\\d{2})(\\d)(\\d{2})(\\d{2})","$1 $2 $3 $4","[58]",,]]]',
"1": ['["US","011","1",,,,"\\d{7}(?:\\d{3})?","[2-9]\\d{9}",[["(\\d{3})(\\d{4})","$1-$2",,,"NA"],["(\\d{3})(\\d{3})(\\d{4})","($1) $2-$3",,,"$1-$2-$3"]]]','["AI","011","1",,,,"\\d{7}(?:\\d{3})?","[2589]\\d{9}",]','["AS","011","1",,,,"\\d{7}(?:\\d{3})?","[5689]\\d{9}",]','["BB","011","1",,,,"\\d{7}(?:\\d{3})?","[2589]\\d{9}",]','["BM","011","1",,,,"\\d{7}(?:\\d{3})?","[4589]\\d{9}",]','["BS","011","1",,,,"\\d{7}(?:\\d{3})?","[2589]\\d{9}",]','["CA","011","1",,,,"\\d{7}(?:\\d{3})?","[2-9]\\d{9}|3\\d{6}",]','["DM","011","1",,,,"\\d{7}(?:\\d{3})?","[57-9]\\d{9}",]','["DO","011","1",,,,"\\d{7}(?:\\d{3})?","[589]\\d{9}",]','["GD","011","1",,,,"\\d{7}(?:\\d{3})?","[4589]\\d{9}",]','["GU","011","1",,,,"\\d{7}(?:\\d{3})?","[5689]\\d{9}",]','["JM","011","1",,,,"\\d{7}(?:\\d{3})?","[589]\\d{9}",]','["KN","011","1",,,,"\\d{7}(?:\\d{3})?","[589]\\d{9}",]','["KY","011","1",,,,"\\d{7}(?:\\d{3})?","[3589]\\d{9}",]','["LC","011","1",,,,"\\d{7}(?:\\d{3})?","[5789]\\d{9}",]','["MP","011","1",,,,"\\d{7}(?:\\d{3})?","[5689]\\d{9}",]','["MS","011","1",,,,"\\d{7}(?:\\d{3})?","[5689]\\d{9}",]','["PR","011","1",,,,"\\d{7}(?:\\d{3})?","[5789]\\d{9}",]','["SX","011","1",,,,"\\d{7}(?:\\d{3})?","[5789]\\d{9}",]','["TC","011","1",,,,"\\d{7}(?:\\d{3})?","[5689]\\d{9}",]','["TT","011","1",,,,"\\d{7}(?:\\d{3})?","[589]\\d{9}",]','["AG","011","1",,,,"\\d{7}(?:\\d{3})?","[2589]\\d{9}",]','["VC","011","1",,,,"\\d{7}(?:\\d{3})?","[5789]\\d{9}",]','["VG","011","1",,,,"\\d{7}(?:\\d{3})?","[2589]\\d{9}",]','["VI","011","1",,,,"\\d{7}(?:\\d{3})?","[3589]\\d{9}",]'],
"60": '["MY","00","0",,,,"\\d{6,10}","[13-9]\\d{7,9}",[["([4-79])(\\d{3})(\\d{4})","$1-$2 $3","[4-79]","$NP$FG",],["(3)(\\d{4})(\\d{4})","$1-$2 $3","3","$NP$FG",],["([18]\\d)(\\d{3})(\\d{3,4})","$1-$2 $3","1[02-46-9][1-9]|8","$NP$FG",],["(1)([36-8]00)(\\d{2})(\\d{4})","$1-$2-$3-$4","1[36-8]0",,],["(11)(\\d{4})(\\d{4})","$1-$2 $3","11","$NP$FG",],["(15[49])(\\d{3})(\\d{4})","$1-$2 $3","15","$NP$FG",]]]',
"355": '["AL","00","0",,,"$NP$FG","\\d{5,9}","[2-57]\\d{7}|6\\d{8}|8\\d{5,7}|9\\d{5}",[["(4)(\\d{3})(\\d{4})","$1 $2 $3","4[0-6]",,],["(6[6-9])(\\d{3})(\\d{4})","$1 $2 $3","6",,],["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","[2358][2-5]|4[7-9]",,],["(\\d{3})(\\d{3,5})","$1 $2","[235][16-9]|8[016-9]|[79]",,]]]',
"254": '["KE","000","0",,,"$NP$FG","\\d{5,10}","20\\d{6,7}|[4-9]\\d{6,9}",[["(\\d{2})(\\d{4,7})","$1 $2","[24-6]",,],["(\\d{3})(\\d{6,7})","$1 $2","7",,],["(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3","[89]",,]]]',
"223": '["ML","00",,,,,"\\d{8}","[246-9]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[246-9]",,],["(\\d{4})","$1","67|74",,"NA"]]]',
"686": '["KI","00",,"0",,,"\\d{5}","[2-689]\\d{4}",]',
"994": '["AZ","00","0",,,"($NP$FG)","\\d{7,9}","[1-9]\\d{8}",[["(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4","(?:1[28]|2(?:[45]2|[0-36])|365)",,],["(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4","[4-8]","$NP$FG",],["(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","9","$NP$FG",]]]',
"979": '["001",,,,,,"\\d{9}","\\d{9}",[["(\\d)(\\d{4})(\\d{4})","$1 $2 $3",,,]]]',
"66": '["TH","00","0",,,"$NP$FG","\\d{4}|\\d{8,10}","[2-9]\\d{7,8}|1\\d{3}(?:\\d{6})?",[["(2)(\\d{3})(\\d{4})","$1 $2 $3","2",,],["([3-9]\\d)(\\d{3})(\\d{3,4})","$1 $2 $3","[3-9]",,],["(1[89]00)(\\d{3})(\\d{3})","$1 $2 $3","1","$FG",]]]',
"233": '["GH","00","0",,,"$NP$FG","\\d{7,9}","[235]\\d{8}|8\\d{7}",[["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","[235]",,],["(\\d{3})(\\d{5})","$1 $2","8",,]]]',
"593": '["EC","00","0",,,"($NP$FG)","\\d{7,11}","1\\d{9,10}|[2-8]\\d{7}|9\\d{8}",[["(\\d)(\\d{3})(\\d{4})","$1 $2-$3","[247]|[356][2-8]",,"$1-$2-$3"],["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","9","$NP$FG",],["(1800)(\\d{3})(\\d{3,4})","$1 $2 $3","1","$FG",]]]',
"509": '["HT","00",,,,,"\\d{8}","[2-489]\\d{7}",[["(\\d{2})(\\d{2})(\\d{4})","$1 $2 $3",,,]]]',
"54": '["AR","00","0","0?(?:(11|2(?:2(?:02?|[13]|2[13-79]|4[1-6]|5[2457]|6[124-8]|7[1-4]|8[13-6]|9[1267])|3(?:02?|1[467]|2[03-6]|3[13-8]|[49][2-6]|5[2-8]|[67])|4(?:7[3-578]|9)|6(?:[0136]|2[24-6]|4[6-8]?|5[15-8])|80|9(?:0[1-3]|[19]|2\\d|3[1-6]|4[02568]?|5[2-4]|6[2-46]|72?|8[23]?))|3(?:3(?:2[79]|6|8[2578])|4(?:0[124-9]|[12]|3[5-8]?|4[24-7]|5[4-68]?|6[02-9]|7[126]|8[2379]?|9[1-36-8])|5(?:1|2[1245]|3[237]?|4[1-46-9]|6[2-4]|7[1-6]|8[2-5]?)|6[24]|7(?:1[1568]|2[15]|3[145]|4[13]|5[14-8]|[069]|7[2-57]|8[126])|8(?:[01]|2[15-7]|3[2578]?|4[13-6]|5[4-8]?|6[1-357-9]|7[36-8]?|8[5-8]?|9[124])))15)?","9$1","$NP$FG","\\d{6,11}","[1-368]\\d{9}|9\\d{10}",[["([68]\\d{2})(\\d{3})(\\d{4})","$1-$2-$3","[68]",,],["(9)(11)(\\d{4})(\\d{4})","$2 15-$3-$4","911",,"$1 $2 $3-$4"],["(9)(\\d{3})(\\d{3})(\\d{4})","$2 15-$3-$4","9(?:2[234689]|3[3-8])",,"$1 $2 $3-$4"],["(9)(\\d{4})(\\d{3})(\\d{3})","$2 15-$3-$4","93[58]",,"$1 $2 $3-$4"],["(9)(\\d{4})(\\d{2})(\\d{4})","$2 15-$3-$4","9[23]",,"$1 $2 $3-$4"],["(11)(\\d{4})(\\d{4})","$1 $2-$3","1",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2-$3","2(?:2[013]|3[067]|49|6[01346]|80|9[147-9])|3(?:36|4[12358]|5[138]|6[24]|7[069]|8[013578])",,],["(\\d{4})(\\d{3})(\\d{3})","$1 $2-$3","3(?:53|8[78])",,],["(\\d{4})(\\d{2})(\\d{4})","$1 $2-$3","[23]",,],["(\\d{3})","$1","1[012]|911","$FG","NA"]]]',
"57": '["CO","00(?:4(?:[14]4|56)|[579])","0","0([3579]|4(?:44|56))?",,,"\\d{7,11}","(?:[13]\\d{0,3}|[24-8])\\d{7}",[["(\\d)(\\d{7})","$1 $2","1(?:8[2-9]|9[0-3]|[2-7])|[24-8]","($FG)",],["(\\d{3})(\\d{7})","$1 $2","3",,],["(1)(\\d{3})(\\d{7})","$1-$2-$3","1(?:80|9[04])","$NP$FG","$1 $2 $3"]]]',
"597": '["SR","00",,,,,"\\d{6,7}","[2-8]\\d{5,6}",[["(\\d{3})(\\d{3})","$1-$2","[2-4]|5[2-58]",,],["(\\d{2})(\\d{2})(\\d{2})","$1-$2-$3","56",,],["(\\d{3})(\\d{4})","$1-$2","[6-8]",,]]]',
"676": '["TO","00",,,,,"\\d{5,7}","[02-8]\\d{4,6}",[["(\\d{2})(\\d{3})","$1-$2","[1-6]|7[0-4]|8[05]",,],["(\\d{3})(\\d{4})","$1 $2","7[5-9]|8[7-9]",,],["(\\d{4})(\\d{3})","$1 $2","0",,]]]',
"505": '["NI","00",,,,,"\\d{8}","[1258]\\d{7}",[["(\\d{4})(\\d{4})","$1 $2",,,]]]',
"850": '["KP","00|99","0",,,"$NP$FG","\\d{6,8}|\\d{10}","1\\d{9}|[28]\\d{7}",[["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","1",,],["(\\d)(\\d{3})(\\d{4})","$1 $2 $3","2",,],["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","8",,]]]',
"7": ['["RU","810","8",,,"$NP ($FG)","\\d{10}","[3489]\\d{9}",[["(\\d{3})(\\d{2})(\\d{2})","$1-$2-$3","[1-79]","$FG","NA"],["([3489]\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2-$3-$4","[34689]",,],["(7\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","7",,]]]','["KZ","810","8",,,,"\\d{10}","(?:33\\d|7\\d{2}|80[09])\\d{7}",]'],
"268": '["SZ","00",,,,,"\\d{8}","[027]\\d{7}",[["(\\d{4})(\\d{4})","$1 $2","[027]",,]]]',
"501": '["BZ","00",,,,,"\\d{7}(?:\\d{4})?","[2-8]\\d{6}|0\\d{10}",[["(\\d{3})(\\d{4})","$1-$2","[2-8]",,],["(0)(800)(\\d{4})(\\d{3})","$1-$2-$3-$4","0",,]]]',
"252": '["SO","00","0",,,,"\\d{7,9}","[1-79]\\d{6,8}",[["(\\d)(\\d{6})","$1 $2","2[0-79]|[13-5]",,],["(\\d)(\\d{7})","$1 $2","24|[67]",,],["(\\d{2})(\\d{5,7})","$1 $2","15|28|6[1378]|9",,],["(69\\d)(\\d{6})","$1 $2","69",,]]]',
"229": '["BJ","00",,,,,"\\d{4,8}","[2689]\\d{7}|7\\d{3}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"680": '["PW","01[12]",,,,,"\\d{7}","[2-8]\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"263": '["ZW","00","0",,,"$NP$FG","\\d{3,10}","2(?:[012457-9]\\d{3,8}|6\\d{3,6})|[13-79]\\d{4,8}|8[06]\\d{8}",[["([49])(\\d{3})(\\d{2,5})","$1 $2 $3","4|9[2-9]",,],["([179]\\d)(\\d{3})(\\d{3,4})","$1 $2 $3","[19]1|7",,],["(86\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","86[24]",,],["([2356]\\d{2})(\\d{3,5})","$1 $2","2(?:[278]|0[45]|[49]8)|3(?:08|17|3[78]|[78])|5[15][78]|6(?:[29]8|37|[68][78])",,],["(\\d{3})(\\d{3})(\\d{3,4})","$1 $2 $3","2(?:[278]|0[45]|48)|3(?:08|17|3[78]|[78])|5[15][78]|6(?:[29]8|37|[68][78])|80",,],["([1-356]\\d)(\\d{3,5})","$1 $2","1[3-9]|2(?:[1-469]|0[0-35-9]|[45][0-79])|3(?:0[0-79]|1[0-689]|[24-69]|3[0-69])|5(?:[02-46-9]|[15][0-69])|6(?:[0145]|[29][0-79]|3[0-689]|[68][0-69])",,],["([1-356]\\d)(\\d{3})(\\d{3})","$1 $2 $3","1[3-9]|2(?:[1-469]|0[0-35-9]|[45][0-79])|3(?:0[0-79]|1[0-689]|[24-69]|3[0-69])|5(?:[02-46-9]|[15][0-69])|6(?:[0145]|[29][0-79]|3[0-689]|[68][0-69])",,],["([25]\\d{3})(\\d{3,5})","$1 $2","(?:25|54)8",,],["([25]\\d{3})(\\d{3})(\\d{3})","$1 $2 $3","(?:25|54)8",,],["(8\\d{3})(\\d{6})","$1 $2","86",,]]]',
"90": '["TR","00","0",,,,"\\d{7,10}","[2-589]\\d{9}|444\\d{4}",[["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","[23]|4(?:[0-35-9]|4[0-35-9])","($NP$FG)",],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","[589]","$NP$FG",],["(444)(\\d{1})(\\d{3})","$1 $2 $3","444",,]]]',
"352": '["LU","00",,"(15(?:0[06]|1[12]|35|4[04]|55|6[26]|77|88|99)\\d)",,,"\\d{4,11}","[24-9]\\d{3,10}|3(?:[0-46-9]\\d{2,9}|5[013-9]\\d{1,8})",[["(\\d{2})(\\d{3})","$1 $2","[2-5]|7[1-9]|[89](?:[1-9]|0[2-9])",,],["(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3","[2-5]|7[1-9]|[89](?:[1-9]|0[2-9])",,],["(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3","20",,],["(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})","$1 $2 $3 $4","2(?:[0367]|4[3-8])",,],["(\\d{2})(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3 $4","20",,],["(\\d{2})(\\d{2})(\\d{2})(\\d{2})(\\d{1,2})","$1 $2 $3 $4 $5","2(?:[0367]|4[3-8])",,],["(\\d{2})(\\d{2})(\\d{2})(\\d{1,4})","$1 $2 $3 $4","2(?:[12589]|4[12])|[3-5]|7[1-9]|[89](?:[1-9]|0[2-9])",,],["(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3","[89]0[01]|70",,],["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3","6",,]]]',
"47": ['["NO","00",,,,,"\\d{5}(?:\\d{3})?","0\\d{4}|[2-9]\\d{7}",[["([489]\\d{2})(\\d{2})(\\d{3})","$1 $2 $3","[489]",,],["([235-7]\\d)(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[235-7]",,]]]','["SJ","00",,,,,"\\d{5}(?:\\d{3})?","0\\d{4}|[4789]\\d{7}",]'],
"243": '["CD","00","0",,,"$NP$FG","\\d{7,9}","[2-6]\\d{6}|[18]\\d{6,8}|9\\d{8}",[["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","12",,],["([89]\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","8[0-2459]|9",,],["(\\d{2})(\\d{2})(\\d{3})","$1 $2 $3","88",,],["(\\d{2})(\\d{5})","$1 $2","[1-6]",,]]]',
"220": '["GM","00",,,,,"\\d{7}","[2-9]\\d{6}",[["(\\d{3})(\\d{4})","$1 $2",,,]]]',
"687": '["NC","00",,,,,"\\d{6}","[2-57-9]\\d{5}",[["(\\d{2})(\\d{2})(\\d{2})","$1.$2.$3","[2-46-9]|5[0-4]",,]]]',
"995": '["GE","00","0",,,,"\\d{6,9}","[34578]\\d{8}",[["(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[348]","$NP$FG",],["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3","7","$NP$FG",],["(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","5","$FG",]]]',
"961": '["LB","00","0",,,,"\\d{7,8}","[13-9]\\d{6,7}",[["(\\d)(\\d{3})(\\d{3})","$1 $2 $3","[13-6]|7(?:[2-579]|62|8[0-7])|[89][2-9]","$NP$FG",],["([7-9]\\d)(\\d{3})(\\d{3})","$1 $2 $3","[89][01]|7(?:[01]|6[013-9]|8[89]|91)",,]]]',
"40": '["RO","00","0",,,"$NP$FG","\\d{6,9}","2\\d{5,8}|[37-9]\\d{8}",[["([237]\\d)(\\d{3})(\\d{4})","$1 $2 $3","[23]1",,],["(21)(\\d{4})","$1 $2","21",,],["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3","[23][3-7]|[7-9]",,],["(2\\d{2})(\\d{3})","$1 $2","2[3-6]",,]]]',
"232": '["SL","00","0",,,"($NP$FG)","\\d{6,8}","[2-578]\\d{7}",[["(\\d{2})(\\d{6})","$1 $2",,,]]]',
"594": '["GF","00","0",,,"$NP$FG","\\d{9}","[56]\\d{8}",[["(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"976": '["MN","001","0",,,"$NP$FG","\\d{6,10}","[12]\\d{7,9}|[57-9]\\d{7}",[["([12]\\d)(\\d{2})(\\d{4})","$1 $2 $3","[12]1",,],["([12]2\\d)(\\d{5,6})","$1 $2","[12]2[1-3]",,],["([12]\\d{3})(\\d{5})","$1 $2","[12](?:27|[3-5])",,],["(\\d{4})(\\d{4})","$1 $2","[57-9]","$FG",],["([12]\\d{4})(\\d{4,5})","$1 $2","[12](?:27|[3-5])",,]]]',
"20": '["EG","00","0",,,"$NP$FG","\\d{5,10}","1\\d{4,9}|[2456]\\d{8}|3\\d{7}|[89]\\d{8,9}",[["(\\d)(\\d{7,8})","$1 $2","[23]",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","1[012]|[89]00",,],["(\\d{2})(\\d{6,7})","$1 $2","1(?:3|5[23])|[4-6]|[89][2-9]",,]]]',
"689": '["PF","00",,,,,"\\d{6}(?:\\d{2})?","[2-79]\\d{5}|8\\d{5,7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","89",,],["(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",,,]]]',
"56": '["CL","(?:0|1(?:1[0-69]|2[0-57]|5[13-58]|69|7[0167]|8[018]))0","0","0|(1(?:1[0-69]|2[0-57]|5[13-58]|69|7[0167]|8[018]))",,"$NP$FG","\\d{6,11}","(?:[2-9]|600|123)\\d{7,8}",[["(2)(\\d{3,4})(\\d{4})","$1 $2 $3","2","($FG)",],["(\\d{2})(\\d{2,3})(\\d{4})","$1 $2 $3","[357]|4[1-35]|6[13-57]","($FG)",],["(9)([5-9]\\d{3})(\\d{4})","$1 $2 $3","9",,],["(44)(\\d{3})(\\d{4})","$1 $2 $3","44",,],["([68]00)(\\d{3})(\\d{3,4})","$1 $2 $3","60|8","$FG",],["(600)(\\d{3})(\\d{2})(\\d{3})","$1 $2 $3 $4","60","$FG",],["(1230)(\\d{3})(\\d{4})","$1 $2 $3","1","$FG",],["(\\d{4,5})","$1","[1-9]","$FG","NA"]]]',
"596": '["MQ","00","0",,,"$NP$FG","\\d{9}","[56]\\d{8}",[["(\\d{3})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"508": '["PM","00","0",,,"$NP$FG","\\d{6}","[45]\\d{5}",[["([45]\\d)(\\d{2})(\\d{2})","$1 $2 $3",,,]]]',
"269": '["KM","00",,,,,"\\d{7}","[379]\\d{6}",[["(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3",,,]]]',
"358": ['["FI","00|99[049]","0",,,"$NP$FG","\\d{5,12}","1\\d{4,11}|[2-9]\\d{4,10}",[["(\\d{3})(\\d{3,7})","$1 $2","(?:[1-3]00|[6-8]0)",,],["(\\d{2})(\\d{4,10})","$1 $2","[14]|2[09]|50|7[135]",,],["(\\d)(\\d{4,11})","$1 $2","[25689][1-8]|3",,]]]','["AX","00|99[049]","0",,,"$NP$FG","\\d{5,12}","[135]\\d{5,9}|[27]\\d{4,9}|4\\d{5,10}|6\\d{7,8}|8\\d{6,9}",]'],
"251": '["ET","00","0",,,"$NP$FG","\\d{7,9}","[1-59]\\d{8}",[["([1-59]\\d)(\\d{3})(\\d{4})","$1 $2 $3",,,]]]',
"681": '["WF","00",,,,,"\\d{6}","[5-7]\\d{5}",[["(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3",,,]]]',
"853": '["MO","00",,,,,"\\d{8}","[268]\\d{7}",[["([268]\\d{3})(\\d{4})","$1 $2",,,]]]',
"44": ['["GB","00","0",,,"$NP$FG","\\d{4,10}","\\d{7,10}",[["(\\d{2})(\\d{4})(\\d{4})","$1 $2 $3","2|5[56]|7(?:0|6[013-9])",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","1(?:1|\\d1)|3|9[018]",,],["(\\d{5})(\\d{4,5})","$1 $2","1(?:38|5[23]|69|76|94)",,],["(1\\d{3})(\\d{5,6})","$1 $2","1",,],["(7\\d{3})(\\d{6})","$1 $2","7(?:[1-5789]|62)",,],["(800)(\\d{4})","$1 $2","800",,],["(845)(46)(4\\d)","$1 $2 $3","845",,],["(8\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","8(?:4[2-5]|7[0-3])",,],["(80\\d)(\\d{3})(\\d{4})","$1 $2 $3","80",,],["([58]00)(\\d{6})","$1 $2","[58]00",,]]]','["GG","00","0",,,"$NP$FG","\\d{6,10}","[135789]\\d{6,9}",]','["IM","00","0",,,"$NP$FG","\\d{6,10}","[135789]\\d{6,9}",]','["JE","00","0",,,"$NP$FG","\\d{6,10}","[135789]\\d{6,9}",]'],
"244": '["AO","00",,,,,"\\d{9}","[29]\\d{8}",[["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",,,]]]',
"211": '["SS","00","0",,,,"\\d{9}","[19]\\d{8}",[["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3",,"$NP$FG",]]]',
"373": '["MD","00","0",,,"$NP$FG","\\d{8}","[235-9]\\d{7}",[["(\\d{2})(\\d{3})(\\d{3})","$1 $2 $3","22|3",,],["([25-7]\\d{2})(\\d{2})(\\d{3})","$1 $2 $3","2[13-79]|[5-7]",,],["([89]\\d{2})(\\d{5})","$1 $2","[89]",,]]]',
"996": '["KG","00","0",,,"$NP$FG","\\d{5,10}","[35-8]\\d{8,9}",[["(\\d{3})(\\d{3})(\\d{3})","$1 $2 $3","31[25]|[5-7]",,],["(\\d{4})(\\d{5})","$1 $2","3(?:1[36]|[2-9])",,],["(\\d{3})(\\d{3})(\\d)(\\d{3})","$1 $2 $3 $4","8",,]]]',
"93": '["AF","00","0",,,"$NP$FG","\\d{7,9}","[2-7]\\d{8}",[["([2-7]\\d)(\\d{3})(\\d{4})","$1 $2 $3",,,]]]',
"260": '["ZM","00","0",,,"$NP$FG","\\d{9}","[289]\\d{8}",[["([29]\\d)(\\d{7})","$1 $2","[29]",,],["(800)(\\d{3})(\\d{3})","$1 $2 $3","8",,]]]',
"378": '["SM","00",,"(?:0549)?([89]\\d{5})","0549$1",,"\\d{6,10}","[05-7]\\d{7,9}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4","[5-7]",,],["(0549)(\\d{6})","$1 $2","0",,"($1) $2"],["(\\d{6})","0549 $1","[89]",,"(0549) $1"]]]',
"235": '["TD","00|16",,,,,"\\d{8}","[2679]\\d{7}",[["(\\d{2})(\\d{2})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"960": '["MV","0(?:0|19)",,,,,"\\d{7,10}","[3467]\\d{6}|9(?:00\\d{7}|\\d{6})",[["(\\d{3})(\\d{4})","$1-$2","[3467]|9(?:[1-9]|0[1-9])",,],["(\\d{3})(\\d{3})(\\d{4})","$1 $2 $3","900",,]]]',
"221": '["SN","00",,,,,"\\d{9}","[37]\\d{8}",[["(\\d{2})(\\d{3})(\\d{2})(\\d{2})","$1 $2 $3 $4",,,]]]',
"595": '["PY","00","0",,,,"\\d{5,9}","5[0-5]\\d{4,7}|[2-46-9]\\d{5,8}",[["(\\d{2})(\\d{5,7})","$1 $2","(?:[26]1|3[289]|4[124678]|7[123]|8[1236])","($FG)",],["(\\d{3})(\\d{3,6})","$1 $2","[2-9]0","$NP$FG",],["(\\d{3})(\\d{6})","$1 $2","9[1-9]","$NP$FG",],["(\\d{2})(\\d{3})(\\d{4})","$1 $2 $3","8700",,],["(\\d{3})(\\d{4,6})","$1 $2","[2-8][1-9]","($FG)",]]]',
"977": '["NP","00","0",,,"$NP$FG","\\d{6,10}","[1-8]\\d{7}|9(?:[1-69]\\d{6}|7[2-6]\\d{5,7}|8\\d{8})",[["(1)(\\d{7})","$1-$2","1[2-6]",,],["(\\d{2})(\\d{6})","$1-$2","1[01]|[2-8]|9(?:[1-69]|7[15-9])",,],["(9\\d{2})(\\d{7})","$1-$2","9(?:7[45]|8)",,]]]',
"36": '["HU","00","06",,,"($FG)","\\d{6,9}","[1-9]\\d{7,8}",[["(1)(\\d{3})(\\d{4})","$1 $2 $3","1",,],["(\\d{2})(\\d{3})(\\d{3,4})","$1 $2 $3","[2-9]",,]]]',
};

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

var PhoneNumberNormalizer = (function() {
  var UNICODE_DIGITS = /[\uFF10-\uFF19\u0660-\u0669\u06F0-\u06F9]/g;
  var VALID_ALPHA_PATTERN = /[a-zA-Z]/g;
  var LEADING_PLUS_CHARS_PATTERN = /^[+\uFF0B]+/g;
  var NON_DIALABLE_CHARS = /[^,#+\*\d]/g;

  // Map letters to numbers according to the ITU E.161 standard
  var E161 = {
    'a': 2, 'b': 2, 'c': 2,
    'd': 3, 'e': 3, 'f': 3,
    'g': 4, 'h': 4, 'i': 4,
    'j': 5, 'k': 5, 'l': 5,
    'm': 6, 'n': 6, 'o': 6,
    'p': 7, 'q': 7, 'r': 7, 's': 7,
    't': 8, 'u': 8, 'v': 8,
    'w': 9, 'x': 9, 'y': 9, 'z': 9
  };

  // Normalize a number by converting unicode numbers and symbols to their
  // ASCII equivalents and removing all non-dialable characters.
  function NormalizeNumber(number, numbersOnly) {
    if (typeof number !== 'string') {
      return '';
    }

    number = number.replace(UNICODE_DIGITS,
                            function (ch) {
                              return String.fromCharCode(48 + (ch.charCodeAt(0) & 0xf));
                            });
    if (!numbersOnly) {
      number = number.replace(VALID_ALPHA_PATTERN,
                              function (ch) {
                                return String(E161[ch.toLowerCase()] || 0);
                              });
    }
    number = number.replace(LEADING_PLUS_CHARS_PATTERN, "+");
    number = number.replace(NON_DIALABLE_CHARS, "");
    return number;
  };


  return {
    Normalize: NormalizeNumber
  };
})();

/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

var PhoneNumber = (function (dataBase) {
  // Use strict in our context only - users might not want it
  'use strict';

  var MAX_PHONE_NUMBER_LENGTH = 50;
  var NON_ALPHA_CHARS = /[^a-zA-Z]/g;
  var NON_DIALABLE_CHARS = /[^,#+\*\d]/g;
  var NON_DIALABLE_CHARS_ONCE = new RegExp(NON_DIALABLE_CHARS.source);
  var BACKSLASH = /\\/g;
  var SPLIT_FIRST_GROUP = /^(\d+)(.*)$/;
  var LEADING_PLUS_CHARS_PATTERN = /^[+\uFF0B]+/g;

  // Format of the string encoded meta data. If the name contains "^" or "$"
  // we will generate a regular expression from the value, with those special
  // characters as prefix/suffix.
  var META_DATA_ENCODING = ["region",
                              "^(?:internationalPrefix)",
                              "nationalPrefix",
                              "^(?:nationalPrefixForParsing)",
                              "nationalPrefixTransformRule",
                              "nationalPrefixFormattingRule",
                              "^possiblePattern$",
                              "^nationalPattern$",
                              "formats"];

  var FORMAT_ENCODING = ["^pattern$",
                           "nationalFormat",
                           "^leadingDigits",
                           "nationalPrefixFormattingRule",
                           "internationalFormat"];

  var regionCache = Object.create(null);

  // Parse an array of strings into a convenient object. We store meta
  // data as arrays since thats much more compact than JSON.
  function ParseArray(array, encoding, obj) {
    for (var n = 0; n < encoding.length; ++n) {
      var value = array[n];
      if (!value)
        continue;
      var field = encoding[n];
      var fieldAlpha = field.replace(NON_ALPHA_CHARS, "");
      if (field != fieldAlpha)
        value = new RegExp(field.replace(fieldAlpha, value));
      obj[fieldAlpha] = value;
    }
    return obj;
  }

  // Parse string encoded meta data into a convenient object
  // representation.
  function ParseMetaData(countryCode, md) {
    var array = eval(md.replace(BACKSLASH, "\\\\"));
    md = ParseArray(array,
                    META_DATA_ENCODING,
                    { countryCode: countryCode });
    regionCache[md.region] = md;
    return md;
  }

  // Parse string encoded format data into a convenient object
  // representation.
  function ParseFormat(md) {
    var formats = md.formats;
    if (!formats) {
      return null;
    }
    // Bail if we already parsed the format definitions.
    if (!(Array.isArray(formats[0])))
      return;
    for (var n = 0; n < formats.length; ++n) {
      formats[n] = ParseArray(formats[n],
                              FORMAT_ENCODING,
                              {});
    }
  }

  // Search for the meta data associated with a region identifier ("US") in
  // our database, which is indexed by country code ("1"). Since we have
  // to walk the entire database for this, we cache the result of the lookup
  // for future reference.
  function FindMetaDataForRegion(region) {
    // Check in the region cache first. This will find all entries we have
    // already resolved (parsed from a string encoding).
    var md = regionCache[region];
    if (md)
      return md;
    for (var countryCode in dataBase) {
      var entry = dataBase[countryCode];
      // Each entry is a string encoded object of the form '["US..', or
      // an array of strings. We don't want to parse the string here
      // to save memory, so we just substring the region identifier
      // and compare it. For arrays, we compare against all region
      // identifiers with that country code. We skip entries that are
      // of type object, because they were already resolved (parsed into
      // an object), and their country code should have been in the cache.
      if (Array.isArray(entry)) {
        for (var n = 0; n < entry.length; n++) {
          if (typeof entry[n] == "string" && entry[n].substr(2,2) == region) {
            if (n > 0) {
              // Only the first entry has the formats field set.
              // Parse the main country if we haven't already and use
              // the formats field from the main country.
              if (typeof entry[0] == "string")
                entry[0] = ParseMetaData(countryCode, entry[0]);
              var formats = entry[0].formats;
              var current = ParseMetaData(countryCode, entry[n]);
              current.formats = formats;
              return entry[n] = current;
            }

            entry[n] = ParseMetaData(countryCode, entry[n]);
            return entry[n];
          }
        }
        continue;
      }
      if (typeof entry == "string" && entry.substr(2,2) == region)
        return dataBase[countryCode] = ParseMetaData(countryCode, entry);
    }
  }

  // Format a national number for a given region. The boolean flag "intl"
  // indicates whether we want the national or international format.
  function FormatNumber(regionMetaData, number, intl) {
    // We lazily parse the format description in the meta data for the region,
    // so make sure to parse it now if we haven't already done so.
    ParseFormat(regionMetaData);
    var formats = regionMetaData.formats;
    if (!formats) {
      return null;
    }
    for (var n = 0; n < formats.length; ++n) {
      var format = formats[n];
      // The leading digits field is optional. If we don't have it, just
      // use the matching pattern to qualify numbers.
      if (format.leadingDigits && !format.leadingDigits.test(number))
        continue;
      if (!format.pattern.test(number))
        continue;
      if (intl) {
        // If there is no international format, just fall back to the national
        // format.
        var internationalFormat = format.internationalFormat;
        if (!internationalFormat)
          internationalFormat = format.nationalFormat;
        // Some regions have numbers that can't be dialed from outside the
        // country, indicated by "NA" for the international format of that
        // number format pattern.
        if (internationalFormat == "NA")
          return null;
        // Prepend "+" and the country code.
        number = "+" + regionMetaData.countryCode + " " +
                 number.replace(format.pattern, internationalFormat);
      } else {
        number = number.replace(format.pattern, format.nationalFormat);
        // The region has a national prefix formatting rule, and it can be overwritten
        // by each actual number format rule.
        var nationalPrefixFormattingRule = regionMetaData.nationalPrefixFormattingRule;
        if (format.nationalPrefixFormattingRule)
          nationalPrefixFormattingRule = format.nationalPrefixFormattingRule;
        if (nationalPrefixFormattingRule) {
          // The prefix formatting rule contains two magic markers, "$NP" and "$FG".
          // "$NP" will be replaced by the national prefix, and "$FG" with the
          // first group of numbers.
          var match = number.match(SPLIT_FIRST_GROUP);
          if (match) {
            var firstGroup = match[1];
            var rest = match[2];
            var prefix = nationalPrefixFormattingRule;
            prefix = prefix.replace("$NP", regionMetaData.nationalPrefix);
            prefix = prefix.replace("$FG", firstGroup);
            number = prefix + rest;
          }
        }
      }
      return (number == "NA") ? null : number;
    }
    return null;
  }

  function NationalNumber(regionMetaData, number) {
    this.region = regionMetaData.region;
    this.regionMetaData = regionMetaData;
    this.nationalNumber = number;
  }

  // NationalNumber represents the result of parsing a phone number. We have
  // three getters on the prototype that format the number in national and
  // international format. Once called, the getters put a direct property
  // onto the object, caching the result.
  NationalNumber.prototype = {
    // +1 949-726-2896
    get internationalFormat() {
      var value = FormatNumber(this.regionMetaData, this.nationalNumber, true);
      Object.defineProperty(this, "internationalFormat", { value: value, enumerable: true });
      return value;
    },
    // (949) 726-2896
    get nationalFormat() {
      var value = FormatNumber(this.regionMetaData, this.nationalNumber, false);
      Object.defineProperty(this, "nationalFormat", { value: value, enumerable: true });
      return value;
    },
    // +19497262896
    get internationalNumber() {
      var value = this.internationalFormat ? this.internationalFormat.replace(NON_DIALABLE_CHARS, "")
                                           : null;
      Object.defineProperty(this, "internationalNumber", { value: value, enumerable: true });
      return value;
    }
  };

  // Check whether the number is valid for the given region.
  function IsValidNumber(number, md) {
    return md.possiblePattern.test(number);
  }

  // Check whether the number is a valid national number for the given region.
  function IsNationalNumber(number, md) {
    return IsValidNumber(number, md) && md.nationalPattern.test(number);
  }

  // Determine the country code a number starts with, or return null if
  // its not a valid country code.
  function ParseCountryCode(number) {
    for (var n = 1; n <= 3; ++n) {
      var cc = number.substr(0,n);
      if (dataBase[cc])
        return cc;
    }
    return null;
  }

  // Parse an international number that starts with the country code. Return
  // null if the number is not a valid international number.
  function ParseInternationalNumber(number) {
    var ret;

    // Parse and strip the country code.
    var countryCode = ParseCountryCode(number);
    if (!countryCode)
      return null;
    number = number.substr(countryCode.length);

    // Lookup the meta data for the region (or regions) and if the rest of
    // the number parses for that region, return the parsed number.
    var entry = dataBase[countryCode];
    if (Array.isArray(entry)) {
      for (var n = 0; n < entry.length; ++n) {
        if (typeof entry[n] == "string")
          entry[n] = ParseMetaData(countryCode, entry[n]);
        if (n > 0)
          entry[n].formats = entry[0].formats;
        ret = ParseNationalNumber(number, entry[n])
        if (ret)
          return ret;
      }
      return null;
    }
    if (typeof entry == "string")
      entry = dataBase[countryCode] = ParseMetaData(countryCode, entry);
    return ParseNationalNumber(number, entry);
  }

  // Parse a national number for a specific region. Return null if the
  // number is not a valid national number (it might still be a possible
  // number for parts of that region).
  function ParseNationalNumber(number, md) {
    if (!md.possiblePattern.test(number) ||
        !md.nationalPattern.test(number)) {
      return null;
    }
    // Success.
    return new NationalNumber(md, number);
  }

  // Parse a number and transform it into the national format, removing any
  // international dial prefixes and country codes.
  function ParseNumber(number, defaultRegion) {
    var ret;

    // Remove formating characters and whitespace.
    number = PhoneNumberNormalizer.Normalize(number);

    // If there is no defaultRegion, we can't parse international access codes.
    if (!defaultRegion && number[0] !== '+')
      return null;

    // Detect and strip leading '+'.
    if (number[0] === '+')
      return ParseInternationalNumber(number.replace(LEADING_PLUS_CHARS_PATTERN, ""));

    // Lookup the meta data for the given region.
    var md = FindMetaDataForRegion(defaultRegion.toUpperCase());

    // See if the number starts with an international prefix, and if the
    // number resulting from stripping the code is valid, then remove the
    // prefix and flag the number as international.
    if (md.internationalPrefix.test(number)) {
      var possibleNumber = number.replace(md.internationalPrefix, "");
      ret = ParseInternationalNumber(possibleNumber)
      if (ret)
        return ret;
    }

    // This is not an international number. See if its a national one for
    // the current region. National numbers can start with the national
    // prefix, or without.
    if (md.nationalPrefixForParsing) {
      // Some regions have specific national prefix parse rules. Apply those.
      var withoutPrefix = number.replace(md.nationalPrefixForParsing,
                                         md.nationalPrefixTransformRule || '');
      ret = ParseNationalNumber(withoutPrefix, md)
      if (ret)
        return ret;
    } else {
      // If there is no specific national prefix rule, just strip off the
      // national prefix from the beginning of the number (if there is one).
      var nationalPrefix = md.nationalPrefix;
      if (nationalPrefix && number.indexOf(nationalPrefix) == 0 &&
          (ret = ParseNationalNumber(number.substr(nationalPrefix.length), md))) {
        return ret;
      }
    }
    ret = ParseNationalNumber(number, md)
    if (ret)
      return ret;

    // Now lets see if maybe its an international number after all, but
    // without '+' or the international prefix.
    ret = ParseInternationalNumber(number)
    if (ret)
      return ret;

    // If the number matches the possible numbers of the current region,
    // return it as a possible number.
    if (md.possiblePattern.test(number))
      return new NationalNumber(md, number);

    // We couldn't parse the number at all.
    return null;
  }

  function IsPlainPhoneNumber(number) {
    if (typeof number !== 'string') {
      return false;
    }

    var length = number.length;
    var isTooLong = (length > MAX_PHONE_NUMBER_LENGTH);
    var isEmpty = (length === 0);
    return !(isTooLong || isEmpty || NON_DIALABLE_CHARS_ONCE.test(number));
  }

  return {
    IsPlain: IsPlainPhoneNumber,
    Parse: ParseNumber,
  };
})(PHONE_NUMBER_META_DATA);

(function(global) {

  'use strict';

  var Conducto;
  if (typeof module !== 'undefined' && module.exports)
    Conducto = require('conducto-client');
  else
    Conducto = global.conducto.Client;

  var defaultConfig = {
    host: 'happy.dev.ym.ms',
    port: 443,
    secure: true,
    turn: {}
  };

  var UppTalk = function(config) {
    if (typeof config === 'object') {
      for (var i in defaultConfig) {
        if (!(i in config))
          config[i] = defaultConfig[i];
      }
    }
    else {
      config = defaultConfig;
    }

    if (config.apikey) {
      config.query = {
        apikey: config.apikey
      };
      this.apikey = config.apikey;
    }

    Conducto.call(this, config);

    for (var j in actions) {
      this.defineAction(j, actions[j]);
    }

    //webrtc enabled
    if (this.call) {
      this.turn = config.turn;
      this.on('webrtc', function(p) {
        this.handleWebRTCPacket(p);
      });
    }
    else {
      this.on('webrtc', function(p) {
        if (p.type !== 'error')
          this.send('webrtc', {id: p.id, user: p.user, type: 'error'});
      });
    }
  };
  UppTalk.prototype = Conducto.prototype;

  var actions = {
    upload: function(file, callback, progress) {
      this.HTTPRequest({method: 'post', path: '/media', body: file}, callback, progress);
    }
  };

  if (typeof module !== 'undefined' && module.exports)
    module.exports = UppTalk;
  else
    global.UppTalk = UppTalk;

})(this);


(function(global) {

  'use strict';

  var RTCPeerConnection = (
    window.RTCPeerConnection ||
    window.mozRTCPeerConnection ||
    window.webkitRTCPeerConnection
  );
  navigator.getUserMedia = (
    navigator.getUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.webkitGetUserMedia
  );
  var RTCSessionDescription = (
    window.RTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.mozRTCSessionDescription
  );
  var RTCIceCandidate = (
    window.RTCIceCandidate ||
    window.webkitRTCIceCandidate ||
    window.mozRTCIceCandidate
  );

  var UppTalk = global.UppTalk;
  var EventEmitter = global.EventEmitter;

  if (
    !RTCPeerConnection ||
    !navigator.getUserMedia ||
    !RTCSessionDescription ||
    !RTCIceCandidate ||
    !EventEmitter ||
    !UppTalk
  )
    return;

  // var configuration = {
  //   "iceServers": [
  //     // {
  //     //   "url": "stun:stun.services.mozilla.com"
  //     // },
  //     // {
  //     //   "url": "stun:stun.ym.ms"
  //     // },
  //     {
  //       url: global.config.turn.url,
  //       username: global.config.turn.username,
  //       credential: global.config.turn.credential
  //     }
  //     //sturn
  //     // {
  //     //   "url": "stun:stun.ym.ms"
  //     // },
  //     //turn udp
  //     // {
  //     //   'url': 'turn:dev.ym.ms:3478?transport=udp',
  //     //   "username": "sonny",
  //     //   "credential": "foobar"
  //     // },
  //     //turn tcp
  //     // {
  //     //   'url': 'turn:turn:dev.ym.ms:3478?transport=tcp',
  //     //   "username": "sonny",
  //     //   "credential": "foobar"
  //     // }
  //   ]
  // };
  var options = {
    optional: [
      {DtlsSrtpKeyAgreement: true}, //required to interop Firefox and Chrome
      {RtpDataChannels: true} //enable DataChannels API on Firefox.
    ]
  };

  var Call = function(client, user) {
    this.id = Math.random().toString();
    this.user = user;
    this.client = client;
    EventEmitter.call(this);
  };
  Call.prototype = EventEmitter.prototype;
  Call.prototype.init = function(callback) {

    var call = this;

    var configuration = {
      "iceServers": [
        {
          url: call.client.turn.url,
          username: call.client.turn.username,
          credential: call.client.turn.credential
        }
      ]
    };

    console.log('PeerConnection configuration', configuration);

    var pc = new RTCPeerConnection(configuration, options);
    this.peerConnection = pc;

    pc.onicecandidate = function(evt) {
      call.send({candidate: evt.candidate});
    };
    pc.onaddstream = function(evt) {
      call.emit('remotestream', evt.stream);
    };

    if (this.localstream) {
      pc.addStream(this.localstream);
      if (callback)
        callback();
    }
    else {
      navigator.getUserMedia({video: true, audio: true},
        //success
        function (stream) {
          call.emit('localstream', stream);
          pc.addStream(stream);
          if (callback)
            callback();
        },
        //error
        function(err) {
          call.emit('error', err);
        }
      );
    }
  };
  Call.prototype.accept = function() {
    this.client.send('webrtc', {id: this.id, user: this.user, type: 'accept'});

    var call = this;

    this.init(function() {
      call.peerConnection.createAnswer(
        //success
        function(desc) {
          call.onlocaldescription(desc);
        },
        //error required by firefox 26
        function(err) {
          call.emit('error', err);
        }
      );
    });
  };
  Call.prototype.reject = function() {
    this.send({type: 'reject'});
    delete this.client.calls[this.id];
  };
  Call.prototype.hangup = function() {
    this.send({type: 'hangup'});
    delete this.client.calls[this.id];
  };
  Call.prototype.offer = function() {
    this.send({type: 'offer'});
  };
  Call.prototype.oncandidate = function(candidate) {
    var RIC = new RTCIceCandidate(candidate);
    this.peerConnection.addIceCandidate(RIC);
  };
  Call.prototype.onlocaldescription = function(desc) {
    this.peerConnection.setLocalDescription(desc);
    this.send({sdp: desc});
  };
  Call.prototype.onremotedescription = function(desc) {
    this.peerConnection.setRemoteDescription(new RTCSessionDescription(desc));
  };
  Call.prototype.send = function(m) {
    m.id = this.id;
    m.user = this.user;
    this.client.send('webrtc', m);
  };
  Call.prototype.onaccept = function() {
    this.emit('accept');

    var call = this;

    this.init(function() {
      call.peerConnection.createOffer(
        //success
        function(desc) {
          call.onlocaldescription(desc);
        },
        //error required by firefox 26
        function(err) {
          call.emit('error', err);
        }
      );
    });
  };
  Call.prototype.onreject = function() {
    this.emit('reject');
    delete this.client.calls[this.id];
  };
  Call.prototype.onhangup = function() {
    this.emit('hangup');
    delete this.client.calls[this.id];
  };


  UppTalk.prototype.handleWebRTCPacket = function(p) {
    if (typeof p.user !== 'string' || typeof p.id !== 'string')
      return;

    this.calls = this.calls || {};

    var call = this.calls[p.id];

    //a new call offer is received
    if (!call && p.type === 'offer') {
      call = new Call(this, p.user);
      call.id = p.id;
      this.calls[call.id] = call;
      this.emit('call', call);
    }

    //this call doesn't exist, offer is required first
    if (!call)
      return;

    //spoof
    if (call.user !== p.user)
      return;

    if (p.type === 'accept') {
      call.onaccept();
    }
    else if (p.type === 'reject') {
      call.onreject();
    }
    else if (p.type === 'hangup') {
      call.onhangup();
    }
    //sdp info
    else if (p.sdp) {
      call.onremotedescription(p.sdp);
    }
    //candidate info
    else if (p.candidate) {
      call.oncandidate(p.candidate);
    }
  };
  UppTalk.prototype.call = function(username, stream) {
    var call = new Call(this, username);
    this.calls = this.calls || {};
    this.calls[call.id] = call;
    call.offer();
    call.localstream = stream;
    return call;
  };

})(this);