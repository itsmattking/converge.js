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
