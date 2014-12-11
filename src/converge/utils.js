define('converge/utils',

       ['converge/constants'],

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

  return {
    findTransitionProperties: findTransitionProperties,
    addClass: addClass,
    removeClass: removeClass,
    classesFrom: classesFrom,
    cleanArray: cleanArray,
    removeNegationClasses: removeNegationClasses,
    isInArray: isInArray,
    findCommonParent: findCommonParent
  };

});
