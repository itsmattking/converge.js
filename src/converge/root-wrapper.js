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
