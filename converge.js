(function(window) {

  var TRANSITION_EVENT = 'transitionend';

  var transitionable = (function() {
    var b = document.body || document.documentElement,
        s = b.style,
        p = 'transition';

    if (typeof s[p] === 'string') {
      return true;
    }

    var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
    p = p.charAt(0).toUpperCase() + p.substr(1);

    for (var i = 0; i < v.length; i++) {
      if (typeof s[v[i] + p] === 'string') {
        TRANSITION_EVENT = v[i] + p + 'End';
        return true;
      }
    }

    return false;
  }());
  
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
    if (thing instanceof NodeList) {
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
    return lastParent;
  }

  function EventContainer(opts) {
    this.nextRun = opts.nextRun;
    this.waitForContinue = false;
  }
  
  EventContainer.prototype.continue = function() {
    this.waitForContinue = false;
    return this.nextRun();
  };

  EventContainer.prototype.wait = function() {
    this.waitForContinue = true;
  };

  function Root(els) {
    if (typeof els === 'string') {
      els = document.querySelectorAll(els);
    }
    this.classes = [];
    this.callbacks = [];
    this.timings = [];
    this.els = intoArray(els);
    this.parent = findCommonParent(this.els);
    return this;
  }

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
        flushCallbacks();
      }
    };

    var eventContainer = new EventContainer({
      nextRun: nextRun
    });

    var flushCallbacks = function() {
      for (var i = current; i < self.callbacks.length; i++) {
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

    var transitionCallback = function(e) {
      if (els.indexOf(e.target) !== -1 &&
         isInArray(cleanArray(classes), Array.prototype.slice.call(e.target.classList))) {
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

  function RootWrapper(els) {
    this.chain = [];
    this.on(els);
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

  window.converge = function(els) {
    return new RootWrapper(els);
  };

}(window));
