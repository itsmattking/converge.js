define('converge/shims',

       [],

function() {

  /* Define Array.prototype.slice for IE < 9 */
  /* Taken from https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/slice */
  (function () {
    'use strict';
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
