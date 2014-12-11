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
