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

  function addClass(el, cls) {
    if (el.classList) {
      el.classList.add(cls);
    } else {
      el.className = classesFrom(el).concat(cls).join(' ');
    }
  }

  function removeClass(el, cls) {
    if (el.classList) {
      el.classList.remove(cls);
    } else {
      el.className = cleanArray(classesFrom(el), function(item) {
        return item !== cls;
      }).join(' ');
    }
  }

  function classesFrom(el) {
    if (el.classList) {
      return Array.prototype.slice.call(el.classList);
    } else {
      return el.className.split(/\s+/);
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
        this.els = Array.prototype.slice.call(found);
      }
    } else {
      this.els = Array.prototype.slice.call(els);
    }
    this.parent = findCommonParent(this.els);
  };

  Root.prototype.alter = function() {
    var args = Array.prototype.slice.call(arguments);
    this.classes.push(cleanArray(args, function(item) {
      return typeof item === 'string';
    }));
    return this;
  };

  Root.prototype.thenEach = function(fn) {
    return this;
  };

  Root.prototype.then = function(fn) {
    var args = Array.prototype.slice.call(arguments);
    this.callbacks.push(cleanArray(args, function(item) {
      return typeof item === 'function';
    }));
    return this;
  };

  Root.prototype.stagger = function(ms, buff) {
    if (!transitionable) {
      ms = buff = 0;
    } else {
      ms = ms || 0;
      buff = buff || 0;
    }
    this.timings.push([ms, buff]);
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
          isInArray(removeNegationClasses(classes), classesFrom(e.target)) &&
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
                removeClass(el, classes[j].slice(1));
              } else {
                addClass(el, classes[j]);
              }
            }
          };
        }(els[i]), (i * timing[0]) + timing[1]);
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

  function Preloader() {
    var args = Array.prototype.slice.call(arguments);
    this.src = cleanArray(args, function(item) {
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
