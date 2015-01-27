(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        //Allow using this built library as an AMD module
        //in another project. That other project will only
        //see this AMD call, not the internal modules in
        //the closure below.
        define(factory);
    } else {
        //Browser globals case. Just assign the
        //result to a property on the global.
        root.converge = factory();
    }
}(this, function () {
    //almond, and your modules will be inlined here
/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../node_modules/almond/almond", function(){});

define('converge/constants',

       [],

function() {

  var TRANSITION_EVENT = 'transitionend';
  var TRANSITION_PROPERTY = 'transition-property';

  var TRANSITIONABLE = (function() {
    var b = document.body || document.documentElement,
        s = b.style,
        p = 'transition',
        v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];

    if (typeof s[p] === 'string') {
      var computed = window.getComputedStyle(b);
      if (typeof b[TRANSITION_PROPERTY] !== 'string') {
        for (var i = 0; i < v.length; i++) {
          if (typeof computed[v[i] + 'TransitionProperty'] === 'string') {
            TRANSITION_PROPERTY = v[i] + 'TransitionProperty';
          }
        }
      }
      return true;
    }

    p = p.charAt(0).toUpperCase() + p.substr(1);

    for (var i = 0; i < v.length; i++) {
      if (typeof s[v[i] + p] === 'string') {
        TRANSITION_EVENT = v[i] + p + 'End';
        TRANSITION_PROPERTY = v[i] + 'TransitionProperty';
        return true;
      }
    }

    return false;

  }());

  return {
    TRANSITION_EVENT: TRANSITION_EVENT,
    TRANSITION_PROPERTY: TRANSITION_PROPERTY,
    TRANSITIONABLE: TRANSITIONABLE
  };

});

define('converge/shims',

       [],

function() {

  /* Define Array.prototype.slice for IE < 9 */
  /* Taken from https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/slice */
  (function () {
    
    var _slice = Array.prototype.slice;

    try {
      // Can't be used with DOM elements in IE < 9
      _slice.call(document.documentElement);
    } catch (e) { // Fails in IE < 9
      // This will work for genuine arrays, array-like objects, 
      // NamedNodeMap (attributes, entities, notations),
      // NodeList (e.g., getElementsByTagName), HTMLCollection (e.g., childNodes),
      // and will not fail on other DOM objects (as do DOM elements in IE < 9)
      Array.prototype.slice = function(begin, end) {
        // IE < 9 gets unhappy with an undefined end argument
        end = (typeof end !== 'undefined') ? end : this.length;

        // For native Array objects, we use the native slice function
        if (Object.prototype.toString.call(this) === '[object Array]'){
          return _slice.call(this, begin, end);
        }

        // For array like object we handle it ourselves.
        var i, cloned = [],
            size, len = this.length;

        // Handle negative value for "begin"
        var start = begin || 0;
        start = (start >= 0) ? start: len + start;

        // Handle negative value for "end"
        var upTo = (end) ? end : len;
        if (end < 0) {
          upTo = len + end;
        }

        // Actual expected size of the slice
        size = upTo - start;

        if (size > 0) {
          cloned = new Array(size);
          if (this.charAt) {
            for (i = 0; i < size; i++) {
              cloned[i] = this.charAt(start + i);
            }
          } else {
            for (i = 0; i < size; i++) {
              cloned[i] = this[start + i];
            }
          }
        }

        return cloned;
      };
    }
  }());

  return {};

});

define('converge/utils',

       ['converge/constants',
        'converge/shims'],

function(constants) {

  function findTransitionProperties(el) {
    var out = [],
        prop = window.getComputedStyle(el)[constants.TRANSITION_PROPERTY];
    if (prop) {
      var props = prop.split(',');
      for (var i = 0; i < props.length; i++) {
        var p = props[i].replace(/\s+/, '');
        if (p !== 'all') {
          out.push(p);
        }
      }
    }
    return out;
  }

  function willTransition(els) {
    if (!constants.TRANSITIONABLE) {
      return false;
    }

    els = els || [];
    var check = false;
    for (var i = 0; i < els.length; i++) {
      if (findTransitionProperties(els[i]).length) {
        check = true;
        break;
      }
    }
    return check;
  }

  function addClass(el, cls) {
    if (el && cls) {
      if (el.classList) {
        el.classList.add(cls);
      } else {
        el.className = classesFrom(el).concat(cls).join(' ');
      }
    }
  }

  function removeClass(el, cls) {
    if (el && cls) {
      if (el.classList) {
        el.classList.remove(cls);
      } else {
        el.className = cleanArray(classesFrom(el), function(item) {
          return item !== cls;
        }).join(' ');
      }
    }
  }

  function classesFrom(el) {
    if (el) {
      if (el.classList) {
        return Array.prototype.slice.call(el.classList);
      } else {
        return el.className.split(/\s+/);
      }
    } else {
      return [];
    }
  }

  function cleanArray(arr, fn) {
    var newarr = [];
    for (var i = 0; i < arr.length; i++) {
      if (fn.call(arr[i], arr[i]) === true) {
        newarr.push(arr[i]);
      }
    }
    return newarr;
  }

  function removeNegationClasses(arr) {
    return cleanArray(arr, function(item) {
      return item.indexOf('-') === -1;
    });
  }

  function isInArray(arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
      if (arr2.indexOf(arr1[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  function parentAt(el, level) {
    for (var i = 0; i < level; i++) {
      if (!el || !el.parentNode || el === document.body) {
        break;
      }
      el = el.parentNode;
    }
    return el;
  }

  function hasCommonParent(el, level, common) {
    return (parentAt(el, level) === common);
  }

  function findCommonParent(els) {
    var lastParent,
        level = 1;
    for (var i = 0; i < els.length; i++) {
      if (!lastParent) {
        lastParent = parentAt(els[i], level);
        continue;
      }
      if (lastParent && !hasCommonParent(els[i], level, lastParent)) {
        lastParent = null;
        level++;
        i = 0;
      }
    }
    return lastParent || document.body;
  }

  return {
    findTransitionProperties: findTransitionProperties,
    addClass: addClass,
    removeClass: removeClass,
    classesFrom: classesFrom,
    cleanArray: cleanArray,
    removeNegationClasses: removeNegationClasses,
    isInArray: isInArray,
    findCommonParent: findCommonParent,
    willTransition: willTransition
  };

});

define('converge/preloader',

       ['converge/utils'],

function(utils) {

  function Preloader() {
    var args = Array.prototype.slice.call(arguments);
    this.src = utils.cleanArray(args, function(item) {
      return typeof item === 'string';
    });
    this.callbacks = [];
    this.individualCallbacks = [];
  }

  Preloader.prototype.then = function(fn) {
    fn = fn || function() {};
    this.callbacks.push(fn);
  };

  Preloader.prototype.thenEach = function(fn) {
    fn = fn || function() {};
    this.individualCallbacks.push(fn);
  };

  Preloader.prototype.run = function() {
    var src = this.src,
        total = src.length,
        self = this;

    var handleImageLoad = function() {
      runIndividualCallbacks(this.originalSrc, this);
      total--;
      if (total <= 0) {
        runCallbacks();
      }
    };

    var runIndividualCallbacks = function(src, img) {
      for (var i = 0; i < self.individualCallbacks.length; i++) {
        self.individualCallbacks[i](src, img);
      }
    };

    var runCallbacks = function() {
      for (var i = 0; i < self.callbacks.length; i++) {
        self.callbacks[i](src);
      }
    };

    var loadImage = function(src) {
      var img = new window.Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageLoad;
      img.originalSrc = src;
      img.src = src;
    };

    if (src.length) {
      for (var i = 0; i < src.length; i++) {
        loadImage(src[i]);
      }
    } else {
      runCallbacks();
    }

  };

  return Preloader;

});

define('converge/event-container',

       [],

function() {

  function EventContainer(opts) {
    this.nextRun = opts.nextRun;
    this.waitForContinue = false;
  }
  
  EventContainer.prototype.resume = function() {
    this.waitForContinue = false;
    return this.nextRun();
  };

  EventContainer.prototype.wait = function() {
    this.waitForContinue = true;
  };

  return EventContainer;

});

define('converge/root',

       ['converge/utils',
        'converge/constants',
        'converge/event-container'],

function(utils,
         constants,
         EventContainer) {

  function Root(els) {
    this.processElements(els);
    this.classes = [];
    this.callbacks = [];
    this.timings = [];
    return this;
  }

  Root.prototype.processElements = function(els) {
    if (typeof els === 'string') {
      var found = document.querySelectorAll(els);
      if (found && found.length === 0) {
        this.els = [];
        if ((typeof this.deferredEls === 'undefined')) {
          this.deferredEls = els;
        } else {
          this.deferredEls = null;
        }
      } else {
        this.els = Array.prototype.slice.call(found || []);
      }
    } else {
      this.els = Array.prototype.slice.call(els);
    }
    this.willTransition = utils.willTransition(this.els);
    if (this.willTransition) {
      this.parent = utils.findCommonParent(this.els);
    }
  };

  Root.prototype.alter = function() {
    var args = Array.prototype.slice.call(arguments);
    this.classes.push(utils.cleanArray(args, function(item) {
      return typeof item === 'string';
    }));
    return this;
  };

  Root.prototype.thenEach = function(fn) {
    return this;
  };

  Root.prototype.then = function(fn) {
    var args = Array.prototype.slice.call(arguments);
    this.callbacks.push(utils.cleanArray(args, function(item) {
      return typeof item === 'function';
    }));
    return this;
  };

  Root.prototype.stagger = function(ms, delayMs) {
    ms = ms || 0;
    delayMs = delayMs || 0;
    this.timings.push([ms, delayMs]);
    return this;
  };

  Root.prototype.delay = function(ms) {
    ms = ms || 0;
    this.timings.push([0, ms]);
    return this;
  };

  Root.prototype.run = function(current) {

    if (this.deferredEls) {
      this.processElements(this.deferredEls);
    }

    current = current || 0;

    var total = this.classes.length,
        parent = this.parent,
        callbacks = this.callbacks[current] || [],
        classes = this.classes[current] || [],
        timing = this.timings[current] || [0, 0],
        els = this.els,
        len = this.els.length,
        self = this,
        willTransition = this.willTransition;

    var nextRun = function() {
      if (current + 1 < total) {
        self.run(current + 1);
      } else {
        flushCallbacks(current + 1);
      }
    };

    var eventContainer = new EventContainer({
      nextRun: nextRun
    });

    var flushCallbacks = function(start) {
      for (var i = start; i < self.callbacks.length; i++) {
        for (var j = 0; j < self.callbacks[i].length; j++) {
          self.callbacks[i][j](eventContainer, els);
        }
      }
    };

    var runCallbacks = function() {
      for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](eventContainer, els);
      }
      if (!eventContainer.waitForContinue) {
        nextRun();
      }
    };

    var hasFulfilledAllTransitions = function(e) {
      if (!e.target.fulfilledTransitions) {
        e.target.fulfilledTransitions = [];
        e.target.transitionsToFulfill = utils.findTransitionProperties(e.target);
      }
      if (e.target.fulfilledTransitions.indexOf(e.propertyName) === -1) {
        e.target.fulfilledTransitions.push(e.propertyName);
      }
      if (e.target.transitionsToFulfill.length === 0 ||
          (e.target.fulfilledTransitions.length >= e.target.transitionsToFulfill.length)) {
        e.target.fulfilledTransitions = [];
        return true;
      } else {
        return false;
      }
    };

    var transitionCallback = function(e) {
      if (els.indexOf(e.target) !== -1 &&
          utils.isInArray(utils.removeNegationClasses(classes), utils.classesFrom(e.target)) &&
          hasFulfilledAllTransitions(e)) {
        len--;
        if (len <= 0) {
          parent.removeEventListener(constants.TRANSITION_EVENT, transitionCallback);
          runCallbacks();
        }
      }
    };

    var alterClasses = function() {
      var finished = 0;
      var createHandler = function(el) {
          return function() {
            for (var j = 0; j < classes.length; j++) {
              if (classes[j].indexOf('-') === 0) {
                utils.removeClass(el, classes[j].slice(1));
              } else {
                utils.addClass(el, classes[j]);
              }
            }
            if (!willTransition) {
              finished++;
              if (finished >= els.length && !willTransition) {
                runCallbacks();
              }
            }
          };
        };

      for (var i = 0; i < els.length; i++) {
        window.setTimeout(createHandler(els[i]), (i * timing[0]) + timing[1]);
      }
    };

    if (this.willTransition) {
      parent.addEventListener(constants.TRANSITION_EVENT, transitionCallback);
    }

    window.setTimeout(alterClasses, 15);

    return null;

  };

  return Root;

});

define('converge/root-wrapper',

       ['converge/preloader',
        'converge/root'],

function(Preloader,
         Root) {

  function RootWrapper(els) {
    this.chain = [];
    if (els) {
      this.on(els);
    }
    return this;
  }

  RootWrapper.prototype.preload = function(src) {
    this.chain.push(new Preloader(src));
    return this;
  };

  RootWrapper.prototype.on = function(els) {
    this.chain.push(new Root(els));
    return this;
  };
  RootWrapper.prototype.thenOn = RootWrapper.prototype.on;

  RootWrapper.prototype.currentRoot = function() {
    return this.chain[this.chain.length - 1];
  };

  RootWrapper.prototype.alter = function() {
    this.currentRoot().alter.apply(this.currentRoot(),
      Array.prototype.slice.call(arguments)
    );
    return this;
  };

  RootWrapper.prototype.stagger = function() {
    this.currentRoot().stagger.apply(this.currentRoot(),
      Array.prototype.slice.call(arguments)
    );
    return this;
  };

  RootWrapper.prototype.delay = function() {
    this.currentRoot().delay.apply(this.currentRoot(),
      Array.prototype.slice.call(arguments)
    );
    return this;
  };

  RootWrapper.prototype.then = function() {
    this.currentRoot().then.apply(this.currentRoot(),
      Array.prototype.slice.call(arguments)
    );
    return this;
  };

  RootWrapper.prototype.thenEach = function() {
    this.currentRoot().thenEach.apply(this.currentRoot(),
      Array.prototype.slice.call(arguments)
    );
    return this;
  };

  RootWrapper.prototype.run = function(current) {
    current = current || 0;

    var total = this.chain.length,
        self = this;

    var nextRun = function() {
      if (current + 1 < total) {
        self.run(current + 1);
      }
    };

    this.chain[current].then(nextRun);
    this.chain[current].run();
  };

  return RootWrapper;

});

define('converge',

       ['converge/root-wrapper'],

function(RootWrapper) {

  return {
    preload: function(src) {
      var wrapper = new RootWrapper();
      return wrapper.preload(src);
    },
    on: function(els) {
      return new RootWrapper(els);
    }
  };

});

    //The modules for your project will be inlined above
    //this snippet. Ask almond to synchronously require the
    //module value for 'main' here and return it as the
    //value to use for the public API for the built file.
    return require('converge');
}));