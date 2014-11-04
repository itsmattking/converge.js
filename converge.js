(function(window) {

  var TRANSITION_EVENT = 'transitionend';
  var TRANSITION_PROPERTY = 'transition-property';

  var transitionable = (function() {
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
  
  function findTransitionProperties(el) {
    var out = [],
        prop = window.getComputedStyle(el)[TRANSITION_PROPERTY];
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

  function findAllTransitionProperties(els) {
    var props = [];
    for (var i = 0; i < els.length; i++) {
      var prop = findTransitionProperties(els[i]);
      for (var j = 0; j < prop.length; j++) {
        if (props.indexOf(prop[j]) === -1) {
          props.push(prop[j]);
        }
      }
    }
    return props;
  }

  function cleanArray(arr) {
    var newarr = [];
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].indexOf('-') === -1) {
        newarr.push(arr[i]);
      }
    }
    return newarr;
  }

  function isInArray(arr1, arr2) {
    for (var i = 0; i < arr1.length; i++) {
      if (arr2.indexOf(arr1[i]) === -1) {
        return false;
      }
    }
    return true;
  }

  function intoArray(thing) {
    if (typeof thing === 'undefined') {
      thing = [];
    }
    if ((thing instanceof NodeList) ||
        window.jQuery && (thing instanceof window.jQuery)) {
      thing = Array.prototype.slice.call(thing);
    } else if (!(thing instanceof Array)) {
      thing = [thing];
    }
    return thing;
  }

  function parentAt(el, level) {
    for (var i = 0; i < level; i++) {
      if (!el.parentNode || el === document.body) {
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
      if (found.length === 0) {
        this.els = [];
        if ((typeof this.deferredEls === 'undefined')) {
          this.deferredEls = els;
        } else {
          this.deferredEls = null;
        }
      } else {
        this.els = intoArray(found);
      }
    } else {
      this.els = intoArray(els);
    }
    this.parent = findCommonParent(this.els);
  };

  Root.prototype.alter = function(cls) {
    if (arguments.length > 1) {
      this.classes.push(Array.prototype.slice.call(arguments));
    } else {
      this.classes.push(intoArray(cls));
    }
    return this;
  };

  Root.prototype.then = function(fn) {
    if (arguments.length > 1) {
      this.callbacks.push(Array.prototype.slice.call(arguments));
    } else {
      this.callbacks.push(intoArray(fn));
    }
    return this;
  };

  Root.prototype.stagger = function(ms, buff) {
    this.timings.push([(ms || 0), (buff || 0)]);
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
        self = this;

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
        e.target.transitionsToFulfill = findTransitionProperties(e.target);
      }
      if (e.target.fulfilledTransitions.indexOf(e.propertyName) === -1) {
        e.target.fulfilledTransitions.push(e.propertyName);
      }
      if (e.target.fulfilledTransitions.length === e.target.transitionsToFulfill.length) {
        e.target.fulfilledTransitions = [];
        return true;
      } else {
        return false;
      }
    };

    var transitionCallback = function(e) {
      if (els.indexOf(e.target) !== -1 &&
          isInArray(cleanArray(classes), Array.prototype.slice.call(e.target.classList)) &&
          hasFulfilledAllTransitions(e)) {
        len--;
        if (len <= 0) {
          parent.removeEventListener(TRANSITION_EVENT, transitionCallback);
          runCallbacks();
        }
      }
    };

    var alterClasses = function() {
      for (var i = 0; i < els.length; i++) {
        window.setTimeout(function(el) {
          return function() {
            for (var j = 0; j < classes.length; j++) {
              if (classes[j].indexOf('-') === 0) {
                el.classList.remove(classes[j].slice(1));
              } else {
                el.classList.add(classes[j]);
              }
            }
          };
        }(els[i]), timing[1] + (i * timing[0]));
      }
    };

    if (transitionable) {
      parent.addEventListener(TRANSITION_EVENT, transitionCallback);
      window.setTimeout(alterClasses, 15);
    } else {
      alterClasses();
      runCallbacks();
    }

    return null;

  };

  function Preloader(src) {
    this.src = src;
    this.callbacks = [];
  }

  Preloader.prototype.then = function(fn) {
    this.callbacks.push(fn);
  };

  Preloader.prototype.run = function() {
    this.img = new window.Image();

    var self = this;

    var runCallbacks = function() {
      for (var i = 0; i < self.callbacks.length; i++) {
        self.callbacks[i](this);
      }
    };

    this.img.onload = this.img.onerror = runCallbacks;

    this.img.src = this.src;
  };

  function RootWrapper(els) {
    this.chain = [];
    if (els) {
      this.on(els);
    }
    return this;
  };

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

  RootWrapper.prototype.then = function() {
    this.currentRoot().then.apply(this.currentRoot(),
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

  window.converge = {
    preload: function(src) {
      var wrapper = new RootWrapper();
      return wrapper.preload(src);
    },
    on: function(els) {
      return new RootWrapper(els);
    }
  };

}(window));
