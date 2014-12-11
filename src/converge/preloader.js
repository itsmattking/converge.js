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
