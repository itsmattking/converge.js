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
    this.parent = utils.findCommonParent(this.els);
    this.willTransition = utils.willTransition(this.els);
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
